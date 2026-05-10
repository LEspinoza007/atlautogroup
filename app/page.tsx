import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import FinancingBanner from '@/components/FinancingBanner'
import InventoryClient from '@/components/InventoryClient'
import Footer from '@/components/Footer'
import ProcurementForm from '@/components/ProcurementForm'
import { MapPin, Phone, Shield, Clock } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="bg-zinc-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-3">San Antonio&apos;s Trusted Pre-Owned Dealer</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              ATL Auto Group is your go-to dealership for quality pre-owned vehicles in San Antonio, TX.
              We offer a hand-selected inventory, transparent pricing, and flexible financing options
              to get you behind the wheel of the right car.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-[#5BB8F5]" /> Vehicle History Checked</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#5BB8F5]" /> Quick Approval Process</span>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <a href="tel:+19566947000" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
              <Phone className="w-5 h-5 text-[#5BB8F5]" />
              <span>(956) 694-7000</span>
            </a>
            <div className="flex items-start gap-3 text-gray-300">
              <MapPin className="w-5 h-5 text-[#5BB8F5] shrink-0 mt-0.5" />
              <span>2379 Northeast Interstate 410 Loop<br />San Antonio, TX 78217</span>
            </div>
          </div>
        </div>
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
