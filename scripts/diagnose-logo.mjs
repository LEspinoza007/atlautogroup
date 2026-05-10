import sharp from 'sharp'

const src = new URL('../public/logo.png', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info

console.log('Image size:', width, 'x', height)

// Sample pixels: corners, center, and various spots
const sample = (x, y) => {
  const i = (y * width + x) * channels
  return { r: data[i], g: data[i+1], b: data[i+2], a: data[i+3] }
}

const cx = Math.floor(width / 2), cy = Math.floor(height / 2)
console.log('Center:',        sample(cx, cy))
console.log('Top-left corner:', sample(5, 5))
console.log('Near top-left border:', sample(30, 30))
console.log('Top center:', sample(cx, 5))
console.log('Left edge:', sample(5, cy))

// Build a frequency map of unique approximate colors
const counts = {}
for (let i = 0; i < data.length; i += channels) {
  const r = Math.round(data[i] / 32) * 32
  const g = Math.round(data[i+1] / 32) * 32
  const b = Math.round(data[i+2] / 32) * 32
  const a = data[i+3]
  const key = `r${r} g${g} b${b} a${a}`
  counts[key] = (counts[key] || 0) + 1
}

const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
console.log('\nTop 10 color buckets:')
sorted.forEach(([k, v]) => console.log(' ', k, '->', v, 'pixels'))
