import { createClient } from '@/lib/supabase/server'
import { Phone, Mail } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  found: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-zinc-100 text-zinc-500',
}

export default async function ProcurementPage() {
  const supabase = await createClient()
  const { data: requests } = await supabase
    .from('procurement_requests')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-900">Procurement Requests</h2>
        <p className="text-sm text-zinc-500 mt-1">Customers looking for specific vehicles</p>
      </div>

      <div className="space-y-4">
        {(requests ?? []).map(req => (
          <div key={req.id} className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">
                  {[req.year_min && req.year_max ? `${req.year_min}–${req.year_max}` : req.year_min || req.year_max, req.make, req.model, req.trim].filter(Boolean).join(' ') || 'Open Request'}
                </h3>
                <p className="text-sm text-zinc-400 mt-0.5">
                  Submitted {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[req.status] ?? ''}`}>
                {req.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
              {req.color && <div><p className="text-xs text-zinc-400">Color</p><p className="font-medium text-zinc-700">{req.color}</p></div>}
              {req.max_mileage && <div><p className="text-xs text-zinc-400">Max Mileage</p><p className="font-medium text-zinc-700">{parseInt(req.max_mileage).toLocaleString()} mi</p></div>}
              {req.budget && <div><p className="text-xs text-zinc-400">Budget</p><p className="font-medium text-zinc-700">${parseFloat(req.budget).toLocaleString()}</p></div>}
            </div>

            {req.notes && (
              <p className="text-sm text-zinc-500 bg-zinc-50 rounded-xl px-4 py-3 mb-4">{req.notes}</p>
            )}

            <div className="pt-3 border-t border-zinc-100 text-sm space-y-1.5">
              <span className="block font-semibold text-zinc-900">{req.client_first_name} {req.client_last_name}</span>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                <a href={`https://wa.me/${req.client_phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-600 hover:underline">
                  <Phone className="w-3.5 h-3.5 shrink-0" />{req.client_phone}
                </a>
                {req.client_email && (
                  <a href={`mailto:${req.client_email}`} className="flex items-center gap-1 text-blue-600 hover:underline min-w-0 break-all">
                    <Mail className="w-3.5 h-3.5 shrink-0" />{req.client_email}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        {(requests?.length ?? 0) === 0 && (
          <div className="text-center py-20 text-zinc-400 bg-white rounded-2xl border border-zinc-100">
            No procurement requests yet.
          </div>
        )}
      </div>
    </div>
  )
}
