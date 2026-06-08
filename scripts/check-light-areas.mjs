#!/usr/bin/env node
/**
 * Visual regression: scans a screenshot for "light" pixels that don't belong
 * to the dark-green theme. Fails when the bright-pixel ratio exceeds the
 * threshold, indicating an unintended light background (e.g. cream/white card)
 * has reappeared.
 *
 * Usage:
 *   node scripts/check-light-areas.mjs <screenshot.png> [--threshold=0.15] [--luma=180]
 *
 * Output:
 *   - test-results/visual/<name>-overlay.png : red-highlighted heat-map of light pixels
 *   - exit code 0 on pass, 1 on fail
 *
 * Tip: capture the screenshot of the running preview via the agent's
 * browser--screenshot tool (full_page: true), save the PNG, then run this
 * script. In CI, use Playwright to capture first.
 */
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--"));
if (!input) {
  console.error("usage: check-light-areas.mjs <screenshot.png> [--threshold=0.15] [--luma=180]");
  process.exit(2);
}
const opt = (k, d) => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? parseFloat(a.split("=")[1]) : d;
};
const threshold = opt("threshold", 0.15);
const LIGHT_LUMA = opt("luma", 180);

const OUT_DIR = path.resolve("test-results/visual");
fs.mkdirSync(OUT_DIR, { recursive: true });

const png = PNG.sync.read(fs.readFileSync(input));
const { width, height, data } = png;
let lightCount = 0;
const total = width * height;
const overlay = new PNG({ width, height });
for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const isLight = luma > LIGHT_LUMA;
  if (isLight) lightCount++;
  overlay.data[i] = isLight ? 255 : r;
  overlay.data[i + 1] = isLight ? 0 : g;
  overlay.data[i + 2] = isLight ? 0 : b;
  overlay.data[i + 3] = 255;
}
const ratio = lightCount / total;
const base = path.basename(input, path.extname(input));
const overlayPath = path.join(OUT_DIR, `${base}-overlay.png`);
fs.writeFileSync(overlayPath, PNG.sync.write(overlay));

const pct = (ratio * 100).toFixed(2);
const summary = `light pixels: ${lightCount}/${total} (${pct}%) — threshold ${(threshold * 100).toFixed(2)}% — luma>${LIGHT_LUMA}`;
console.log(`overlay: ${overlayPath}`);
if (ratio > threshold) {
  console.error(`FAIL — ${summary}`);
  process.exit(1);
}
console.log(`OK — ${summary}`);
