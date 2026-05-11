'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Vehicle, VehicleStatus } from '@/types'
import { Star, X, Plus, Sparkles } from 'lucide-react'

type Props = { vehicle?: Vehicle }

type PhotoEntry = {
  key: string
  src: string
  isNew: boolean
  file?: File
}

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
const labelClass = "block text-sm font-medium text-gray-700 mb-1"

const FEATURE_GROUPS = [
  {
    label: 'Technology',
    features: [
      'Apple CarPlay', 'Android Auto', 'Bluetooth', 'USB Ports', 'Wireless Charging',
      'Navigation System', 'Wi-Fi Hotspot', 'Heads-Up Display', 'Premium Sound System',
      'Satellite Radio', 'Digital Cluster', 'Rear Seat Entertainment',
    ],
  },
  {
    label: 'Safety & Driver Assist',
    features: [
      'Backup Camera', '360° Camera', 'Blind Spot Monitor', 'Lane Keep Assist',
      'Lane Departure Warning', 'Forward Collision Warning', 'Automatic Emergency Braking',
      'Adaptive Cruise Control', 'Parking Sensors', 'Rear Cross Traffic Alert',
      'Driver Attention Monitor', 'Night Vision',
    ],
  },
  {
    label: 'Comfort & Convenience',
    features: [
      'Heated Front Seats', 'Heated Rear Seats', 'Ventilated / Cooled Seats',
      'Leather Seats', 'Memory Seats', 'Power Driver Seat', 'Power Passenger Seat',
      'Remote Start', 'Keyless Entry', 'Push Button Start', 'Power Liftgate',
      'Hands-Free Liftgate', 'Heated Steering Wheel', 'Tinted Windows',
      'Ambient Lighting', 'Auto-Dimming Mirror', 'Rain-Sensing Wipers',
    ],
  },
  {
    label: 'Sunroof & Views',
    features: ['Sunroof / Moonroof', 'Panoramic Sunroof', 'Power Sunshade'],
  },
  {
    label: 'Exterior & Wheels',
    features: [
      'Alloy Wheels', 'LED Headlights', 'LED Taillights', 'Fog Lights',
      'Power Folding Mirrors', 'Heated Mirrors', 'Chrome Trim', 'Running Boards',
      'Roof Rack', 'Spoiler',
    ],
  },
  {
    label: 'Utility & Towing',
    features: [
      'Tow Package', 'Bed Liner', 'Tonneau Cover', 'Skid Plates',
      'Locking Rear Differential', 'Spare Tire', 'Trailer Brake Controller',
    ],
  },
]

const ALL_COMMON = FEATURE_GROUPS.flatMap(g => g.features)

function initPhotos(vehicle?: Vehicle): PhotoEntry[] {
  return (vehicle?.images ?? []).map((url, i) => ({
    key: `existing-${i}-${url.slice(-6)}`,
    src: url,
    isNew: false,
  }))
}

