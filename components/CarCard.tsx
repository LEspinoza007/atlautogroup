import { Vehicle } from '@/types'
import Link from 'next/link'

export default function CarCard({ vehicle }: { vehicle: Vehicle }) {
  const image = vehicle.images?.[0] ?? null

  return (
    <Link href={`/inventory/${vehicle.id}`} className="group block bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden">
      <div className="aspect-[4/3] bg-gray-200 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Photo</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            {vehicle.trim && <p className="text-sm text-gray-500">{vehicle.trim}</p>}
          </div>
          <span className={`ml-2 shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
            vehicle.status === 'sold'
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {vehicle.status === 'sold' ? 'Sold' : 'Available'}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-gray-500 text-sm">{vehicle.mileage?.toLocaleString()} mi</span>
          <span className="text-xl font-bold text-gray-900">
            ${vehicle.price?.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
