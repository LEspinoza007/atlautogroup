'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, PlusCircle, LogOut, Calendar, Search, Settings } from 'lucide-react'

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLink = (href: string, label: string, Icon: React.ElementType) => (
    <Link href={href}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        pathname === href || pathname.startsWith(href + '/')
          ? 'bg-white/10 text-white'
          : 'text-zinc-400 hover:text-white hover:bg-white/5'
      }`}>
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )

  return (
    <header className="bg-zinc-950 text-white border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#5BB8F5] rounded-md flex items-center justify-center font-black text-white text-xs">ATL</div>
            <span className="font-semibold text-white text-sm hidden sm:block">Admin</span>
          </div>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {navLink('/dashboard', 'Overview', LayoutDashboard)}
            {navLink('/dashboard/vehicles/new', 'Add Vehicle', PlusCircle)}
            {navLink('/dashboard/appointments', 'Appointments', Calendar)}
            {navLink('/dashboard/procurement', 'Procurement', Search)}
            {navLink('/dashboard/settings', 'Settings', Settings)}
          </nav>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-zinc-500 hidden md:block">{userEmail}</span>
          <button onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-rose-400 transition-colors">
            <LogOut className="w-3.5 h-3.5" />Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}
