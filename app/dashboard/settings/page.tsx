'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, X, Plus } from 'lucide-react'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

const inputClass = "border border-zinc-300 rounded-xl px-3 py-2 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"

export default function SettingsPage() {
  const supabase = createClient()
  const [hours, setHours] = useState<any[]>([])
  const [blackouts, setBlackouts] = useState<any[]>([])
  const [newBlackout, setNewBlackout] = useState({ date: '', reason: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: h }, { data: b }] = await Promise.all([
        supabase.from('business_hours').select('*').order('day_of_week'),
        supabase.from('blackout_dates').select('*').order('date'),
      ])
      setHours(h ?? [])
      setBlackouts(b ?? [])
    }
    load()
  }, [])

  function updateHour(dayIdx: number, field: string, value: any) {
    setHours(prev => prev.map(h => h.day_of_week === dayIdx ? { ...h, [field]: value } : h))
  }

  async function saveHours() {
    setSaving(true)
    for (const h of hours) {
      await supabase.from('business_hours').update({
        open_time: h.open_time,
        close_time: h.close_time,
        is_closed: h.is_closed,
      }).eq('id', h.id)
    }
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function addBlackout() {
    if (!newBlackout.date) return
    const { data } = await supabase.from('blackout_dates').insert({
      date: newBlackout.date,
      reason: newBlackout.reason || null,
    }).select().single()
    if (data) setBlackouts(prev => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
    setNewBlackout({ date: '', reason: '' })
  }

  async function removeBlackout(id: string) {
    await supabase.from('blackout_dates').delete().eq('id', id)
    setBlackouts(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-2xl font-bold text-zinc-900">Business Hours & Availability</h2>

      {/* Business hours */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-rose-500" />
          <h3 className="font-semibold text-zinc-900">Hours of Operation</h3>
        </div>
        <div className="space-y-3">
          {hours.map(h => (
            <div key={h.day_of_week} className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium text-zinc-700 shrink-0">{DAYS[h.day_of_week]}</span>
              <label className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
                <input type="checkbox" checked={h.is_closed}
                  onChange={e => updateHour(h.day_of_week, 'is_closed', e.target.checked)}
                  className="accent-rose-600 w-3.5 h-3.5"
                /> Closed
              </label>
              {!h.is_closed && (
                <>
                  <input type="time" value={h.open_time ?? ''} onChange={e => updateHour(h.day_of_week, 'open_time', e.target.value)}
                    className={`${inputClass} flex-1`} />
                  <span className="text-zinc-400 text-sm shrink-0">to</span>
                  <input type="time" value={h.close_time ?? ''} onChange={e => updateHour(h.day_of_week, 'close_time', e.target.value)}
                    className={`${inputClass} flex-1`} />
                </>
              )}
              {h.is_closed && <div className="flex-1 border border-dashed border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-300">Closed all day</div>}
            </div>
          ))}
        </div>
        <button onClick={saveHours} disabled={saving}
          className="mt-5 bg-zinc-900 hover:bg-zinc-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors">
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Hours'}
        </button>
      </div>

      {/* Blackout dates */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
        <h3 className="font-semibold text-zinc-900 mb-5">Blackout Dates</h3>
        <p className="text-sm text-zinc-400 mb-4">These dates will be unavailable for customer appointments.</p>

        <div className="flex gap-3 mb-5">
          <input type="date" value={newBlackout.date}
            onChange={e => setNewBlackout(p => ({ ...p, date: e.target.value }))}
            className={`${inputClass} flex-1`} />
          <input type="text" placeholder="Reason (optional)" value={newBlackout.reason}
            onChange={e => setNewBlackout(p => ({ ...p, reason: e.target.value }))}
            className={`${inputClass} flex-1`} />
          <button onClick={addBlackout} disabled={!newBlackout.date}
            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white px-3 py-2 rounded-xl transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {blackouts.map(b => (
            <div key={b.id} className="flex items-center justify-between bg-zinc-50 rounded-xl px-4 py-3 text-sm">
              <span className="font-medium text-zinc-700">
                {new Date(b.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {b.reason && <span className="text-zinc-400">{b.reason}</span>}
              <button onClick={() => removeBlackout(b.id)} className="text-zinc-300 hover:text-red-500 transition-colors ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {blackouts.length === 0 && <p className="text-zinc-400 text-sm text-center py-4">No blackout dates set.</p>}
        </div>
      </div>
    </div>
  )
}
