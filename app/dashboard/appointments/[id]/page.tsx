'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Phone, Mail, ExternalLink, RefreshCw } from 'lucide-react'
import { BusinessHours, BlackoutDate } from '@/types'

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
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

const inputClass = "w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"

export default function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const [apt, setApt] = useState<any>(null)
  const [hours, setHours] = useState<BusinessHours[]>([])
  const [blackouts, setBlackouts] = useState<BlackoutDate[]>([])
  const [rescheduling, setRescheduling] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: a }, { data: h }, { data: b }] = await Promise.all([
        supabase.from('appointments').select('*, vehicles(id, year, make, model)').eq('id', params.id).single(),
        supabase.from('business_hours').select('*').order('day_of_week'),
        supabase.from('blackout_dates').select('*'),
      ])
      setApt(a); setHours(h ?? []); setBlackouts(b ?? [])
      setStatus(a?.status ?? '')
    }
    load()
  }, [params.id])

  if (!apt) return <div className="text-zinc-400 text-sm py-10 text-center">Loading…</div>

  const blackoutSet = new Set(blackouts.map(b => b.date))

  function getSlots(d: string) {
    if (!d) return []
    const dow = new Date(d + 'T12:00:00').getDay()
    const h = hours.find(h => h.day_of_week === dow)
    if (!h || h.is_closed || !h.open_time || !h.close_time) return []
    return generateSlots(h.open_time, h.close_time)
  }

  const slots = getSlots(newDate)
  const today = new Date().toISOString().split('T')[0]

  async function handleSaveStatus() {
    setSaving(true)
    await supabase.from('appointments').update({ status }).eq('id', apt.id)
    setSaving(false)
    router.refresh()
  }

  async function handleReschedule() {
    if (!newDate || !newTime) return
    setSaving(true)
    await supabase.from('appointments').update({
      appointment_date: newDate,
      appointment_time: newTime,
      status: 'rescheduled',
    }).eq('id', apt.id)
    setSaving(false)
    setRescheduling(false)
    setApt((p: any) => ({ ...p, appointment_date: newDate, appointment_time: newTime, status: 'rescheduled' }))
    setStatus('rescheduled')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/appointments" className="text-sm text-zinc-400 hover:text-zinc-700">← Appointments</Link>
        <h2 className="text-xl font-bold text-zinc-900">Appointment Details</h2>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Client</p>
            <p className="font-semibold text-zinc-900">{apt.client_first_name} {apt.client_last_name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Promo Contact</p>
            {apt.dnc_promotional
              ? <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">DNC — Do Not Contact</span>
              : <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Consented</span>
            }
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Phone</p>
            <a href={`https://wa.me/${apt.client_phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-green-600 hover:underline font-medium">
              <Phone className="w-3.5 h-3.5" />{apt.client_phone}
            </a>
          </div>
          {apt.client_email && (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Email</p>
              <a href={`mailto:${apt.client_email}`} className="flex items-center gap-1 text-blue-600 hover:underline text-sm">
                <Mail className="w-3.5 h-3.5" />{apt.client_email}
              </a>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Scheduled</p>
            <div className="flex items-center gap-1 text-zinc-900 font-medium">
              <Calendar className="w-4 h-4 text-rose-400" />
              {formatDate(apt.appointment_date)} at {formatTime(apt.appointment_time)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Vehicle</p>
            {apt.vehicles ? (
              <Link href={`/inventory/${apt.vehicles.id}`} target="_blank"
                className="flex items-center gap-1 text-blue-600 hover:underline font-medium text-sm">
                <ExternalLink className="w-3.5 h-3.5" />
                {apt.vehicles.year} {apt.vehicles.make} {apt.vehicles.model}
              </Link>
            ) : <span className="text-zinc-400">—</span>}
          </div>
        </div>

        {/* Status update */}
        <div className="border-t border-zinc-100 pt-4">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Update Status</label>
          <div className="flex gap-3">
            <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
              {['pending','confirmed','completed','cancelled','rescheduled'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button onClick={handleSaveStatus} disabled={saving || status === apt.status}
              className="bg-zinc-900 hover:bg-zinc-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Reschedule */}
        <div className="border-t border-zinc-100 pt-4">
          <button onClick={() => setRescheduling(r => !r)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
            <RefreshCw className="w-4 h-4" />
            {rescheduling ? 'Cancel Reschedule' : 'Reschedule Appointment'}
          </button>

          {rescheduling && (
            <div className="mt-4 space-y-3">
              <p className="text-xs text-zinc-500">Select a new date and time, then contact the client to confirm.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">New Date</label>
                  <input type="date" min={today} value={newDate}
                    onChange={e => { setNewDate(e.target.value); setNewTime('') }}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">New Time</label>
                  {slots.length > 0 ? (
                    <select value={newTime} onChange={e => setNewTime(e.target.value)} className={inputClass}>
                      <option value="">Pick a time</option>
                      {slots.map(s => <option key={s} value={s}>{formatTime(s)}</option>)}
                    </select>
                  ) : (
                    <div className="border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-400 bg-zinc-50">
                      {newDate ? 'Closed this day' : 'Select a date first'}
                    </div>
                  )}
                </div>
              </div>
              <button onClick={handleReschedule} disabled={!newDate || !newTime || saving}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors">
                {saving ? 'Saving…' : 'Confirm Reschedule'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
