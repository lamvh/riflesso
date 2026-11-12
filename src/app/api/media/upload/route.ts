import { NextResponse } from "next/server";

import { optimizeImage } from "@/lib/media/optimize-image";
import { mediaKey, putObject, r2Config } from "@/lib/media/r2-storage";

/**
 * Takes a file from the dashboard, re-encodes pictures, stores the result in
 * R2 and returns the address to save on the record.
 *
 * There is no sign-in yet, so anyone who can reach this route can upload. Put
 * an auth check here before the dashboard is deployed anywhere public.
 */
export const runtime = "nodejs";

const MAX_BYTES = 50 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/tiff",
]);

/** Videos are stored as they arrive; re-encoding them is a different job. */
const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const megabytes = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)}MB`;

export async function POST(request: Request) {
  const config = r2Config();
  if (!config) {
    return NextResponse.json(
      { error: "Storage is not configured. Set the R2 environment variables." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "The upload did not arrive as a form." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `That file is ${megabytes(file.size)}. The limit is ${megabytes(MAX_BYTES)}.` },
      { status: 413 },
    );
  }

  const isImage = IMAGE_TYPES.has(file.type);
  const videoExtension = VIDEO_EXTENSIONS[file.type];
  if (!isImage && !videoExtension) {
    return NextResponse.json(
      { error: "That file type can't be used. Upload a JPEG, PNG, WebP, AVIF or MP4." },
      { status: 415 },
    );
  }

  const input = Buffer.from(await file.arrayBuffer());

  try {
    const stored = isImage
      ? await optimizeImage(input, { animated: file.type === "image/gif" })
      : { body: input, contentType: file.type, extension: videoExtension, width: 0, height: 0 };

    const url = await putObject({
      config,
      key: mediaKey(file.name, stored.extension),
      body: stored.body,
      contentType: stored.contentType,
    });

    return NextResponse.json({
      url,
      bytes: stored.body.length,
      originalBytes: file.size,
      width: stored.width,
      height: stored.height,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Upload failed: ${reason}` }, { status: 502 });
  }
}
