'use client'

import { useState } from 'react'
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

  if (ordered.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        No Photo
      </div>
    )
  }

  function prev(e: React.MouseEvent) {
    e.preventDefault()
    setCurrent(c => (c - 1 + ordered.length) % ordered.length)
  }

  function next(e: React.MouseEvent) {
    e.preventDefault()
    setCurrent(c => (c + 1) % ordered.length)
  }

  return (
    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden group">
      <img
        src={ordered[current]}
        alt={`${alt} - photo ${current + 1}`}
        className="w-full h-full object-cover object-bottom transition-opacity duration-200"
      />

      {ordered.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {ordered.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.preventDefault(); setCurrent(i) }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
