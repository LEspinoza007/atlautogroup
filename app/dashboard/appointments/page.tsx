import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Phone, Mail, ExternalLink } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-zinc-100 text-zinc-500',
  cancelled: 'bg-red-50 text-red-600',
  rescheduled: 'bg-blue-50 text-blue-700',
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default async function AppointmentsPage() {
  const supabase = await createClient()

  const [{ data: appointments }, { data: vehicles }] = await Promise.all([
    supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true }),
    supabase
      .from('vehicles')
      .select('id, year, make, model'),
  ])

  const vehicleMap = Object.fromEntries(
    (vehicles ?? []).map(v => [v.id, v])
  )

  const pending = appointments?.filter(a => a.status === 'pending').length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Appointments</h2>
          {pending > 0 && <p className="text-sm text-amber-600 mt-0.5">{pending} pending confirmation</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                {['Date & Time', 'Client', 'Contact', 'Vehicle', 'DNC', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {(appointments ?? []).map(apt => {
                const vehicle = apt.vehicle_id ? vehicleMap[apt.vehicle_id] : null
                return (
                  <tr key={apt.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#5BB8F5] shrink-0" />
                        <div>
                          <p className="font-semibold text-zinc-900">{formatDate(apt.appointment_date)}</p>
                          <p className="text-zinc-400 text-xs">{formatTime(apt.appointment_time)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-zinc-900">
                      {apt.client_first_name} {apt.client_last_name}
                    </td>
                    <td className="px-5 py-4">
                      <a href={`https://wa.me/${apt.client_phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-zinc-600 hover:text-green-600 transition-colors">
                        <Phone className="w-3.5 h-3.5" />{apt.client_phone}
                      </a>
                      {apt.client_email && (
                        <a href={`mailto:${apt.client_email}`}
                          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-700 text-xs mt-0.5 transition-colors">
                          <Mail className="w-3 h-3" />{apt.client_email}
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {vehicle ? (
                        <Link href={`/inventory/${vehicle.id}`} target="_blank"
                          className="flex items-center gap-1 text-blue-600 hover:underline text-xs font-medium">
                          <ExternalLink className="w-3 h-3" />
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </Link>
                      ) : <span className="text-zinc-400 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      {apt.dnc_promotional ? (
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">DNC Promo</span>
                      ) : (
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Consented</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[apt.status] ?? ''}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/dashboard/appointments/${apt.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        Manage
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {(appointments?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-zinc-400">
                    No appointments yet. They&apos;ll appear here once customers book a visit.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
