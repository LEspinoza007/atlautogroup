import sharp from 'sharp'
import { writeFileSync } from 'fs'

const src = new URL('../public/logo.png', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
const pixels = new Uint8ClampedArray(data)

function idx(x, y) { return (y * width + x) * channels }
function isNearWhite(x, y) {
  const i = idx(x, y)
  return pixels[i] > 200 && pixels[i+1] > 200 && pixels[i+2] > 200
}

// Flood-fill from all four corners to find the white outer background.
// These pixels are background, not text.
const bgMask = new Uint8Array(width * height) // 1 = background
const queue = []
function enqueue(x, y) {
  const k = y * width + x
  if (x < 0 || x >= width || y < 0 || y >= height) return
  if (bgMask[k] || !isNearWhite(x, y)) return
  bgMask[k] = 1
  queue.push(x, y)
}

enqueue(0, 0); enqueue(width-1, 0); enqueue(0, height-1); enqueue(width-1, height-1)

let qi = 0
while (qi < queue.length) {
  const x = queue[qi++], y = queue[qi++]
  enqueue(x+1, y); enqueue(x-1, y); enqueue(x, y+1); enqueue(x, y-1)
}

// Now process pixels:
// - background white (bgMask) → transparent
// - blue background (#5BB8F5-ish) → transparent
// - white text (bright, not bg, not blue) → keep (or recolor to black)
function makeOutput(makeBlack) {
  const out = new Uint8ClampedArray(pixels)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = idx(x, y)
      const k = y * width + x
      const r = out[i], g = out[i+1], b = out[i+2]

      // Outer background → transparent
      if (bgMask[k]) { out[i+3] = 0; continue }

      // Blue tile → transparent (b channel dominates, and G is moderate)
      const isBlue = b > 150 && b > r + 60 && g > r
      if (isBlue) { out[i+3] = 0; continue }

      // Remaining pixels are the logo marks (white text/dashes on the tile)
      const brightness = (r + g + b) / 3
      if (makeBlack) {
        out[i] = 0; out[i+1] = 0; out[i+2] = 0
        // Scale alpha so antialiased text edges are smooth
        out[i+3] = Math.min(255, Math.round(255 * (brightness / 220)))
      } else {
        out[i] = 255; out[i+1] = 255; out[i+2] = 255
        out[i+3] = Math.min(255, Math.round(255 * (brightness / 220)))
      }
    }
  }
  return out
}

async function save(pixelData, filename) {
  const buf = await sharp(Buffer.from(pixelData.buffer), {
    raw: { width, height, channels }
  }).png().toBuffer()
  const p = src.replace('logo.png', filename)
  writeFileSync(p, buf)
  console.log('Written:', p)
}

await save(makeOutput(true),  'logo-black.png')
await save(makeOutput(false), 'logo-white.png')
