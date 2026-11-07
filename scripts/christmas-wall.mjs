import sharp from "sharp";
import assert from "node:assert/strict";

const { data, info } = await sharp("public/art/room-base-v2.webp")
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
let changed = 0;
for (let top = 0; top < info.height * 0.56; top++) {
  for (let left = 0; left < info.width; left++) {
    const offset = (top * info.width + left) * info.channels;
    const [red, green, blue] = data.subarray(offset, offset + 3);
    const ceiling = left < 768 ? 165 - left * 0.24 : (left - 768) * 0.25;
    const floor =
      left < 768 ? Math.min(330, 465 - left * 0.22) : 295 + (left - 768) * 0.12;
    if (
      left > 95 &&
      left < 1450 &&
      top > ceiling &&
      top < floor &&
      blue > green * 1.03 &&
      red > green * 1.03
    ) {
      const light = (red + green + blue) / 3;
      const blend = Math.min(
        1,
        Math.max(0, (blue - green * 1.03) / 18),
        (top - ceiling) / 12,
        (floor - top) / 18,
      );
      data[offset] = red + (Math.min(255, light * 1.12) - red) * blend;
      data[offset + 1] = green + (light * 0.43 - green) * blend;
      data[offset + 2] = blue + (light * 0.48 - blue) * blend;
      changed++;
    }
  }
}
assert(changed > 10000, "Expected painted lavender wall pixels");
await sharp(data, { raw: info })
  .webp({ quality: 92 })
  .toFile("public/art/room-christmas.webp");
