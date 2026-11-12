import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/*
 * No incremental or tag cache: nothing extra to provision (no R2 cache bucket,
 * no D1). The trade-off is deliberate — every public page view renders fresh
 * and reads Supabase directly, so Publish shows up immediately without any
 * revalidation plumbing. Traffic is low; if it grows, add r2IncrementalCache +
 * d1NextTagCache back (https://opennext.js.org/cloudflare/caching).
 */
export default defineCloudflareConfig({});
