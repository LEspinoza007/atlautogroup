'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RefreshCw, X } from 'lucide-react'
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
  const [hours, setHours] = useState<BusinessHours[]>([])
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && hours.length === 0) {
      supabase.from('business_hours').select('*').order('day_of_week').then(({ data }) => {
        setHours(data ?? [])
      })
    }
  }, [open])

  function getSlots(d: string) {
    if (!d) return []
    const dow = new Date(d + 'T12:00:00').getDay()
    const h = hours.find(h => h.day_of_week === dow)
    if (!h || h.is_closed || !h.open_time || !h.close_time) return []
    return generateSlots(h.open_time, h.close_time)
  }

  async function handleCancel() {
    if (!window.confirm('Cancel this appointment? This cannot be undone.')) return
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', aptId)
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
    setOpen(false)
    setNewDate('')
    setNewTime('')
    router.refresh()
  }

  const slots = getSlots(newDate)
  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <div className="flex items-center gap-2">
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
          <RefreshCw className="w-3 h-3" />Reschedule
        </button>
        <span className="text-zinc-300">|</span>
        <button onClick={handleCancel}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
          <X className="w-3 h-3" />Cancel
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-zinc-900 text-base">Reschedule Appointment</h3>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-zinc-500 mb-4">Select a new date and time, then contact the client to confirm.</p>
            <div className="space-y-3">
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
                    {newDate ? 'Closed this day' : 'Select a date first'}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setOpen(false)}
                className="flex-1 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleReschedule} disabled={!newDate || !newTime || saving}
                className="flex-1 bg-[#5BB8F5] hover:bg-[#3A9FE0] disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                {saving ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
