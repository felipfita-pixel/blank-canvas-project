#!/usr/bin/env node
/**
 * Visual regression: detects light/bright areas on the home page that should
 * be dark (per the dark green theme). Fails when bright-pixel ratio exceeds
 * a threshold, indicating an unintended light background slipped in.
 *
 * Usage:
 *   node scripts/check-light-areas.mjs [url] [--threshold=0.15]
 *
 * Requires: playwright (already in devDeps via lovable-agent-playwright-config)
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith("--")) || process.env.PREVIEW_URL || "http://localhost:8080/";
const threshold = parseFloat(
  (args.find((a) => a.startsWith("--threshold=")) || "--threshold=0.15").split("=")[1],
);
// A pixel is "light" if its luminance is above this (0..255). The dark-green
// theme should sit well below 80; cream/white surfaces are >200.
const LIGHT_LUMA = 180;

const OUT_DIR = path.resolve("test-results/visual");
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1600 } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(1500); // let fonts/images settle

const buf = await page.screenshot({ fullPage: true });
const outPng = path.join(OUT_DIR, "home.png");
fs.writeFileSync(outPng, buf);

const png = PNG.sync.read(buf);
const { width, height, data } = png;

let lightCount = 0;
const total = width * height;
// Heat-map of light regions for debugging.
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
fs.writeFileSync(path.join(OUT_DIR, "home-light-overlay.png"), PNG.sync.write(overlay));

await browser.close();

const pct = (ratio * 100).toFixed(2);
const summary = `light pixels: ${lightCount}/${total} (${pct}%) — threshold ${(threshold * 100).toFixed(2)}%`;
if (ratio > threshold) {
  console.error(`FAIL — ${summary}`);
  console.error(`See overlay: ${path.join(OUT_DIR, "home-light-overlay.png")}`);
  process.exit(1);
}
console.log(`OK — ${summary}`);
