import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AppointmentScheduler from '@/components/AppointmentScheduler'
import VehicleGallery from '@/components/VehicleGallery'
import { notFound } from 'next/navigation'
import { Tag } from 'lucide-react'

const WHATSAPP_BASE = 'https://wa.me/19566947000'
const MAPS_URL = 'https://maps.google.com/?q=2379+Northeast+Interstate+410+Loop,+San+Antonio,+TX+78217'

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: vehicle }, { data: hours }, { data: blackouts }] = await Promise.all([
    supabase.from('vehicles').select('*').eq('id', id).single(),
    supabase.from('business_hours').select('*').order('day_of_week'),
    supabase.from('blackout_dates').select('*'),
  ])

  if (!vehicle) notFound()

  const onSale = (vehicle.status === 'sale' || vehicle.status === 'clearance') && vehicle.sale_price
  const displayPrice = onSale ? vehicle.sale_price : vehicle.price
  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`
  const waMessage = encodeURIComponent(`Hi, I'm interested in the ${vehicleName} listed on your website.`)

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <a href="/" className="text-sm text-zinc-400 hover:text-zinc-700 mb-6 inline-flex items-center gap-1 transition-colors">
          ← Back to Inventory
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Gallery */}
          <div className="lg:col-span-3">
            <VehicleGallery
              images={vehicle.images ?? []}
              thumbnailIndex={vehicle.thumbnail_index ?? 0}
              alt={vehicleName}
            />
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h1 className="text-2xl font-bold text-zinc-900 leading-tight">{vehicleName}</h1>
                <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  vehicle.status === 'sold' ? 'bg-red-50 text-red-600'
                  : onSale ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {vehicle.status === 'sold' ? 'Sold' : onSale ? vehicle.status === 'clearance' ? 'Clearance' : 'On Sale' : 'Available'}
                </span>
              </div>
              {vehicle.trim && <p className="text-zinc-400 text-sm">{vehicle.trim}</p>}
            </div>

            <div>
              {onSale && (
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4 text-rose-600" />
                  <p className="text-zinc-400 line-through text-lg">${vehicle.price?.toLocaleString()}</p>
                  <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full">
                    Save ${(vehicle.price - vehicle.sale_price!).toLocaleString()}
                  </span>
                </div>
              )}
              <p className={`text-4xl font-extrabold tracking-tight ${onSale ? 'text-emerald-600' : 'text-zinc-900'}`}>
                ${displayPrice?.toLocaleString()}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-2 text-sm">
              {[
                ['Mileage', `${vehicle.mileage?.toLocaleString()} mi`],
                ['Year', vehicle.year],
                ['Exterior', vehicle.color],
                ['Interior', vehicle.interior_color],
                ['Engine', vehicle.engine],
                ['Transmission', vehicle.transmission],
                ['Drivetrain', vehicle.drivetrain],
                ['Title', vehicle.title_status || 'Clean'],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} className="bg-white rounded-xl border border-zinc-100 px-3 py-2.5">
                  <dt className="text-zinc-400 text-xs mb-0.5">{label}</dt>
                  <dd className="font-semibold text-zinc-900 text-sm">{value}</dd>
                </div>
              ))}
            </dl>

            {vehicle.vin && (
              <p className="text-xs text-zinc-400 font-mono">VIN: {vehicle.vin}</p>
            )}

            {vehicle.features && (
              <div className="bg-white border border-zinc-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Features & Accessories</p>
                <p className="text-sm text-zinc-700 leading-relaxed">{vehicle.features}</p>
              </div>
            )}

            {vehicle.description && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">About This Vehicle</p>
                <p className="text-sm text-zinc-600 leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {vehicle.status !== 'sold' && (
              <a
                href={`${WHATSAPP_BASE}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Message Us on WhatsApp
              </a>
            )}

            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer"
              className="block text-center text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
              2379 NE Interstate 410 Loop, San Antonio TX 78217 →
            </a>
          </div>
        </div>

        {vehicle.status !== 'sold' && (
          <div className="mt-10 max-w-2xl">
            <AppointmentScheduler
              vehicleId={vehicle.id}
              vehicleName={vehicleName}
              businessHours={hours ?? []}
              blackoutDates={blackouts ?? []}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
