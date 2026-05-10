import { Vehicle } from '@/types'
import Link from 'next/link'
import CarImageCarousel from './CarImageCarousel'
import { Card, CardContent } from '@/components/ui/card'
import { Gauge, GitFork, Fuel, Tag } from 'lucide-react'

function TransmissionBadge({ transmission }: { transmission: string }) {
  const isManual = (transmission || '').toLowerCase().includes('manual')
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
      isManual ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
    }`}>
      {isManual ? <GitFork className="w-3 h-3" /> : <Gauge className="w-3 h-3" />}
      {isManual ? 'Manual' : transmission || 'Auto'}
    </span>
  )
}

const isSaleStatus = (s: string) => s === 'sale' || s === 'clearance'

export default function CarCard({ vehicle }: { vehicle: Vehicle }) {
  const onSale = isSaleStatus(vehicle.status) && vehicle.sale_price
  const displayPrice = onSale ? vehicle.sale_price! : vehicle.price

  return (
    <Link href={`/inventory/${vehicle.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border-zinc-100 p-0 relative">

        {/* Sale badge */}
        {onSale && (
          <div className="absolute top-3 left-3 z-10 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {vehicle.status === 'clearance' ? 'CLEARANCE' : 'SALE'}
          </div>
        )}

        <CarImageCarousel
          images={vehicle.images ?? []}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          thumbnailIndex={vehicle.thumbnail_index ?? 0}
        />

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="font-bold text-zinc-900 text-base leading-tight truncate">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              {vehicle.trim && <p className="text-xs text-zinc-400 mt-0.5 truncate">{vehicle.trim}</p>}
            </div>
            <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
              vehicle.status === 'sold'
                ? 'bg-red-50 text-red-600'
                : onSale
                ? 'bg-rose-50 text-rose-600'
                : 'bg-emerald-50 text-emerald-700'
            }`}>
              {vehicle.status === 'sold' ? 'Sold' : onSale ? vehicle.status === 'clearance' ? 'Clearance' : 'Sale' : 'Available'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
              <Fuel className="w-3 h-3 text-zinc-400" />
              {vehicle.mileage?.toLocaleString()} mi
            </span>
            {vehicle.transmission && <TransmissionBadge transmission={vehicle.transmission} />}
            {vehicle.drivetrain && (
              <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{vehicle.drivetrain}</span>
            )}
          </div>

          <div className="flex items-end justify-between pt-2 border-t border-zinc-100">
            {vehicle.color && <span className="text-xs text-zinc-400">{vehicle.color}</span>}
            <div className="ml-auto text-right">
              {onSale && (
                <p className="text-xs text-zinc-400 line-through leading-none">
                  ${vehicle.price?.toLocaleString()}
                </p>
              )}
              <p className={`text-xl font-extrabold tracking-tight leading-tight ${onSale ? 'text-emerald-600' : 'text-zinc-900'}`}>
                ${displayPrice?.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
