import "server-only";

import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/*
 * Cloudflare R2 through its S3 API. Uploads are written by the dashboard's
 * upload route; reading happens straight from the public base URL (an r2.dev
 * address or a custom domain), never through these credentials.
 */

export type R2Config = {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Where the stored objects are served from, without a trailing slash. */
  publicBaseUrl: string;
};

/** Null when R2 is not configured, which is how callers report it is off. */
export function r2Config(): R2Config | null {
  const endpoint = process.env.R2_ENDPOINT;
  const bucket = process.env.R2_BUCKET;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const publicBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey || !publicBaseUrl) return null;

  let origin: string;
  try {
    origin = new URL(endpoint).origin;
  } catch {
    /* A malformed endpoint would throw in every caller; report storage as off. */
    console.warn("R2_ENDPOINT is not a valid URL; storage is treated as not configured.");
    return null;
  }

  return {
    /* The S3 endpoint is the account origin; the bucket goes in the path. */
    endpoint: origin,
    bucket,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl: publicBaseUrl.replace(/\/+$/, ""),
  };
}

let client: S3Client | null = null;

function r2Client(config: R2Config): S3Client {
  client ??= new S3Client({
    /* R2 has one region, and path-style keeps the bucket out of the hostname. */
    region: "auto",
    endpoint: config.endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  return client;
}

/**
 * Lists at most one object — the cheapest call that proves the credentials
 * can read the bucket. Throws on network, auth or missing-bucket failures.
 */
export async function probeBucket(config: R2Config, signal: AbortSignal): Promise<void> {
  await r2Client(config).send(
    new ListObjectsV2Command({ Bucket: config.bucket, MaxKeys: 1 }),
    { abortSignal: signal },
  );
}

export type StoredObject = {
  key: string;
  /** Bytes as stored in the bucket. */
  size: number;
  /** ISO timestamp of the upload, or null when R2 does not report one. */
  lastModified: string | null;
};

/** ListObjectsV2 pages hold 1000 keys; this caps a listing at 20,000 objects. */
const LIST_PAGE_LIMIT = 20;

/**
 * Every object in the bucket, following continuation tokens. `truncated` is
 * true when the cap stopped the walk before the bucket ran out.
 */
export async function listObjects(
  config: R2Config,
  signal: AbortSignal,
): Promise<{ objects: StoredObject[]; truncated: boolean }> {
  const objects: StoredObject[] = [];
  let token: string | undefined;

  for (let page = 0; page < LIST_PAGE_LIMIT; page += 1) {
    const response = await r2Client(config).send(
      new ListObjectsV2Command({ Bucket: config.bucket, ContinuationToken: token }),
      { abortSignal: signal },
    );
    for (const item of response.Contents ?? []) {
      if (!item.Key) continue;
      objects.push({
        key: item.Key,
        size: item.Size ?? 0,
        lastModified: item.LastModified?.toISOString() ?? null,
      });
    }
    if (!response.IsTruncated || !response.NextContinuationToken) {
      return { objects, truncated: false };
    }
    token = response.NextContinuationToken;
  }

  return { objects, truncated: true };
}

/** DeleteObjects takes at most 1000 keys per request. */
export const DELETE_BATCH_LIMIT = 1000;

/**
 * Deletes up to 1000 keys in one request. Returns the keys R2 confirmed and
 * the ones it refused, with its reason. Throws on network or auth failures.
 */
export async function deleteObjects(
  config: R2Config,
  keys: string[],
  signal: AbortSignal,
): Promise<{ deleted: string[]; failed: { key: string; reason: string }[] }> {
  const response = await r2Client(config).send(
    new DeleteObjectsCommand({
      Bucket: config.bucket,
      Delete: { Objects: keys.map((key) => ({ Key: key })) },
    }),
    { abortSignal: signal },
  );
  return {
    deleted: (response.Deleted ?? []).flatMap((item) => (item.Key ? [item.Key] : [])),
    failed: (response.Errors ?? []).map((item) => ({
      key: item.Key ?? "",
      reason: item.Message ?? item.Code ?? "Refused by the bucket",
    })),
  };
}

/** Objects are immutable: every upload gets its own key, so it can cache forever. */
const CACHE_CONTROL = "public, max-age=31536000, immutable";

export async function putObject({
  config,
  key,
  body,
  contentType,
}: {
  config: R2Config;
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  await r2Client(config).send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: CACHE_CONTROL,
    }),
  );
  return `${config.publicBaseUrl}/${key}`;
}

const SLUG_LIMIT = 48;

/**
 * `uploads/2026/09/gilded-frame-9f2a1c07.webp` — the original name keeps the
 * object recognisable in the bucket, the suffix keeps two uploads apart.
 */
export function mediaKey(originalName: string, extension: string): string {
  const base = originalName.replace(/\.[^.]+$/, "");
  const slug =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, SLUG_LIMIT) || "file";

  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const suffix = crypto.randomUUID().slice(0, 8);

  return `uploads/${now.getUTCFullYear()}/${month}/${slug}-${suffix}.${extension}`;
}
