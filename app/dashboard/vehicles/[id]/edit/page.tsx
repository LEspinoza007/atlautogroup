import { createClient } from '@/lib/supabase/server'
import VehicleForm from '@/components/VehicleForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: vehicle } = await supabase.from('vehicles').select('*').eq('id', id).single()

  if (!vehicle) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Back</Link>
        <h2 className="text-2xl font-bold text-gray-900">
          Edit — {vehicle.year} {vehicle.make} {vehicle.model}
        </h2>
      </div>
      <VehicleForm vehicle={vehicle} />
    </div>
  )
}
