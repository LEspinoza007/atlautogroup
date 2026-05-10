'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-black text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">ATL Auto Group</h1>
          <p className="text-xs text-gray-400">Admin Dashboard</p>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Overview</Link>
          <Link href="/dashboard/vehicles/new" className="bg-white text-black px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            + Add Vehicle
          </Link>
          <div className="text-right">
            <p className="text-xs text-gray-400">{userEmail}</p>
            <button onClick={handleSignOut} className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Sign Out
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
