'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import ImageLightbox from './ImageLightbox'

type Props = { images: string[]; thumbnailIndex: number; alt: string }

export default function VehicleGallery({ images, thumbnailIndex, alt }: Props) {
  const ordered = images.length > 0
    ? [images[thumbnailIndex], ...images.filter((_, i) => i !== thumbnailIndex)]
    : []

  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  if (ordered.length === 0) {
    return (
      <div className="aspect-[4/3] bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400">No Photos</div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] bg-zinc-100 rounded-2xl overflow-hidden group cursor-zoom-in"
        onClick={() => setLightbox(true)}>
        <img src={ordered[current]} alt={`${alt} photo ${current + 1}`} className="w-full h-full object-cover object-bottom" />

        <button onClick={e => { e.stopPropagation(); setLightbox(true) }}
          className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
          <Expand className="w-4 h-4" />
        </button>

        {ordered.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); setCurrent(c => (c - 1 + ordered.length) % ordered.length) }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-zinc-800 rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={e => { e.stopPropagation(); setCurrent(c => (c + 1) % ordered.length) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-zinc-800 rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
              {current + 1} / {ordered.length}
            </div>
          </>
        )}
      </div>

      {ordered.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {ordered.slice(0, 5).map((img, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                i === current ? 'border-[#5BB8F5] opacity-100' : 'border-transparent opacity-60 hover:opacity-90'
              }`}>
              <img src={img} alt="" className="w-full h-full object-cover object-bottom" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <ImageLightbox images={ordered} startIndex={current} alt={alt} onClose={() => setLightbox(false)} />
      )}
    </div>
  )
}
