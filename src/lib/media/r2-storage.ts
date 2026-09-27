import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

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

  return {
    /* The S3 endpoint is the account origin; the bucket goes in the path. */
    endpoint: new URL(endpoint).origin,
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
