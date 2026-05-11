import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Vehicle } from '@/types'
import DashboardVehicleTable from '@/components/DashboardVehicleTable'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })

  const available = vehicles?.filter((v: Vehicle) => v.status !== 'sold').length ?? 0
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

      <DashboardVehicleTable vehicles={vehicles ?? []} />
    </div>
  )
}
