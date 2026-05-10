import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import CarCard from '@/components/CarCard'
import { Vehicle } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })

  const available = vehicles?.filter((v: Vehicle) => v.status === 'available') ?? []
  const sold = vehicles?.filter((v: Vehicle) => v.status === 'sold') ?? []

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Inventory</h2>
          {available.length === 0 ? (
            <p className="text-gray-500">No vehicles currently available. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {available.map((vehicle: Vehicle) => (
                <CarCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </section>

        {sold.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Sold</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
              {sold.map((vehicle: Vehicle) => (
                <CarCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </section>
        )}
      </main>
      <footer className="bg-black text-gray-400 text-center py-4 text-sm mt-10">
        © {new Date().getFullYear()} ATL Auto Group · ATL Logistics LLC
      </footer>
    </div>
  )
}
