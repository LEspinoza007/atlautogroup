'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Vehicle, VehicleStatus } from '@/types'
import { Star, X, ChevronLeft, ChevronRight } from 'lucide-react'

type Props = { vehicle?: Vehicle }

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
const labelClass = "block text-sm font-medium text-gray-700 mb-1"

const EMPTY_FORM = {
  vin: '', year: '', make: '', model: '', trim: '', color: '', interior_color: '',
  mileage: '', price: '', status: 'available' as VehicleStatus,
  transmission: '', drivetrain: '', engine: '', features: '', description: '',
}

export default function VehicleForm({ vehicle }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!vehicle

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
    status: vehicle?.status ?? 'available',
    transmission: vehicle?.transmission ?? '',
    drivetrain: vehicle?.drivetrain ?? '',
    engine: vehicle?.engine ?? '',
    features: vehicle?.features ?? '',
    title_status: vehicle?.title_status ?? 'Clean',
    sale_price: vehicle?.sale_price?.toString() ?? '',
    description: vehicle?.description ?? '',
  })

  const [vinLoading, setVinLoading] = useState(false)
  const [vinError, setVinError] = useState('')
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(vehicle?.images ?? [])
  const [thumbnailIndex, setThumbnailIndex] = useState(vehicle?.thumbnail_index ?? 0)
  const [showPhotoEditor, setShowPhotoEditor] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
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
    setNewFiles(prev => [...prev, ...files])
    files.forEach(f => {
      const reader = new FileReader()
      reader.onload = ev => setNewPreviews(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(f)
    })
  }

  function moveExisting(i: number, dir: -1 | 1) {
    const next = [...existingImages]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    if (thumbnailIndex === i) setThumbnailIndex(j)
    else if (thumbnailIndex === j) setThumbnailIndex(i)
    setExistingImages(next)
  }

  function removeExisting(i: number) {
    const next = existingImages.filter((_, idx) => idx !== i)
    setExistingImages(next)
    if (thumbnailIndex >= next.length) setThumbnailIndex(Math.max(0, next.length - 1))
  }

  function removeNew(i: number) {
    setNewFiles(prev => prev.filter((_, idx) => idx !== i))
    setNewPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  async function uploadImages(vehicleId: string): Promise<string[]> {
    const urls: string[] = []
    for (const file of newFiles) {
      const ext = file.name.split('.').pop()
      const path = `${vehicleId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('vehicle-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('vehicle-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    return urls
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
      features: form.features,
      title_status: form.title_status,
      sale_price: (form.status === 'sale' || form.status === 'clearance') && form.sale_price ? parseFloat(form.sale_price) : null,
      is_sale: form.status === 'sale' || form.status === 'clearance',
      description: form.description,
      thumbnail_index: thumbnailIndex,
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

    const newUrls = await uploadImages(vehicleId!)
    const allImages = [...existingImages, ...newUrls]
    await supabase.from('vehicles').update({ images: allImages, thumbnail_index: thumbnailIndex }).eq('id', vehicleId)

    router.push('/dashboard')
    router.refresh()
  }

  async function deleteVehicle() {
    if (!vehicle || !confirm('Delete this vehicle permanently?')) return
    await supabase.from('vehicles').delete().eq('id', vehicle.id)
    router.push('/dashboard')
    router.refresh()
  }

  const allImages = [...existingImages, ...newPreviews]

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
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap"
          >
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
          <div>
            <label className={labelClass}>Year</label>
            <input name="year" type="number" value={form.year} onChange={handleChange} placeholder="2022" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Make</label>
            <input name="make" value={form.make} onChange={handleChange} placeholder="Toyota" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Model</label>
            <input name="model" value={form.model} onChange={handleChange} placeholder="Camry" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Trim</label>
            <input name="trim" value={form.trim} onChange={handleChange} placeholder="XSE" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Exterior Color</label>
            <input name="color" value={form.color} onChange={handleChange} placeholder="Midnight Black" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Interior Color</label>
            <input name="interior_color" value={form.interior_color} onChange={handleChange} placeholder="Black Leather" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Mileage</label>
            <input name="mileage" type="number" value={form.mileage} onChange={handleChange} placeholder="45000" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Price ($)</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="24500" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Engine</label>
            <input name="engine" value={form.engine} onChange={handleChange} placeholder="3.5L V6" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Transmission</label>
            <select name="transmission" value={form.transmission} onChange={handleChange} className={inputClass}>
              <option value="">Select…</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="CVT">CVT</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Drivetrain</label>
            <select name="drivetrain" value={form.drivetrain} onChange={handleChange} className={inputClass}>
              <option value="">Select…</option>
              <option value="FWD">FWD</option>
              <option value="RWD">RWD</option>
              <option value="AWD">AWD</option>
              <option value="4WD">4WD</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="sale">Sale / Discounted</option>
              <option value="clearance">Clearance</option>
            </select>
          </div>
          {(form.status === 'sale' || form.status === 'clearance') && (
            <div className="col-span-2">
              <label className={labelClass}>Sale Price ($) <span className="text-rose-500">*</span></label>
              <input name="sale_price" type="number" value={form.sale_price}
                onChange={handleChange} placeholder={form.price || 'Enter discounted price'}
                className={`${inputClass} border-rose-300 focus:ring-rose-500`}
              />
              <p className="text-xs text-zinc-400 mt-1">Original price will show crossed out. Sale price shown in green.</p>
            </div>
          )}
          <div>
            <label className={labelClass}>Title Status</label>
            <select name="title_status" value={form.title_status} onChange={handleChange} className={inputClass}>
              <option value="Clean">Clean</option>
              <option value="Salvage">Salvage</option>
              <option value="Rebuilt">Rebuilt / Reconstructed</option>
              <option value="Lien">Lien</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Accessories & Features</label>
          <input name="features" value={form.features} onChange={handleChange}
            placeholder="Sunroof, backup camera, heated seats, Apple CarPlay…"
            className={inputClass}
          />
        </div>
        <div className="mt-4">
          <label className={labelClass}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            placeholder="Clean title, one owner, accident free…"
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {/* Photos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Photos</h3>
          {allImages.length > 1 && (
            <button type="button" onClick={() => setShowPhotoEditor(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Organize Photos
            </button>
          )}
        </div>

        <input type="file" accept="image/*" multiple onChange={handleFileSelect}
          className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black file:text-white file:text-sm file:font-medium hover:file:bg-gray-800 cursor-pointer mb-4"
        />

        {allImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {existingImages.map((url, i) => (
              <div key={url} className={`relative group rounded-lg overflow-hidden border-2 ${i === thumbnailIndex ? 'border-yellow-400' : 'border-transparent'}`}>
                <img src={url} className="w-full aspect-square object-cover" alt="" />
                {i === thumbnailIndex && (
                  <div className="absolute top-1 left-1 bg-yellow-400 text-black text-xs font-bold px-1 rounded">THUMB</div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button type="button" onClick={() => setThumbnailIndex(i)} title="Set as thumbnail"
                    className="bg-yellow-400 text-black rounded-full p-1">
                    <Star className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={() => removeExisting(i)}
                    className="bg-red-600 text-white rounded-full p-1">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {newPreviews.map((src, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden border-2 border-blue-300">
                <img src={src} className="w-full aspect-square object-cover" alt="" />
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs font-bold px-1 rounded">NEW</div>
                <button type="button" onClick={() => removeNew(i)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3">Click the star icon on any photo to set it as the thumbnail. New photos are shown in blue.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving}
          className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Vehicle'}
        </button>
        <button type="button" onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        {isEdit && (
          <button type="button" onClick={deleteVehicle}
            className="ml-auto text-sm text-red-600 hover:text-red-800 font-medium"
          >Delete Vehicle</button>
        )}
      </div>

      {/* Photo organizer modal */}
      {showPhotoEditor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Organize Photos</h3>
              <button onClick={() => setShowPhotoEditor(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Use arrows to reorder. Click the star to set as thumbnail.</p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {existingImages.map((url, i) => (
                <div key={url} className={`flex items-center gap-3 p-2 rounded-lg border ${i === thumbnailIndex ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                  <img src={url} className="w-14 h-14 object-cover rounded-lg shrink-0" alt="" />
                  <div className="flex-1 text-sm text-gray-600">Photo {i + 1}{i === thumbnailIndex ? ' · Thumbnail' : ''}</div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setThumbnailIndex(i)} title="Set as thumbnail"
                      className={`p-1.5 rounded-full ${i === thumbnailIndex ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-500 hover:bg-yellow-100'}`}>
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => moveExisting(i, -1)} disabled={i === 0}
                      className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => moveExisting(i, 1)} disabled={i === existingImages.length - 1}
                      className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => removeExisting(i)}
                      className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPhotoEditor(false)}
              className="mt-4 w-full bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
