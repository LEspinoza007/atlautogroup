'use client'

export default function Header() {
  return (
    <header className="bg-black text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ATL Auto Group</h1>
          <p className="text-xs text-gray-400">Quality Pre-Owned Vehicles</p>
        </div>
        <nav className="flex gap-6 text-sm font-medium text-gray-300">
          <a href="/" className="hover:text-white transition-colors">Inventory</a>
          <a href="/login" className="hover:text-white transition-colors">Employee Login</a>
        </nav>
      </div>
    </header>
  )
}
