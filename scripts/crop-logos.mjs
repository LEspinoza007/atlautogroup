import sharp from 'sharp'
import { writeFileSync } from 'fs'

const base = new URL('../public/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')

for (const name of ['logo-black.png', 'logo-white.png']) {
  const buf = await sharp(base + name)
    .trim({ threshold: 5 })
    .png()
    .toBuffer()
  writeFileSync(base + name, buf)
  const meta = await sharp(buf).metadata()
  console.log(`${name}: ${meta.width}x${meta.height}`)
}
