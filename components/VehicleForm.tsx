'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Vehicle, VehicleStatus } from '@/types'

type Props = {
  vehicle?: Vehicle
}

const EMPTY_FORM = {
  vin: '', year: '', make: '', model: '', trim: '', color: '',
  mileage: '', price: '', status: 'available' as VehicleStatus, description: '',
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
    mileage: vehicle?.mileage?.toString() ?? '',
    price: vehicle?.price?.toString() ?? '',
    status: vehicle?.status ?? 'available',
    description: vehicle?.description ?? '',
  })

  const [vinLoading, setVinLoading] = useState(false)
  const [vinError, setVinError] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(vehicle?.images ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function lookupVin() {
    if (form.vin.length !== 17) {
      setVinError('VIN must be exactly 17 characters.')
      return
    }
    setVinLoading(true)
    setVinError('')
    const res = await fetch(`/api/vin?vin=${form.vin}`)
    if (!res.ok) {
      setVinError('VIN not found. Please fill in details manually.')
      setVinLoading(false)
      return
    }
    const data = await res.json()
    setForm(prev => ({
      ...prev,
      year: data.year || prev.year,
      make: data.make || prev.make,
      model: data.model || prev.model,
      trim: data.trim || prev.trim,
    }))
    setVinLoading(false)
  }

  async function uploadImages(vehicleId: string): Promise<string[]> {
    const urls: string[] = []
    for (const file of images) {
      const ext = file.name.split('.').pop()
      const path = `${vehicleId}/${Date.now()}.${ext}`
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
    setSaving(true)
    setError('')

    const payload = {
      vin: form.vin.toUpperCase(),
      year: parseInt(form.year),
      make: form.make,
      model: form.model,
      trim: form.trim,
      color: form.color,
      mileage: parseInt(form.mileage),
      price: parseFloat(form.price),
      status: form.status,
      description: form.description,
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

    await supabase.from('vehicles').update({ images: allImages }).eq('id', vehicleId)

    router.push('/dashboard')
    router.refresh()
  }

  async function removeExistingImage(url: string) {
    setExistingImages(prev => prev.filter(u => u !== url))
  }

  async function deleteVehicle() {
    if (!vehicle || !confirm('Delete this vehicle permanently?')) return
    await supabase.from('vehicles').delete().eq('id', vehicle.id)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="font-semibold text-gray-900">VIN Lookup</h3>
        <div className="flex gap-3">
          <input
            name="vin"
            value={form.vin}
            onChange={handleChange}
            maxLength={17}
            placeholder="17-character VIN"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="button"
            onClick={lookupVin}
            disabled={vinLoading}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {vinLoading ? 'Looking up…' : 'Auto-Fill'}
          </button>
        </div>
        {vinError && <p className="text-sm text-red-600">{vinError}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h3 className="font-semibold text-gray-900">Vehicle Details</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Year', name: 'year', type: 'number', placeholder: '2022' },
            { label: 'Make', name: 'make', placeholder: 'Toyota' },
            { label: 'Model', name: 'model', placeholder: 'Camry' },
            { label: 'Trim', name: 'trim', placeholder: 'XSE (optional)' },
            { label: 'Color', name: 'color', placeholder: 'Midnight Black' },
            { label: 'Mileage', name: 'mileage', type: 'number', placeholder: '45000' },
            { label: 'Price ($)', name: 'price', type: 'number', placeholder: '24500' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                name={field.name}
                type={field.type ?? 'text'}
                value={(form as Record<string, string>)[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="available">Available</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Clean title, one owner, accident free…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Photos</h3>
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {existingImages.map(url => (
              <div key={url} className="relative group w-24 h-24">
                <img src={url} className="w-24 h-24 object-cover rounded-lg border border-gray-200" alt="" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(url)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >×</button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={e => setImages(Array.from(e.target.files ?? []))}
          className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black file:text-white file:text-sm file:font-medium hover:file:bg-gray-800 cursor-pointer"
        />
        {images.length > 0 && (
          <p className="text-sm text-gray-500">{images.length} photo{images.length !== 1 ? 's' : ''} selected</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Vehicle'}
        </button>
        <button type="button" onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={deleteVehicle}
            className="ml-auto text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Delete Vehicle
          </button>
        )}
      </div>
    </form>
  )
}