export default function VehicleForm({ vehicle }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!vehicle
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragIdx = useRef<number | null>(null)

  const [form, setForm] = useState({
    vin: vehicle?.vin ?? '',
    year: vehicle?.year?.toString() ?? '',
    make: vehicle?.make ?? '',
    model: vehicle?.model ?? '',
    trim: vehicle?.trim ?? '',
    color: vehicle?.color ?? '',
    interior_color: vehicle?.interior_color ?? '',
    mileage: vehicle?.mileage?.toString() ?? '',
    price: vehicle?.price?.toString() ?? '',
    status: (vehicle?.status ?? 'available') as VehicleStatus,
    transmission: vehicle?.transmission ?? '',
    drivetrain: vehicle?.drivetrain ?? '',
    engine: vehicle?.engine ?? '',
    title_status: vehicle?.title_status ?? 'Clean',
    sale_price: vehicle?.sale_price?.toString() ?? '',
    description: vehicle?.description ?? '',
  })

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    vehicle?.features ? vehicle.features.split(',').map(f => f.trim()).filter(Boolean) : []
  )
  const [customFeature, setCustomFeature] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const [photos, setPhotos] = useState<PhotoEntry[]>(() => initPhotos(vehicle))
  const [thumbnailIndex, setThumbnailIndex] = useState(vehicle?.thumbnail_index ?? 0)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const [featured, setFeatured] = useState(vehicle?.featured ?? false)

  const [vinLoading, setVinLoading] = useState(false)
  const [vinError, setVinError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function toggleFeature(feat: string) {
    setSelectedFeatures(prev =>
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    )
  }

  function addCustomFeature() {
    const trimmed = customFeature.trim()
    if (trimmed && !selectedFeatures.includes(trimmed)) {
      setSelectedFeatures(prev => [...prev, trimmed])
    }
    setCustomFeature('')
    setShowCustomInput(false)
  }

  async function lookupVin() {
    if (form.vin.length !== 17) { setVinError('VIN must be exactly 17 characters.'); return }
    setVinLoading(true); setVinError('')
    const res = await fetch(`/api/vin?vin=${form.vin}`)
    if (!res.ok) { setVinError('VIN not found. Fill in details manually.'); setVinLoading(false); return }
    const data = await res.json()
    setForm(prev => ({
      ...prev,
      year: data.year || prev.year,
      make: data.make || prev.make,
      model: data.model || prev.model,
      trim: data.trim || prev.trim,
      engine: data.engine || prev.engine,
      transmission: data.transmission || prev.transmission,
      drivetrain: data.drivetrain || prev.drivetrain,
    }))
    setVinLoading(false)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const entries: PhotoEntry[] = files.map((file, i) => ({
      key: `new-${Date.now()}-${i}`,
      src: '',
      isNew: true,
      file,
    }))
    setPhotos(prev => [...prev, ...entries])
    files.forEach((file, i) => {
      const reader = new FileReader()
      reader.onload = ev =>
        setPhotos(prev => prev.map(p =>
          p.key === entries[i].key ? { ...p, src: ev.target?.result as string } : p
        ))
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePhoto(idx: number) {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
    if (thumbnailIndex === idx) setThumbnailIndex(0)
    else if (thumbnailIndex > idx) setThumbnailIndex(t => t - 1)
  }

  // ── Drag-and-drop ──

  function handleDragStart(idx: number) {
    dragIdx.current = idx
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    setDragOver(idx)
  }

  function handleDrop(e: React.DragEvent, dropIdx: number) {
    e.preventDefault()
    const from = dragIdx.current
    if (from === null || from === dropIdx) { setDragOver(null); return }
    const next = [...photos]
    const [moved] = next.splice(from, 1)
    next.splice(dropIdx, 0, moved)
    setPhotos(next)
    if (thumbnailIndex === from) setThumbnailIndex(dropIdx)
    else if (from < thumbnailIndex && dropIdx >= thumbnailIndex) setThumbnailIndex(t => t - 1)
    else if (from > thumbnailIndex && dropIdx <= thumbnailIndex) setThumbnailIndex(t => t + 1)
    dragIdx.current = null
    setDragOver(null)
  }

  function handleDragEnd() {
    dragIdx.current = null
    setDragOver(null)
  }

  // ── Upload & submit ──

  async function uploadPhotos(vehicleId: string): Promise<string[]> {
    const result: string[] = []
    for (const photo of photos) {
      if (!photo.isNew) {
        result.push(photo.src)
      } else if (photo.file) {
        const ext = photo.file.name.split('.').pop()
        const path = `${vehicleId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('vehicle-images').upload(path, photo.file)
        if (!error) {
          const { data } = supabase.storage.from('vehicle-images').getPublicUrl(path)
          result.push(data.publicUrl)
        }
      }
    }
    return result
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')

    const payload = {
      vin: form.vin.toUpperCase(),
      year: parseInt(form.year),
      make: form.make,
      model: form.model,
      trim: form.trim,
      color: form.color,
      interior_color: form.interior_color,
      mileage: parseInt(form.mileage),
      price: parseFloat(form.price),
      status: form.status,
      transmission: form.transmission,
      drivetrain: form.drivetrain,
      engine: form.engine,
      features: selectedFeatures.join(', '),
      title_status: form.title_status,
      sale_price: (form.status === 'sale' || form.status === 'clearance') && form.sale_price ? parseFloat(form.sale_price) : null,
      is_sale: form.status === 'sale' || form.status === 'clearance',
      description: form.description,
      thumbnail_index: thumbnailIndex,
      featured,
    }

    let vehicleId = vehicle?.id

    if (isEdit) {
      const { error } = await supabase.from('vehicles').update(payload).eq('id', vehicleId)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('vehicles').insert(payload).select().single()
      if (error) { setError(error.message); setSaving(false); return }
      vehicleId = data.id
    }

    const orderedImages = await uploadPhotos(vehicleId!)
    await supabase.from('vehicles').update({ images: orderedImages, thumbnail_index: thumbnailIndex }).eq('id', vehicleId)

    router.push('/dashboard')
    router.refresh()
  }

  async function deleteVehicle() {
    if (!vehicle || !confirm('Delete this vehicle permanently?')) return
    await supabase.from('vehicles').delete().eq('id', vehicle.id)
    router.push('/dashboard')
    router.refresh()
  }

  const customSelected = selectedFeatures.filter(f => !ALL_COMMON.includes(f))

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

      {/* VIN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">VIN Auto-Fill</h3>
        <div className="flex gap-3">
          <input
            name="vin" value={form.vin} onChange={handleChange} maxLength={17}
            placeholder="Enter 17-character VIN"
            className={`${inputClass} flex-1 font-mono uppercase`}
          />
          <button type="button" onClick={lookupVin} disabled={vinLoading}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap">
            {vinLoading ? 'Looking up…' : 'Auto-Fill'}
          </button>
        </div>
        {vinError && <p className="text-sm text-red-600 mt-2">{vinError}</p>}
        <p className="text-xs text-gray-400 mt-2">Fills year, make, model, engine, and transmission automatically.</p>
      </div>

      {/* Vehicle Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-5">Vehicle Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Year</label>
            <input name="year" type="number" value={form.year} onChange={handleChange} placeholder="2022" className={inputClass} /></div>
          <div><label className={labelClass}>Make</label>
            <input name="make" value={form.make} onChange={handleChange} placeholder="Toyota" className={inputClass} /></div>
          <div><label className={labelClass}>Model</label>
            <input name="model" value={form.model} onChange={handleChange} placeholder="Camry" className={inputClass} /></div>
          <div><label className={labelClass}>Trim</label>
            <input name="trim" value={form.trim} onChange={handleChange} placeholder="XSE" className={inputClass} /></div>
          <div><label className={labelClass}>Exterior Color</label>
            <input name="color" value={form.color} onChange={handleChange} placeholder="Midnight Black" className={inputClass} /></div>
          <div><label className={labelClass}>Interior Color</label>
            <input name="interior_color" value={form.interior_color} onChange={handleChange} placeholder="Black Leather" className={inputClass} /></div>
          <div><label className={labelClass}>Mileage</label>
            <input name="mileage" type="number" value={form.mileage} onChange={handleChange} placeholder="45000" className={inputClass} /></div>
          <div><label className={labelClass}>Price ($)</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="24500" className={inputClass} /></div>
          <div><label className={labelClass}>Engine</label>
            <input name="engine" value={form.engine} onChange={handleChange} placeholder="3.5L V6" className={inputClass} /></div>
          <div><label className={labelClass}>Transmission</label>
            <select name="transmission" value={form.transmission} onChange={handleChange} className={inputClass}>
              <option value="">Select…</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="CVT">CVT</option>
              <option value="Other">Other</option>
            </select></div>
          <div><label className={labelClass}>Drivetrain</label>
            <select name="drivetrain" value={form.drivetrain} onChange={handleChange} className={inputClass}>
              <option value="">Select…</option>
              <option value="FWD">FWD</option>
              <option value="RWD">RWD</option>
              <option value="AWD">AWD</option>
              <option value="4WD">4WD</option>
            </select></div>
          <div><label className={labelClass}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="sale">Sale / Discounted</option>
              <option value="clearance">Clearance</option>
            </select></div>
          {(form.status === 'sale' || form.status === 'clearance') && (
            <div className="col-span-2">
              <label className={labelClass}>Sale Price ($) <span className="text-[#5BB8F5]">*</span></label>
              <input name="sale_price" type="number" value={form.sale_price}
                onChange={handleChange} placeholder={form.price || 'Enter discounted price'}
                className={`${inputClass} border-[#5BB8F5] focus:ring-[#5BB8F5]`} />
              <p className="text-xs text-zinc-400 mt-1">Original price will show crossed out. Sale price shown in green.</p>
            </div>
          )}
          <div><label className={labelClass}>Title Status</label>
            <select name="title_status" value={form.title_status} onChange={handleChange} className={inputClass}>
              <option value="Clean">Clean</option>
              <option value="Salvage">Salvage</option>
              <option value="Rebuilt">Rebuilt / Reconstructed</option>
              <option value="Lien">Lien</option>
              <option value="Unknown">Unknown</option>
            </select></div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            placeholder="Clean title, one owner, accident free…"
            className={`${inputClass} resize-none`} />
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900">Features & Accessories</h3>
          {selectedFeatures.length > 0 && (
            <span className="text-xs text-[#5BB8F5] font-medium">{selectedFeatures.length} selected</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-5">Click badges to select. Use + Custom for anything not listed.</p>
        <div className="space-y-4">
          {FEATURE_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.features.map(feat => {
                  const active = selectedFeatures.includes(feat)
                  return (
                    <button key={feat} type="button" onClick={() => toggleFeature(feat)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                        active ? 'bg-[#5BB8F5] border-[#5BB8F5] text-white' : 'border-zinc-200 text-zinc-600 hover:border-[#5BB8F5] hover:text-[#5BB8F5] bg-white'
                      }`}>
                      {active && '✓ '}{feat}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Custom</p>
            <div className="flex flex-wrap gap-2 items-center">
              {customSelected.map(feat => (
                <span key={feat} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-[#5BB8F5] border border-[#5BB8F5] text-white font-medium">
                  {feat}
                  <button type="button" onClick={() => toggleFeature(feat)} className="hover:text-white/70 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {showCustomInput ? (
                <div className="flex items-center gap-2">
                  <input autoFocus type="text" value={customFeature}
                    onChange={e => setCustomFeature(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomFeature() } if (e.key === 'Escape') { setShowCustomInput(false); setCustomFeature('') } }}
                    placeholder="e.g. Lift Kit, Bull Bar…"
                    className="border border-[#5BB8F5] rounded-full px-3 py-1 text-xs text-gray-900 bg-white focus:outline-none w-40" />
                  <button type="button" onClick={addCustomFeature}
                    className="text-xs bg-[#5BB8F5] text-white px-3 py-1 rounded-full font-medium hover:bg-[#3A9FE0]">Add</button>
                  <button type="button" onClick={() => { setShowCustomInput(false); setCustomFeature('') }}
                    className="text-xs text-zinc-400 hover:text-zinc-600">Cancel</button>
                </div>
              ) : (
                <button type="button" onClick={() => setShowCustomInput(true)}
                  className="text-xs px-3 py-1.5 rounded-full border border-dashed border-zinc-300 text-zinc-400 hover:border-[#5BB8F5] hover:text-[#5BB8F5] flex items-center gap-1 transition-colors">
                  <Plus className="w-3 h-3" /> Add Custom
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured */}
      <div className={`rounded-xl border-2 p-5 transition-colors ${featured ? 'bg-amber-50 border-amber-400' : 'bg-white border-gray-200 shadow-sm'}`}>
        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={e => setFeatured(e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded accent-amber-500 cursor-pointer shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${featured ? 'text-amber-500' : 'text-zinc-400'}`} />
              <span className={`font-semibold text-sm ${featured ? 'text-amber-700' : 'text-gray-700'}`}>
                Feature on Homepage
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              This vehicle will appear in the Featured Vehicles section on the homepage. Multiple featured vehicles are shown in random order.
            </p>
          </div>
        </label>
      </div>

      {/* Photos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900">Photos</h3>
          {photos.length > 0 ? (
            <p className="text-xs text-gray-400 mt-0.5">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} · drag to reorder · hover to set thumbnail or remove
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">Add photos below</p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black file:text-white file:text-sm file:font-medium hover:file:bg-gray-800 cursor-pointer mb-4"
        />

        {photos.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {photos.map((photo, i) => {
              const isThumb = thumbnailIndex === i
              const loading = photo.isNew && !photo.src
              return (
                <div
                  key={photo.key}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={e => handleDragOver(e, i)}
                  onDrop={e => handleDrop(e, i)}
                  onDragEnd={handleDragEnd}
                  className={`relative group rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all duration-150 ${
                    dragOver === i
                      ? 'border-[#5BB8F5] scale-95 opacity-60'
                      : isThumb
                      ? 'border-yellow-400'
                      : photo.isNew
                      ? 'border-[#5BB8F5]/50'
                      : 'border-transparent'
                  }`}
                >
                  {loading ? (
                    <div className="w-full aspect-square bg-zinc-100 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-[#5BB8F5] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <img
                      src={photo.src}
                      draggable={false}
                      className="w-full aspect-square object-cover object-bottom"
                      alt=""
                    />
                  )}

                  {/* Badge */}
                  {(isThumb || photo.isNew) && (
                    <div className={`absolute top-1 left-1 text-xs font-bold px-1.5 py-0.5 rounded ${
                      isThumb ? 'bg-yellow-400 text-black' : 'bg-[#5BB8F5] text-white'
                    }`}>
                      {isThumb ? 'THUMB' : 'NEW'}
                    </div>
                  )}

                  {/* Hover controls */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button type="button" onClick={() => setThumbnailIndex(i)} title="Set as thumbnail"
                      className="bg-yellow-400 text-black rounded-full p-1.5">
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => removePhoto(i)}
                      className="bg-red-600 text-white rounded-full p-1.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving}
          className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Vehicle'}
        </button>
        <button type="button" onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        {isEdit && (
          <button type="button" onClick={deleteVehicle}
            className="ml-auto text-sm text-red-600 hover:text-red-800 font-medium">
            Delete Vehicle
          </button>
        )}
      </div>
    </form>
  )
}
