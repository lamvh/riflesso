/*
 * Regenerates the site icons from one square master image:
 *
 *   node scripts/generate-favicons.mjs [path/to/master]   (default design/favicon-source.jpg)
 *
 * Writes Next.js file-convention icons, which Next links in <head> by itself:
 *   src/app/favicon.ico     16/32/48 px — browser tabs
 *   src/app/icon.png        512 px      — modern browsers, Android
 *   src/app/apple-icon.png  180 px      — iOS home screen
 *
 * The master stays out of public/ (it would be deployed) and out of git (it is
 * large); only the small generated files are committed.
 */
import { writeFileSync } from "node:fs";

import sharp from "sharp";

const source = process.argv[2] ?? "design/favicon-source.jpg";

/* ICO entries must be RGBA PNGs — Next's ICO decoder rejects RGB ones. */
const png = (size) =>
  sharp(source).resize(size, size, { fit: "cover" }).ensureAlpha().png({ compressionLevel: 9 }).toBuffer();

/** An ICO container holding PNG-encoded entries, which every current browser reads. */
function ico(sizes, images) {
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(sizes.length, 4);

  let offset = header.length;
  sizes.forEach((size, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(size, entry); // width
    header.writeUInt8(size, entry + 1); // height
    header.writeUInt16LE(1, entry + 4); // colour planes
    header.writeUInt16LE(32, entry + 6); // bits per pixel
    header.writeUInt32LE(images[i].length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += images[i].length;
  });

  return Buffer.concat([header, ...images]);
}

const icoSizes = [16, 32, 48];
writeFileSync("src/app/favicon.ico", ico(icoSizes, await Promise.all(icoSizes.map(png))));
writeFileSync("src/app/icon.png", await png(512));
writeFileSync("src/app/apple-icon.png", await png(180));

console.log(`Icons written from ${source}`);
