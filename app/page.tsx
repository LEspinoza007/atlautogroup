import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import FinancingBanner from '@/components/FinancingBanner'
import FeaturedVehicles from '@/components/FeaturedVehicles'
import InventoryClient from '@/components/InventoryClient'
import Footer from '@/components/Footer'
import ProcurementForm from '@/components/ProcurementForm'
import CarCard from '@/components/CarCard'
import { Shield, Clock, Star } from 'lucide-react'

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

      <div
        className="text-white py-12 px-4 lg:py-14 lg:px-6"
        style={{ background: 'radial-gradient(ellipse at 75% 40%, rgba(91,184,245,0.11) 0%, transparent 55%), radial-gradient(ellipse at 15% 80%, rgba(91,184,245,0.05) 0%, transparent 45%), #27272a' }}
      >
        <div className="max-w-7xl mx-auto lg:backdrop-blur-xl lg:bg-white/5 lg:border lg:border-white/10 lg:rounded-[20px] lg:p-10 lg:grid lg:grid-cols-[3fr_1fr] lg:gap-10 lg:items-center">
          <div>
            <p className="hidden lg:block text-[#5BB8F5] text-[11px] font-bold tracking-[3px] uppercase mb-3">San Antonio, TX</p>
            <h2 className="text-3xl lg:text-5xl font-bold mb-3 leading-tight">San Antonio&apos;s Trusted Pre-Owned Dealer</h2>
            <p className="text-gray-300 leading-relaxed mb-6 lg:text-lg max-w-xl">
              ATL Auto Group is your go-to dealership for quality pre-owned vehicles in San Antonio, TX.
              We offer a hand-selected inventory, transparent pricing, and flexible financing options
              to get you behind the wheel of the right car.
            </p>
            <div className="flex flex-wrap gap-4 text-sm lg:text-base text-gray-300">
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-[#5BB8F5]" /> Vehicle History Checked</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#5BB8F5]" /> Quick Approval Process</span>
            </div>
          </div>

          {heroFeatured && (
            <div className="hidden lg:flex flex-col items-center gap-3 -translate-y-7">
              <div style={{ borderRadius: '14px', overflow: 'hidden', boxShadow: '0 28px 56px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08), 0 -4px 20px rgba(91,184,245,0.10)' }}>
                <div style={{ height: '3px', background: 'linear-gradient(90deg, #5BB8F5, #3A9FE0)' }} />
                <CarCard vehicle={heroFeatured} />
              </div>
              <div className="flex items-center gap-2 text-[#5BB8F5] text-sm font-semibold">
                <Star className="w-4 h-4 fill-[#5BB8F5]" />
                Featured Vehicle
              </div>
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
