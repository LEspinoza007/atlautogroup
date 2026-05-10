import { Vehicle } from '@/types'
import Link from 'next/link'
import CarImageCarousel from './CarImageCarousel'
import { Gauge, GitFork, Fuel } from 'lucide-react'

function TransmissionIcon({ transmission }: { transmission: string }) {
  const t = (transmission || '').toLowerCase()
  const isManual = t.includes('manual') || t.includes('standard')
  const label = isManual ? 'Manual' : transmission || 'Auto'

  return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      {isManual ? (
        <GitFork className="w-3.5 h-3.5 text-blue-500" />
      ) : (
        <Gauge className="w-3.5 h-3.5 text-green-500" />
      )}
      {label}
    </span>
  )
}

export default function CarCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link href={`/inventory/${vehicle.id}`} className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      <CarImageCarousel
        images={vehicle.images ?? []}
        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        thumbnailIndex={vehicle.thumbnail_index ?? 0}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            {vehicle.trim && <p className="text-xs text-gray-500 mt-0.5">{vehicle.trim}</p>}
          </div>
          <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
            vehicle.status === 'sold'
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {vehicle.status === 'sold' ? 'Sold' : 'Available'}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Fuel className="w-3.5 h-3.5 text-gray-400" />
            {vehicle.mileage?.toLocaleString()} mi
          </span>
          {vehicle.transmission && (
            <TransmissionIcon transmission={vehicle.transmission} />
          )}
          {vehicle.drivetrain && (
            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              {vehicle.drivetrain}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {vehicle.color && (
            <span className="text-xs text-gray-400">{vehicle.color}</span>
          )}
          <span className="text-xl font-bold text-gray-900 ml-auto">
            ${vehicle.price?.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
