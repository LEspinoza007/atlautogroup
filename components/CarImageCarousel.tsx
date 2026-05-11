'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CarImageCarousel({
  images,
  alt,
  thumbnailIndex = 0,
}: {
  images: string[]
  alt: string
  thumbnailIndex?: number
}) {
  const ordered = images.length > 0
    ? [images[thumbnailIndex], ...images.filter((_, i) => i !== thumbnailIndex)]
    : []

  const [current, setCurrent] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const didSwipe = useRef(false)

  if (ordered.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        No Photo
      </div>
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
    if (Math.abs(delta) >= 40) goTo(delta < 0 ? current + 1 : current - 1)
  }

  // Stop parent link from firing when user swiped
  function onClick(e: React.MouseEvent) {
    if (didSwipe.current) e.preventDefault()
  }

  const trackOffset = `calc(${-current * (100 / count)}% + ${dragOffset}px)`

  return (
    <div
      className="relative aspect-[4/3] bg-gray-100 overflow-hidden group"
      style={{ touchAction: 'pan-y' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
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
            alt={`${alt} - photo ${i + 1}`}
            className="h-full object-cover object-bottom"
            style={{ width: `${100 / count}%` }}
            draggable={false}
          />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); goTo(current - 1) }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); goTo(current + 1) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            aria-label="Next photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 pointer-events-none">
            {ordered.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
