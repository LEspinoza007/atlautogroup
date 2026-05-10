'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BusinessHours, BlackoutDate } from '@/types'
import { Calendar, Clock, User, Phone, Mail, CheckCircle } from 'lucide-react'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

function generateSlots(open: string, close: string): string[] {
  const slots: string[] = []
  const [oh, om] = open.split(':').map(Number)
  const [ch, cm] = close.split(':').map(Number)
  let h = oh, m = om
  while (h * 60 + m < ch * 60 + cm - 29) {
    slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
    m += 30; if (m >= 60) { h++; m = 0 }
  }
  return slots
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 || 12
  return `${hr}:${String(m).padStart(2,'0')} ${ampm}`
}

type Props = {
  vehicleId: string
  vehicleName: string
  businessHours: BusinessHours[]
  blackoutDates: BlackoutDate[]
}

export default function AppointmentScheduler({ vehicleId, vehicleName, businessHours, blackoutDates }: Props) {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', email: '' })
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const blackoutSet = new Set(blackoutDates.map(b => b.date))

  function getHoursForDate(d: string): BusinessHours | null {
    if (!d) return null
    const dow = new Date(d + 'T12:00:00').getDay()
    return businessHours.find(h => h.day_of_week === dow) ?? null
  }

  const selectedHours = getHoursForDate(date)
  const slots = selectedHours && !selectedHours.is_closed && selectedHours.open_time && selectedHours.close_time
    ? generateSlots(selectedHours.open_time, selectedHours.close_time)
    : []

  const today = new Date().toISOString().split('T')[0]

  function isDateDisabled(d: string) {
    if (d < today) return true
    if (blackoutSet.has(d)) return true
    const hours = getHoursForDate(d)
    return !hours || hours.is_closed
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !time) { setError('Please select a date and time.'); return }
    setSubmitting(true); setError('')
    const { error: err } = await supabase.from('appointments').insert({
      vehicle_id: vehicleId,
      client_first_name: form.first_name,
      client_last_name: form.last_name,
      client_phone: form.phone,
      client_email: form.email || null,
      appointment_date: date,
      appointment_time: time,
      dnc_promotional: !consent,
    })
    setSubmitting(false)
    if (err) { setError('Something went wrong. Please try again.'); return }
    setStep('success')
  }

  if (step === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-zinc-900 mb-1">Appointment Requested!</h3>
        <p className="text-zinc-500 text-sm">
          We&apos;ll reach out to {form.first_name} at {form.phone} to confirm your visit on {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {formatTime(time)}.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Calendar className="w-5 h-5 text-[#5BB8F5]" />
        <h3 className="font-bold text-zinc-900 text-lg">Want to take a look in person?</h3>
      </div>
      <p className="text-zinc-500 text-sm mb-6">Schedule a time to see the {vehicleName} — no commitment needed.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Date</label>
            <input type="date" min={today} value={date}
              onChange={e => { setDate(e.target.value); setTime('') }}
              className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#5BB8F5]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">
              <Clock className="w-3 h-3 inline mr-1" />Time
            </label>
            {slots.length > 0 ? (
              <select value={time} onChange={e => setTime(e.target.value)}
                className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#5BB8F5]">
                <option value="">Pick a time</option>
                {slots.map(s => <option key={s} value={s}>{formatTime(s)}</option>)}
              </select>
            ) : date ? (
              <div className="border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-400 bg-white">
                {blackoutSet.has(date) ? 'Closed this date' : selectedHours?.is_closed ? `Closed on ${DAYS[new Date(date + 'T12:00:00').getDay()]}s` : 'Select a date first'}
              </div>
            ) : (
              <div className="border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-400 bg-white">Select a date first</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input type="text" required placeholder="John" value={form.first_name}
                onChange={e => setForm(p => ({...p, first_name: e.target.value}))}
                className="w-full border border-zinc-300 rounded-xl pl-8 pr-3 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#5BB8F5]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Last Name</label>
            <input type="text" required placeholder="Doe" value={form.last_name}
              onChange={e => setForm(p => ({...p, last_name: e.target.value}))}
              className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#5BB8F5]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input type="tel" required placeholder="(956) 000-0000" value={form.phone}
                onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                className="w-full border border-zinc-300 rounded-xl pl-8 pr-3 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#5BB8F5]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Email <span className="font-normal text-zinc-400">(optional)</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input type="email" placeholder="john@email.com" value={form.email}
                onChange={e => setForm(p => ({...p, email: e.target.value}))}
                className="w-full border border-zinc-300 rounded-xl pl-8 pr-3 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#5BB8F5]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#5BB8F5] shrink-0"
            />
            <span className="text-xs text-zinc-500 leading-relaxed">
              I understand and consent to receive promotional communications (SMS, email, calls) from ATL Auto Group regarding vehicles, offers, and services. You may opt out at any time by replying STOP or contacting us directly. Consent is not required to schedule a visit.
            </span>
          </label>
          {!consent && (
            <p className="text-xs text-amber-600 mt-2 pl-7">
              Without consent your number will be marked <strong>Do Not Contact</strong> for promotional messages.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting || !date || !time}
          className="w-full bg-[#5BB8F5] hover:bg-[#3A9FE0] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
          {submitting ? 'Scheduling…' : 'Schedule Visit'}
        </button>
      </form>
    </div>
  )
}
