'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, PlusCircle, LogOut, Calendar, Search, Settings, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Overview', Icon: LayoutDashboard },
  { href: '/dashboard/vehicles/new', label: 'Add Vehicle', Icon: PlusCircle },
  { href: '/dashboard/appointments', label: 'Appointments', Icon: Calendar },
  { href: '/dashboard/procurement', label: 'Procurement', Icon: Search },
  { href: '/dashboard/settings', label: 'Settings', Icon: Settings },
]

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const linkClass = (href: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === href || pathname.startsWith(href + '/')
        ? 'bg-white/10 text-white'
        : 'text-zinc-400 hover:text-white hover:bg-white/5'
    }`

  return (
    <header className="bg-zinc-950 text-white border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <img src="/logo-white.png" alt="ATL Auto Group" className="h-16 w-auto shrink-0" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto flex-1 ml-6">
          {NAV_LINKS.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <span className="text-xs text-zinc-500">{userEmail}</span>
          <button onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#5BB8F5] transition-colors">
            <LogOut className="w-3.5 h-3.5" />Sign Out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-white/10 px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className={linkClass(href)} onClick={() => setMenuOpen(false)}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-zinc-500 truncate">{userEmail}</span>
            <button onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#5BB8F5] transition-colors">
              <LogOut className="w-3.5 h-3.5" />Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
