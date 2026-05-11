'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

type Props = {
  images: string[]
  startIndex: number
  onClose: () => void
  alt: string
}

export default function ImageLightbox({ images, startIndex, onClose, alt }: Props) {
  const [current, setCurrent] = useState(startIndex)
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef({ sx: 0, sy: 0, px: 0, py: 0 })
  const pinchRef = useRef(0)
  const swipeStartX = useRef<number | null>(null)

  useEffect(() => { setScale(1); setPos({ x: 0, y: 0 }) }, [current])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setCurrent(c => (c - 1 + images.length) % images.length)
      if (e.key === 'ArrowRight') setCurrent(c => (c + 1) % images.length)
    }
    window.addEventListener('keydown', handler)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler) }
  }, [images.length, onClose])

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    setScale(s => Math.min(Math.max(s + (e.deltaY > 0 ? -0.2 : 0.2), 1), 5))
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (scale <= 1) return
    setDragging(true)
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging) return
    setPos({ x: dragRef.current.px + e.clientX - dragRef.current.sx, y: dragRef.current.py + e.clientY - dragRef.current.sy })
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchRef.current = Math.sqrt(dx * dx + dy * dy)
      swipeStartX.current = null
    } else if (e.touches.length === 1) {
      swipeStartX.current = e.touches[0].clientX
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      setScale(s => Math.min(Math.max(s * (dist / pinchRef.current), 1), 5))
      pinchRef.current = dist
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (scale === 1 && swipeStartX.current !== null && e.changedTouches.length === 1) {
      const delta = e.changedTouches[0].clientX - swipeStartX.current
      if (Math.abs(delta) >= 40) {
        setCurrent(c => delta < 0 ? (c + 1) % images.length : (c - 1 + images.length) % images.length)
      }
    }
    swipeStartX.current = null
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/97 flex items-center justify-center select-none">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
        <span className="text-zinc-400 text-sm font-medium">{current + 1} / {images.length}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setScale(s => Math.max(s - 0.25, 1))}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-zinc-400 w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(s + 0.25, 5))}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-red-600 text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image area */}
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden pt-14 pb-20"
        style={{ cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in', touchAction: scale > 1 ? 'none' : 'pan-y' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={e => { if (e.target === e.currentTarget && scale === 1) onClose() }}
      >
        <img
          src={images[current]}
          alt={`${alt} photo ${current + 1}`}
          draggable={false}
          style={{
            maxHeight: '100%',
            maxWidth: '90vw',
            objectFit: 'contain',
            transform: `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)`,
            transition: dragging ? 'none' : 'transform 0.15s ease',
          }}
        />
      </div>

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button onClick={() => setCurrent(c => (c - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/30 text-white rounded-full p-3 transition-all z-10 backdrop-blur-sm">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={() => setCurrent(c => (c + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/30 text-white rounded-full p-3 transition-all z-10 backdrop-blur-sm">
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto z-10">
          {images.map((img, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
              }`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
