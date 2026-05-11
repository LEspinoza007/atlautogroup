import { createClient } from '@/lib/supabase/server'
import CarCard from '@/components/CarCard'
import { Vehicle } from '@/types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default async function FeaturedVehicles() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('featured', true)
    .neq('status', 'sold')

  const vehicles: Vehicle[] = data ?? []
  if (vehicles.length === 0) return null

  const shuffled = shuffle(vehicles)

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Vehicles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shuffled.map(vehicle => (
          <CarCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </section>
  )
}
