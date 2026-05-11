import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import FinancingBanner from '@/components/FinancingBanner'
import FeaturedVehicles from '@/components/FeaturedVehicles'
import InventoryClient from '@/components/InventoryClient'
import Footer from '@/components/Footer'
import ProcurementForm from '@/components/ProcurementForm'
import CarCard from '@/components/CarCard'
import { Shield, Clock } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const [{ data: vehicles }, { data: featuredData }] = await Promise.all([
    supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
    supabase.from('vehicles').select('*').eq('featured', true).neq('status', 'sold').limit(1),
  ])

  const heroFeatured = featuredData?.[0] ?? null

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="bg-zinc-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:gap-10 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold mb-3">San Antonio&apos;s Trusted Pre-Owned Dealer</h2>
            <p className="text-gray-300 leading-relaxed mb-6 max-w-2xl">
              ATL Auto Group is your go-to dealership for quality pre-owned vehicles in San Antonio, TX.
              We offer a hand-selected inventory, transparent pricing, and flexible financing options
              to get you behind the wheel of the right car.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-[#5BB8F5]" /> Vehicle History Checked</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#5BB8F5]" /> Quick Approval Process</span>
            </div>
          </div>

          {heroFeatured && (
            <div className="hidden lg:block">
              <CarCard vehicle={heroFeatured} />
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden">
        <FeaturedVehicles />
      </div>

      <FinancingBanner />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <InventoryClient vehicles={vehicles ?? []} />
        <ProcurementForm />
      </main>

      <Footer />
    </div>
  )
}
