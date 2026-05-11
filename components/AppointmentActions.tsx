'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Settings, RefreshCw, X, Trash2 } from 'lucide-react'
import { BusinessHours } from '@/types'

function generateSlots(open: string, close: string): string[] {
  const slots: string[] = []
  const [oh, om] = open.split(':').map(Number)
  const [ch, cm] = close.split(':').map(Number)
  let h = oh, m = om
  while (h * 60 + m < ch * 60 + cm - 29) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    m += 30; if (m >= 60) { h++; m = 0 }
  }
  return slots
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

const inputClass = "w-full border border-zinc-300 rounded-xl px-3 py-2 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#5BB8F5]"

export default function AppointmentActions({ aptId }: { aptId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'main' | 'reschedule'>('main')
  const [hours, setHours] = useState<BusinessHours[]>([])
  const [blackouts, setBlackouts] = useState<Set<string>>(new Set())
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && hours.length === 0) {
      Promise.all([
        supabase.from('business_hours').select('*').order('day_of_week'),
        supabase.from('blackout_dates').select('date'),
      ]).then(([{ data: h }, { data: b }]) => {
        setHours(h ?? [])
        setBlackouts(new Set((b ?? []).map((x: any) => x.date)))
      })
    }
  }, [open])

  function close() { setOpen(false); setTab('main'); setNewDate(''); setNewTime('') }

  function getSlots(d: string) {
    if (!d || blackouts.has(d)) return []
    const dow = new Date(d + 'T12:00:00').getDay()
    const h = hours.find(h => h.day_of_week === dow)
    if (!h || h.is_closed || !h.open_time || !h.close_time) return []
    return generateSlots(h.open_time, h.close_time)
  }

  async function handleCancel() {
    if (!window.confirm('Cancel this appointment?')) return
    setSaving(true)
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', aptId)
    setSaving(false)
    close()
    router.refresh()
  }

  async function handleDelete() {
    if (!window.confirm('Permanently delete this appointment? This cannot be undone.')) return
    setSaving(true)
    await supabase.from('appointments').delete().eq('id', aptId)
    setSaving(false)
    close()
    router.refresh()
  }

  async function handleReschedule() {
    if (!newDate || !newTime) return
    setSaving(true)
    await supabase.from('appointments').update({
      appointment_date: newDate,
      appointment_time: newTime,
      status: 'rescheduled',
    }).eq('id', aptId)
    setSaving(false)
    close()
    router.refresh()
  }

  const slots = getSlots(newDate)
  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 font-medium border border-zinc-200 hover:border-zinc-400 px-2.5 py-1 rounded-lg transition-colors">
        <Settings className="w-3 h-3" />Manage
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={e => { if (e.target === e.currentTarget) close() }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                {tab === 'reschedule' && (
                  <button onClick={() => setTab('main')} className="text-zinc-400 hover:text-zinc-700 mr-1">
                    ←
                  </button>
                )}
                <h3 className="font-bold text-zinc-900 text-base">
                  {tab === 'main' ? 'Manage Appointment' : 'Reschedule'}
                </h3>
              </div>
              <button onClick={close} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {tab === 'main' ? (
              <div className="p-6 space-y-3">
                <button onClick={() => setTab('reschedule')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 hover:border-[#5BB8F5] hover:bg-sky-50 transition-colors text-left">
                  <RefreshCw className="w-4 h-4 text-[#5BB8F5] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Reschedule</p>
                    <p className="text-xs text-zinc-400">Pick a new date and time</p>
                  </div>
                </button>
                <button onClick={handleCancel} disabled={saving}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 hover:border-amber-400 hover:bg-amber-50 transition-colors text-left disabled:opacity-40">
                  <X className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Cancel Appointment</p>
                    <p className="text-xs text-zinc-400">Mark as cancelled, keeps the record</p>
                  </div>
                </button>
                <button onClick={handleDelete} disabled={saving}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 hover:border-red-400 hover:bg-red-50 transition-colors text-left disabled:opacity-40">
                  <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Delete</p>
                    <p className="text-xs text-zinc-400">Permanently remove this appointment</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-3">
                <p className="text-xs text-zinc-500 mb-1">Select a new date and time, then contact the client to confirm.</p>
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
                    <div className="border border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-400 bg-zinc-50">
                      {newDate ? (blackouts.has(newDate) ? 'Blacked out date' : 'Closed this day') : 'Select a date first'}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setTab('main')}
                    className="flex-1 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    Back
                  </button>
                  <button onClick={handleReschedule} disabled={!newDate || !newTime || saving}
                    className="flex-1 bg-[#5BB8F5] hover:bg-[#3A9FE0] disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                    {saving ? 'Saving…' : 'Confirm'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
