'use client'

import { useState, useMemo } from 'react'
import { Vehicle } from '@/types'
import CarCard from './CarCard'
import { Search, SlidersHorizontal } from 'lucide-react'

const inputClass = "border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#5BB8F5]"

export default function InventoryClient({ vehicles }: { vehicles: Vehicle[] }) {
  const [search, setSearch] = useState('')
  const [filterMake, setFilterMake] = useState('')
  const [filterStatus, setFilterStatus] = useState('available')
  const [sortBy, setSortBy] = useState('newest')
  const [maxPrice, setMaxPrice] = useState('')

  const makes = useMemo(() => {
    const unique = [...new Set(vehicles.map(v => v.make).filter(Boolean))].sort()
    return unique
  }, [vehicles])

  const filtered = useMemo(() => {
    let result = [...vehicles]

    if (filterStatus !== 'all') result = result.filter(v => v.status === filterStatus)
    if (filterMake) result = result.filter(v => v.make === filterMake)
    if (maxPrice) result = result.filter(v => v.price <= parseFloat(maxPrice))
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(v =>
        `${v.year} ${v.make} ${v.model} ${v.trim}`.toLowerCase().includes(q)
      )
    }

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break
      case 'price-desc': result.sort((a, b) => b.price - a.price); break
      case 'year-desc': result.sort((a, b) => b.year - a.year); break
      case 'year-asc': result.sort((a, b) => a.year - b.year); break
      case 'mileage-asc': result.sort((a, b) => a.mileage - b.mileage); break
      default: break
    }

    return result
  }, [vehicles, filterStatus, filterMake, maxPrice, search, sortBy])

  const available = vehicles.filter(v => v.status === 'available').length
  const sold = vehicles.filter(v => v.status === 'sold').length

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Inventory</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {available} available · {sold} sold
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter & Sort</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Year, make, model…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`${inputClass} pl-8 w-full`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Make</label>
            <select value={filterMake} onChange={e => setFilterMake(e.target.value)} className={`${inputClass} w-full`}>
              <option value="">All Makes</option>
              {makes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={`${inputClass} w-full`}>
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Max Price</label>
            <input
              type="number"
              placeholder="Any"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className={`${inputClass} w-full`}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={`${inputClass} w-full`}>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="year-desc">Year: Newest</option>
              <option value="year-asc">Year: Oldest</option>
              <option value="mileage-asc">Lowest Mileage</option>
            </select>
          </div>
        </div>

        {(search || filterMake || filterStatus !== 'available' || maxPrice) && (
          <button
            onClick={() => { setSearch(''); setFilterMake(''); setFilterStatus('available'); setMaxPrice('') }}
            className="mt-3 text-xs text-[#1A7FC4] hover:text-[#0F5FA0] font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No vehicles match your filters.</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(vehicle => (
            <CarCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  )
}
