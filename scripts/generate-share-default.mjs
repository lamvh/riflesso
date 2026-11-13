// Builds public/share-default.jpg: the 1200x630 picture link previews
// (Facebook, Messenger, X, Slack…) show for pages without a photograph of
// their own. The wordmark file is placed as-is on white — never recoloured.
//   node scripts/generate-share-default.mjs
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
const MARK_WIDTH = 560;

const mark = await sharp("public/riflesso.png").resize({ width: MARK_WIDTH }).toBuffer();
const { height: markHeight } = await sharp(mark).metadata();

await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: "#ffffff" } })
  .composite([
    { input: mark, left: Math.round((WIDTH - MARK_WIDTH) / 2), top: Math.round((HEIGHT - markHeight) / 2) },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile("public/share-default.jpg");

console.log("public/share-default.jpg written");
