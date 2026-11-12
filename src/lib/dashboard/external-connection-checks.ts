import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { probeBucket, r2Config } from "@/lib/media/r2-storage";
import { publicReadClient, serviceRoleClient } from "@/lib/supabase/supabase-clients";

import type { ConnectionReport, ConnectionStatus } from "./external-connection-types";

/*
 * Live probes for every external service the site talks to. Each probe makes
 * the smallest request that proves the service answers with the configured
 * credentials, gives up after a few seconds, and reports only names and hosts —
 * never a key.
 */

const TIMEOUT_MS = 6000;

/** Errors PostgREST returns when the migrations have not been run. */
const MISSING_SCHEMA = new Set(["PGRST205", "42P01"]);

const missing = (names: string[]) => names.filter((name) => !process.env[name]);

const hostOf = (value: string | undefined): string | null => {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return value;
  }
};

const elapsed = (start: number) => Math.round(performance.now() - start);

const describe = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      return `No answer within ${TIMEOUT_MS / 1000}s`;
    }
    return error.message;
  }
  return String(error);
};

type ProbeBase = Pick<ConnectionStatus, "id" | "label" | "purpose">;

/** Reads the one settings row; enough to tell reachable, migrated and published apart. */
async function probeSupabase(
  base: ProbeBase,
  client: SupabaseClient | null,
  requiredEnv: string[],
): Promise<ConnectionStatus> {
  const target = hostOf(process.env.SUPABASE_URL);
  if (!client) {
    return {
      ...base,
      state: "unconfigured",
      detail: "Not configured",
      target,
      latencyMs: null,
      missingEnv: missing(requiredEnv),
    };
  }

  const start = performance.now();
  try {
    const { data, error, status } = await client
      .from("site_settings")
      .select("revision")
      .eq("id", 1)
      .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
      .maybeSingle();
    const latencyMs = elapsed(start);
    const result = { ...base, target, latencyMs, missingEnv: [] };

    if (!error) {
      return data
        ? { ...result, state: "ok", detail: `Connected · published revision ${data.revision}` }
        : { ...result, state: "warning", detail: "Connected · nothing published yet" };
    }
    if (error.code && MISSING_SCHEMA.has(error.code)) {
      return { ...result, state: "warning", detail: "Connected · tables missing, run the migrations" };
    }
    if (status === 401 || status === 403) {
      return { ...result, state: "error", detail: `Key rejected (${status}): ${error.message}` };
    }
    /* No PostgREST code means the request never got an answer: paused project, DNS, network. */
    const detail = error.code
      ? `Query failed (${error.code}): ${error.message}`
      : `Unreachable: ${error.message || "no response"} — is the project paused?`;
    return { ...result, state: "error", detail };
  } catch (error) {
    return {
      ...base,
      state: "error",
      detail: `Unreachable: ${describe(error)}`,
      target,
      latencyMs: elapsed(start),
      missingEnv: [],
    };
  }
}

async function probeStorage(): Promise<ConnectionStatus> {
  const base: ProbeBase = {
    id: "storage",
    label: "Media storage",
    purpose: "Cloudflare R2 bucket that dashboard uploads are written to",
  };
  const config = r2Config();
  if (!config) {
    return {
      ...base,
      state: "unconfigured",
      detail: "Not configured — uploads are off",
      target: hostOf(process.env.R2_ENDPOINT),
      latencyMs: null,
      missingEnv: missing([
        "R2_ENDPOINT",
        "R2_BUCKET",
        "R2_ACCESS_KEY_ID",
        "R2_SECRET_ACCESS_KEY",
        "NEXT_PUBLIC_MEDIA_BASE_URL",
      ]),
    };
  }

  const target = `${new URL(config.endpoint).host}/${config.bucket}`;
  const start = performance.now();
  try {
    await probeBucket(config, AbortSignal.timeout(TIMEOUT_MS));
    return {
      ...base,
      state: "ok",
      detail: `Connected · bucket "${config.bucket}" readable`,
      target,
      latencyMs: elapsed(start),
      missingEnv: [],
    };
  } catch (error) {
    return {
      ...base,
      state: "error",
      detail: describe(error),
      target,
      latencyMs: elapsed(start),
      missingEnv: [],
    };
  }
}

/**
 * The public address images are served from. Any HTTP answer means the host is
 * up — an r2.dev root answers 404 by design — so only a network failure or a
 * 5xx counts as down.
 */
async function probeMediaCdn(): Promise<ConnectionStatus> {
  const base: ProbeBase = {
    id: "media-cdn",
    label: "Media delivery",
    purpose: "Public address the browser loads uploaded images and videos from",
  };
  const baseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  if (!baseUrl) {
    return {
      ...base,
      state: "unconfigured",
      detail: "Not configured",
      target: null,
      latencyMs: null,
      missingEnv: ["NEXT_PUBLIC_MEDIA_BASE_URL"],
    };
  }

  const target = hostOf(baseUrl);
  const start = performance.now();
  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/`, {
      method: "HEAD",
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const latencyMs = elapsed(start);
    const state = response.status >= 500 ? "error" : "ok";
    const detail =
      state === "ok"
        ? `Reachable · HTTP ${response.status}`
        : `Server error · HTTP ${response.status}`;
    return { ...base, state, detail, target, latencyMs, missingEnv: [] };
  } catch (error) {
    return {
      ...base,
      state: "error",
      detail: `Unreachable: ${describe(error)}`,
      target,
      latencyMs: elapsed(start),
      missingEnv: [],
    };
  }
}

/** Runs every probe in parallel; one slow service never holds up the others' results. */
export async function checkAllConnections(): Promise<ConnectionReport> {
  const connections = await Promise.all([
    probeSupabase(
      {
        id: "database",
        label: "Database (dashboard)",
        purpose: "Supabase with the service role key — reads drafts and publishes",
      },
      serviceRoleClient(),
      ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    ),
    probeSupabase(
      {
        id: "public-read",
        label: "Database (public site)",
        purpose: "Supabase with the anon key — what visitors' pages read",
      },
      publicReadClient(),
      ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
    ),
    probeStorage(),
    probeMediaCdn(),
  ]);

  return { checkedAt: new Date().toISOString(), connections };
}
