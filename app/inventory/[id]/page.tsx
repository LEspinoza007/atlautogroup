import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import { notFound } from 'next/navigation'

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: vehicle } = await supabase.from('vehicles').select('*').eq('id', id).single()

  if (!vehicle) notFound()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">← Back to Inventory</a>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-3">
            {vehicle.images?.length > 0 ? (
              <>
                <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
                  <img src={vehicle.images[0]} alt="Main" className="w-full h-full object-cover" />
                </div>
                {vehicle.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {vehicle.images.slice(1).map((url: string, i: number) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img src={url} alt={`Photo ${i + 2}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-[4/3] bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">No Photos</div>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <span className={`shrink-0 ml-3 text-sm font-medium px-3 py-1 rounded-full ${
                vehicle.status === 'sold' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {vehicle.status === 'sold' ? 'Sold' : 'Available'}
              </span>
            </div>
            {vehicle.trim && <p className="text-gray-500 mb-4">{vehicle.trim}</p>}

            <p className="text-4xl font-bold text-gray-900 mb-6">${vehicle.price?.toLocaleString()}</p>

            <dl className="grid grid-cols-2 gap-3 text-sm mb-6">
              {[
                ['Mileage', `${vehicle.mileage?.toLocaleString()} mi`],
                ['Exterior Color', vehicle.color],
                ['Transmission', vehicle.transmission],
                ['Drivetrain', vehicle.drivetrain],
                ['Engine', vehicle.engine],
                ['Title', vehicle.title_status || 'Clean'],
                ['VIN', vehicle.vin],
                ['Year', vehicle.year],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} className="bg-gray-50 rounded-lg px-4 py-3">
                  <dt className="text-gray-400 text-xs mb-1">{label}</dt>
                  <dd className="font-medium text-gray-900 font-mono text-xs">{value}</dd>
                </div>
              ))}
            </dl>

            {vehicle.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">About This Vehicle</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {vehicle.status === 'available' && (
              <div className="mt-8 p-4 bg-black text-white rounded-xl">
                <p className="font-semibold mb-1">Interested in this vehicle?</p>
                <p className="text-gray-400 text-sm">Contact ATL Auto Group to schedule a showing.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="bg-black text-gray-400 text-center py-4 text-sm mt-10">
        © {new Date().getFullYear()} ATL Auto Group · ATL Logistics LLC
      </footer>
    </div>
  )
}
