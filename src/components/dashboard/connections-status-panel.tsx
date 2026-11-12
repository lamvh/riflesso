"use client";

import { useEffect, useState, useTransition } from "react";

import { checkExternalConnections } from "@/lib/dashboard/check-external-connections";
import type {
  ConnectionReport,
  ConnectionState,
  ConnectionStatus,
} from "@/lib/dashboard/external-connection-types";

import { Button, StatusPill, type Tone } from "./ui/controls";
import { Panel } from "./ui/panel";

const STATE_PILL: Record<ConnectionState, [Tone, string]> = {
  ok: ["live", "Connected"],
  warning: ["draft", "Needs attention"],
  error: ["danger", "Down"],
  unconfigured: ["neutral", "Not configured"],
};

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });

/**
 * Live status of every external service — Supabase (both keys), the R2 bucket
 * and the public media address. Probed when the screen opens and on demand;
 * results are never cached, so "Check again" always hits the services.
 */
export function ConnectionsStatusPanel() {
  const [report, setReport] = useState<ConnectionReport | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [checking, startChecking] = useTransition();

  const check = () =>
    startChecking(async () => {
      try {
        setReport(await checkExternalConnections());
        setFailure(null);
      } catch (error) {
        setFailure(error instanceof Error ? error.message : "The check could not run");
      }
    });

  /* Probe once when the screen opens. */
  useEffect(check, []);

  const description = checking
    ? "Checking…"
    : report
      ? `Checked at ${timeOf(report.checkedAt)}`
      : "External services the site depends on";

  return (
    <Panel
      title="Connections"
      description={description}
      bodyClassName=""
      action={
        <Button size="sm" onClick={check} disabled={checking}>
          {checking ? "Checking…" : "Check again"}
        </Button>
      }
    >
      {failure && (
        <p role="alert" className="border-b border-line px-[20px] py-[12px] font-sans text-[13px] text-danger">
          {failure}
        </p>
      )}
      {report ? (
        <ul className="divide-y divide-line">
          {report.connections.map((connection) => (
            <ConnectionRow key={connection.id} connection={connection} dimmed={checking} />
          ))}
        </ul>
      ) : (
        !failure && (
          <p className="px-[20px] py-[16px] font-sans text-[13px] text-graphite">Checking services…</p>
        )
      )}
    </Panel>
  );
}

function ConnectionRow({ connection, dimmed }: { connection: ConnectionStatus; dimmed: boolean }) {
  const [tone, label] = STATE_PILL[connection.state];

  return (
    <li
      className={`grid gap-x-[16px] gap-y-[6px] px-[20px] py-[14px] font-sans transition-opacity sm:grid-cols-[minmax(0,1fr)_auto] ${dimmed ? "opacity-60" : ""}`}
    >
      <div className="min-w-0">
        <p className="text-[14px] leading-[130%] font-semibold">{connection.label}</p>
        <p className="mt-[2px] text-[13px] leading-[140%] text-graphite">{connection.purpose}</p>
        <p className="mt-[6px] text-[13px] leading-[140%] break-words text-ink">
          {connection.detail}
        </p>
        {connection.missingEnv.length > 0 && (
          <p className="mt-[4px] text-[12px] leading-[140%] text-graphite">
            Missing:{" "}
            {connection.missingEnv.map((name, index) => (
              <span key={name}>
                {index > 0 && ", "}
                <code className="rounded-[4px] bg-hover px-[4px] py-[1px] font-mono text-[12px]">
                  {name}
                </code>
              </span>
            ))}
          </p>
        )}
      </div>
      <div className="flex flex-row items-center gap-[10px] sm:flex-col sm:items-end sm:gap-[4px]">
        <StatusPill tone={tone}>{label}</StatusPill>
        <p className="text-[12px] leading-[130%] text-graphite tabular-nums">
          {[connection.target, connection.latencyMs !== null && `${connection.latencyMs} ms`]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </li>
  );
}
