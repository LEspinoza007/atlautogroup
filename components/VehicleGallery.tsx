'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import ImageLightbox from './ImageLightbox'

type Props = { images: string[]; thumbnailIndex: number; alt: string }

export default function VehicleGallery({ images, thumbnailIndex, alt }: Props) {
  const ordered = images.length > 0
    ? [images[thumbnailIndex], ...images.filter((_, i) => i !== thumbnailIndex)]
    : []

  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const didSwipe = useRef(false)

  if (ordered.length === 0) {
    return (
      <div className="aspect-[4/3] bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400">No Photos</div>
    )
  }

  const count = ordered.length

  function goTo(i: number) { setCurrent((i + count) % count) }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    didSwipe.current = false
    setIsDragging(true)
  }

  function onTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.touches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 8) didSwipe.current = true
    setDragOffset(delta)
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    setIsDragging(false)
    setDragOffset(0)
    if (!didSwipe.current) {
      setLightbox(true)
      return
    }
    if (Math.abs(delta) >= 40) goTo(delta < 0 ? current + 1 : current - 1)
  }

  const trackOffset = `calc(${-current * (100 / count)}% + ${dragOffset}px)`

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[4/3] bg-zinc-100 rounded-2xl overflow-hidden group cursor-zoom-in"
        style={{ touchAction: 'pan-y' }}
        onClick={() => { if (!didSwipe.current) setLightbox(true) }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Sliding track */}
        <div
          className="flex h-full"
          style={{
            width: `${count * 100}%`,
            transform: `translateX(${trackOffset})`,
            transition: isDragging ? 'none' : 'transform 0.3s ease',
            willChange: 'transform',
          }}
        >
          {ordered.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${alt} photo ${i + 1}`}
              className="h-full object-cover object-bottom"
              style={{ width: `${100 / count}%` }}
              draggable={false}
            />
          ))}
        </div>

        <button onClick={e => { e.stopPropagation(); setLightbox(true) }}
          className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
          <Expand className="w-4 h-4" />
        </button>

        {count > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); goTo(current - 1) }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-zinc-800 rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={e => { e.stopPropagation(); goTo(current + 1) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-zinc-800 rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
              {current + 1} / {count}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
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
