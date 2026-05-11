import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Vehicle } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })

  const available = vehicles?.filter((v: Vehicle) => v.status === 'available').length ?? 0
  const sold = vehicles?.filter((v: Vehicle) => v.status === 'sold').length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Vehicle Inventory</h2>
        <Link
          href="/dashboard/vehicles/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          + Add Vehicle
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Vehicles</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{vehicles?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Available</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{available}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Sold</p>
          <p className="text-3xl font-bold text-red-500 mt-1">{sold}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
            {(vehicles ?? []).map((vehicle: Vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                  {vehicle.trim && <span className="text-gray-400 font-normal ml-1">{vehicle.trim}</span>}
                </td>
                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{vehicle.vin}</td>
                <td className="px-6 py-4 text-gray-900">${vehicle.price?.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    vehicle.status === 'sold'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {vehicle.status === 'sold' ? 'Sold' : 'Available'}
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
            {(vehicles?.length ?? 0) === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                  No vehicles yet. <Link href="/dashboard/vehicles/new" className="text-blue-600 hover:underline">Add the first one.</Link>
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
