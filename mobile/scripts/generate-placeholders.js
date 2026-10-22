/* eslint-disable */
/**
 * Generates PLACEHOLDER background images for CocoScan.
 *
 * The Figma design uses real coconut / coconut-leaf photography that was not
 * exported with the design. Until those assets are provided, this script
 * produces green-toned gradient images with the same aspect ratios so layouts
 * can be built and reviewed. Replace the files in assets/images/ with the real
 * exports (same file names) — no code changes required.
 *
 * Run:  node scripts/generate-placeholders.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'assets', 'images');
fs.mkdirSync(OUT, { recursive: true });

// ---------- minimal PNG encoder ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(width, height, rgb) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    rgb.copy(raw, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- procedural "foliage" shader ----------
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
function hash(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function smoothNoise(x, y, seed) {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const n00 = hash(x0, y0, seed), n10 = hash(x0 + 1, y0, seed);
  const n01 = hash(x0, y0 + 1, seed), n11 = hash(x0 + 1, y0 + 1, seed);
  return lerp(lerp(n00, n10, sx), lerp(n01, n11, sx), sy);
}
function fbm(x, y, seed) {
  let v = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < 5; i++) {
    v += amp * smoothNoise(x * freq, y * freq, seed + i);
    amp *= 0.5;
    freq *= 2;
  }
  return v;
}

function render({ name, width, height, top, bottom, accent, seed, streaks, vignette }) {
  const rgb = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    const ty = y / height;
    for (let x = 0; x < width; x++) {
      const tx = x / width;
      const n = fbm(tx * 4, ty * 4, seed);
      // diagonal frond-like streaks
      const s = Math.pow(Math.abs(Math.sin((tx * 7 + ty * 3) * Math.PI + n * 4)), 10) * streaks;
      const g = clamp01(ty + (n - 0.5) * 0.5);
      let r = lerp(top[0], bottom[0], g), gg = lerp(top[1], bottom[1], g), b = lerp(top[2], bottom[2], g);
      r = lerp(r, accent[0], s);
      gg = lerp(gg, accent[1], s);
      b = lerp(b, accent[2], s);
      const dark = 1 - vignette * Math.pow(Math.hypot(tx - 0.5, ty - 0.5) * 1.3, 2);
      const i = (y * width + x) * 3;
      rgb[i] = clamp01((r * dark) / 255) * 255;
      rgb[i + 1] = clamp01((gg * dark) / 255) * 255;
      rgb[i + 2] = clamp01((b * dark) / 255) * 255;
    }
  }
  fs.writeFileSync(path.join(OUT, name), encodePNG(width, height, rgb));
  console.log('wrote', name, `${width}x${height}`);
}

// Welcome / Login / Sign-up full-screen background (dark palm fronds + coconuts)
render({ name: 'welcome-bg.png', width: 720, height: 1480, top: [36, 72, 32], bottom: [14, 34, 14], accent: [122, 170, 60], seed: 11, streaks: 0.55, vignette: 0.6 });
// Home banner photo (green coconut on white-green)
render({ name: 'home-banner.png', width: 720, height: 400, top: [62, 110, 45], bottom: [34, 74, 30], accent: [150, 200, 90], seed: 23, streaks: 0.45, vignette: 0.3 });
// Disease information header (coconut tree canopy)
render({ name: 'coconut-tree.png', width: 720, height: 620, top: [110, 120, 60], bottom: [48, 82, 36], accent: [200, 150, 60], seed: 37, streaks: 0.6, vignette: 0.4 });
// About CocoScan card background (dark leaf close-up)
render({ name: 'about-bg.png', width: 720, height: 480, top: [40, 70, 30], bottom: [20, 40, 18], accent: [96, 140, 54], seed: 51, streaks: 0.7, vignette: 0.5 });
// Camera fallback when no device camera is available (simulator / web)
render({ name: 'camera-fallback.png', width: 720, height: 1480, top: [70, 96, 44], bottom: [30, 52, 26], accent: [190, 170, 70], seed: 67, streaks: 0.5, vignette: 0.4 });
// Light leafy background for Detecting / Results / Saved screens (very subtle)
render({ name: 'light-leaf-bg.png', width: 720, height: 1480, top: [247, 250, 245], bottom: [214, 234, 204], accent: [200, 222, 188], seed: 83, streaks: 0.35, vignette: 0.0 });

console.log('Done. These are placeholders — see assets/images/README.md');
