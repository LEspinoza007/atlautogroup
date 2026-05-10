'use client'

import { Phone } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-gray-950 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center font-black text-white text-sm">
              ATL
            </div>
            <div>
              <div className="font-bold text-white text-lg leading-tight tracking-tight">ATL Auto Group</div>
              <div className="text-gray-400 text-xs leading-none">San Antonio, TX</div>
            </div>
          </a>

          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <a href="/" className="text-gray-300 hover:text-white transition-colors">Inventory</a>
            <a
              href="https://www.startyourcreditapproval.com/credit-application/DC5W7?utm_medium=qr_code&utm_source=dealer&utm_campaign=credit_app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Financing
            </a>
            <a href="tel:+19566947000" className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5" />
              (956) 694-7000
            </a>
            <a
              href="/login"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Employee Login
            </a>
          </nav>

          <a href="/login" className="sm:hidden bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
            Login
          </a>
        </div>
      </div>
    </header>
  )
}
