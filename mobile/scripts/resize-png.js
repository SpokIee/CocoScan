/* eslint-disable */
/**
 * Dependency-free PNG downscaler (box filter, alpha-aware).
 *
 *   node scripts/resize-png.js <input.png> <output.png> <maxDimension>
 *
 * Supports 8-bit non-interlaced PNGs with colour types 0 (gray), 2 (RGB),
 * 4 (gray+alpha) and 6 (RGBA). Used once to shrink the 2000px Figma exports
 * (icons, coconut cutout) to sensible mobile sizes.
 */
const fs = require('fs');
const zlib = require('zlib');

const [, , input, output, maxDimArg] = process.argv;
if (!input || !output || !maxDimArg) {
  console.error('usage: node scripts/resize-png.js <input.png> <output.png> <maxDimension>');
  process.exit(1);
}
const maxDim = parseInt(maxDimArg, 10);

// ---------------------------------------------------------------- decode
function decodePNG(buf) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!buf.subarray(0, 8).equals(sig)) throw new Error('not a PNG');
  let off = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    off += 12 + len;
  }
  if (bitDepth !== 8) throw new Error(`unsupported bit depth ${bitDepth}`);
  if (interlace !== 0) throw new Error('interlaced PNG not supported');
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`unsupported colour type ${colorType}`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(stride * height);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? cur[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      let v = row[i];
      switch (filter) {
        case 0: break;
        case 1: v += a; break;
        case 2: v += b; break;
        case 3: v += (a + b) >> 1; break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          break;
        }
        default: throw new Error(`bad filter ${filter}`);
      }
      cur[i] = v & 0xff;
    }
    prev = cur;
  }

  // expand to RGBA
  const rgba = new Float32Array(width * height * 4);
  for (let p = 0; p < width * height; p++) {
    const s = p * channels;
    let r, g, b, a = 255;
    if (channels === 1) { r = g = b = out[s]; }
    else if (channels === 2) { r = g = b = out[s]; a = out[s + 1]; }
    else if (channels === 3) { r = out[s]; g = out[s + 1]; b = out[s + 2]; }
    else { r = out[s]; g = out[s + 1]; b = out[s + 2]; a = out[s + 3]; }
    rgba[p * 4] = r; rgba[p * 4 + 1] = g; rgba[p * 4 + 2] = b; rgba[p * 4 + 3] = a;
  }
  return { width, height, rgba, hasAlpha: channels === 2 || channels === 4 };
}

// ---------------------------------------------------------------- resize
function resize(img, targetMax) {
  const scale = Math.min(1, targetMax / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  if (scale === 1) return { width: w, height: h, rgba: img.rgba, hasAlpha: img.hasAlpha };
  const out = new Float32Array(w * h * 4);
  for (let oy = 0; oy < h; oy++) {
    const sy0 = Math.floor((oy * img.height) / h), sy1 = Math.max(sy0 + 1, Math.floor(((oy + 1) * img.height) / h));
    for (let ox = 0; ox < w; ox++) {
      const sx0 = Math.floor((ox * img.width) / w), sx1 = Math.max(sx0 + 1, Math.floor(((ox + 1) * img.width) / w));
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let y = sy0; y < sy1; y++) {
        for (let x = sx0; x < sx1; x++) {
          const i = (y * img.width + x) * 4;
          const al = img.rgba[i + 3] / 255;
          r += img.rgba[i] * al; g += img.rgba[i + 1] * al; b += img.rgba[i + 2] * al; a += al; n++;
        }
      }
      const o = (oy * w + ox) * 4;
      if (a > 0) { out[o] = r / a; out[o + 1] = g / a; out[o + 2] = b / a; }
      out[o + 3] = (a / n) * 255;
    }
  }
  return { width: w, height: h, rgba: out, hasAlpha: img.hasAlpha };
}

// ---------------------------------------------------------------- encode
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(img) {
  const ch = img.hasAlpha ? 4 : 3;
  const stride = img.width * ch;
  const raw = Buffer.alloc((stride + 1) * img.height);
  for (let y = 0; y < img.height; y++) {
    raw[y * (stride + 1)] = 0;
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * 4, o = y * (stride + 1) + 1 + x * ch;
      raw[o] = Math.round(img.rgba[i]); raw[o + 1] = Math.round(img.rgba[i + 1]); raw[o + 2] = Math.round(img.rgba[i + 2]);
      if (ch === 4) raw[o + 3] = Math.round(img.rgba[i + 3]);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(img.width, 0); ihdr.writeUInt32BE(img.height, 4);
  ihdr[8] = 8; ihdr[9] = ch === 4 ? 6 : 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const src = decodePNG(fs.readFileSync(input));
const dst = resize(src, maxDim);
fs.writeFileSync(output, encodePNG(dst));
console.log(`${input} ${src.width}x${src.height} -> ${output} ${dst.width}x${dst.height} (${fs.statSync(output).size} bytes)`);
