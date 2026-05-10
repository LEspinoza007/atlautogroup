'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, CheckCircle, ChevronDown } from 'lucide-react'

const inputClass = "w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-zinc-400"
const labelClass = "block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide"

export default function ProcurementForm() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    make: '', model: '', trim: '', year_min: '', year_max: '',
    color: '', max_mileage: '', budget: '', notes: '',
    first_name: '', last_name: '', phone: '', email: '',
  })
  const supabase = createClient()

  function set(field: string, val: string) {
    setForm(p => ({ ...p, [field]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await supabase.from('procurement_requests').insert({
      make: form.make || null,
      model: form.model || null,
      trim: form.trim || null,
      year_min: form.year_min ? parseInt(form.year_min) : null,
      year_max: form.year_max ? parseInt(form.year_max) : null,
      color: form.color || null,
      max_mileage: form.max_mileage ? parseInt(form.max_mileage) : null,
      budget: form.budget ? parseFloat(form.budget) : null,
      notes: form.notes || null,
      client_first_name: form.first_name,
      client_last_name: form.last_name,
      client_phone: form.phone,
      client_email: form.email || null,
    })
    setSubmitting(false)
    setStep('success')
  }

  return (
    <div className="mt-12 border-t border-zinc-200 pt-10">
      <div className="text-center mb-6">
        <button onClick={() => setOpen(o => !o)}
          className="inline-flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 text-white px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all group shadow-lg hover:shadow-xl hover:-translate-y-0.5">
          <Search className="w-4 h-4" />
          Looking for a specific car? We can find it for you!
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="max-w-2xl mx-auto bg-white border border-zinc-200 rounded-2xl shadow-lg p-8">
          {step === 'success' ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-zinc-900 mb-1">Request Submitted!</h3>
              <p className="text-zinc-500 text-sm">We&apos;ll start searching and reach out as soon as we find a match.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="font-bold text-zinc-900 text-lg mb-1">Tell us what you&apos;re looking for</h3>
                <p className="text-zinc-500 text-sm">Fill in as much or as little as you know — we&apos;ll do the searching.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Make</label><input placeholder="Toyota" value={form.make} onChange={e => set('make', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Model</label><input placeholder="Tacoma" value={form.model} onChange={e => set('model', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Trim</label><input placeholder="TRD Sport (optional)" value={form.trim} onChange={e => set('trim', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Preferred Color</label><input placeholder="Any" value={form.color} onChange={e => set('color', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Year From</label><input type="number" placeholder="2018" value={form.year_min} onChange={e => set('year_min', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Year To</label><input type="number" placeholder="2024" value={form.year_max} onChange={e => set('year_max', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Max Mileage</label><input type="number" placeholder="80,000" value={form.max_mileage} onChange={e => set('max_mileage', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Budget ($)</label><input type="number" placeholder="25,000" value={form.budget} onChange={e => set('budget', e.target.value)} className={inputClass} /></div>
              </div>

              <div><label className={labelClass}>Additional Notes</label>
                <textarea rows={2} placeholder="Any other details (4x4, sunroof, towing package…)" value={form.notes} onChange={e => set('notes', e.target.value)} className={`${inputClass} resize-none`} />
              </div>

              <div className="border-t border-zinc-100 pt-4">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Your Contact Info</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>First Name</label><input required placeholder="John" value={form.first_name} onChange={e => set('first_name', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Last Name</label><input required placeholder="Doe" value={form.last_name} onChange={e => set('last_name', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Phone</label><input required type="tel" placeholder="(956) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Email <span className="font-normal normal-case text-zinc-400">(optional)</span></label><input type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} /></div>
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
