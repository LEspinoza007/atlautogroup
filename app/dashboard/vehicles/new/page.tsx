import VehicleForm from '@/components/VehicleForm'
import Link from 'next/link'

export default function NewVehiclePage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Back</Link>
        <h2 className="text-2xl font-bold text-gray-900">Add New Vehicle</h2>
      </div>
      <VehicleForm />
    </div>
  )
}
