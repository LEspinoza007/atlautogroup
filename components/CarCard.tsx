import { Vehicle } from '@/types'
import Link from 'next/link'
import CarImageCarousel from './CarImageCarousel'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Gauge, GitFork, Fuel } from 'lucide-react'

function TransmissionBadge({ transmission }: { transmission: string }) {
  const t = (transmission || '').toLowerCase()
  const isManual = t.includes('manual') || t.includes('standard')
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
      isManual ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
    }`}>
      {isManual ? <GitFork className="w-3 h-3" /> : <Gauge className="w-3 h-3" />}
      {isManual ? 'Manual' : transmission || 'Auto'}
    </span>
  )
}

export default function CarCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link href={`/inventory/${vehicle.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-gray-100 p-0">
        <CarImageCarousel
          images={vehicle.images ?? []}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          thumbnailIndex={vehicle.thumbnail_index ?? 0}
        />
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-base leading-tight truncate">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              {vehicle.trim && <p className="text-xs text-gray-500 mt-0.5 truncate">{vehicle.trim}</p>}
            </div>
            <Badge
              variant={vehicle.status === 'sold' ? 'destructive' : 'default'}
              className={`shrink-0 text-xs ${vehicle.status !== 'sold' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}`}
            >
              {vehicle.status === 'sold' ? 'Sold' : 'Available'}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <Fuel className="w-3 h-3 text-gray-400" />
              {vehicle.mileage?.toLocaleString()} mi
            </span>
            {vehicle.transmission && <TransmissionBadge transmission={vehicle.transmission} />}
            {vehicle.drivetrain && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {vehicle.drivetrain}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            {vehicle.color && <span className="text-xs text-gray-400">{vehicle.color}</span>}
            <span className="text-xl font-extrabold text-gray-900 ml-auto tracking-tight">
              ${vehicle.price?.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
