'use client'

import { useState, useMemo } from 'react'
import { Vehicle } from '@/types'
import Link from 'next/link'
import { Search } from 'lucide-react'

const statusStyle: Record<string, string> = {
  available:  'bg-green-100 text-green-700',
  sale:       'bg-sky-100 text-sky-700',
  clearance:  'bg-amber-100 text-amber-700',
  sold:       'bg-red-100 text-red-700',
}

const statusLabel: Record<string, string> = {
  available: 'Available',
  sale:      'On Sale',
  clearance: 'Clearance',
  sold:      'Sold',
}

export default function DashboardVehicleTable({ vehicles }: { vehicles: Vehicle[] }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return vehicles
    const q = search.toLowerCase()
    return vehicles.filter(v =>
      `${v.year} ${v.make} ${v.model} ${v.trim ?? ''} ${v.vin ?? ''} ${v.status}`
        .toLowerCase()
        .includes(q)
    )
  }, [vehicles, search])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, VIN, status…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#5BB8F5]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Vehicle</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">VIN</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Price</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((vehicle: Vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                  {vehicle.trim && <span className="text-gray-400 font-normal ml-1">{vehicle.trim}</span>}
                </td>
                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{vehicle.vin}</td>
                <td className="px-6 py-4 text-gray-900">${vehicle.price?.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyle[vehicle.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusLabel[vehicle.status] ?? vehicle.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/dashboard/vehicles/${vehicle.id}/edit`}
                    className="text-blue-600 hover:underline text-xs font-medium"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                  {search ? 'No vehicles match your search.' : (
                    <>No vehicles yet. <Link href="/dashboard/vehicles/new" className="text-blue-600 hover:underline">Add the first one.</Link></>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
