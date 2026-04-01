import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { X, ArrowUpDown } from 'lucide-react'
import SearchWidget from '../components/SearchWidget'
import PropertyCard from '../components/PropertyCard'
import { supabase } from '../lib/supabase'
import { useBookingStore } from '../store/bookingStore'
import { BRANDS, CITIES } from '../lib/constants'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const { setDestination } = useBookingStore()
  const [properties, setProperties] = useState([])
  const [roomPrices, setRoomPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const [brandFilters, setBrandFilters] = useState([])
  const [cityFilters, setCityFilters] = useState([])
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(10000000)
  const [starFilter, setStarFilter] = useState(0)
  const [sortBy, setSortBy] = useState('recommended')

  useEffect(() => {
    const dest = searchParams.get('destination')
    const brand = searchParams.get('brand')
    if (dest) { setDestination(dest); setCityFilters([dest]) }
    if (brand) { setBrandFilters([brand]) }
  }, [searchParams])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: props } = await supabase.from('properties').select('*').eq('is_active', true)
      const { data: rooms } = await supabase.from('room_types').select('property_id, base_price_idr').eq('is_active', true)
      if (props) setProperties(props)
      if (rooms) {
        const prices = {}
        rooms.forEach((r) => {
          if (!prices[r.property_id] || r.base_price_idr < prices[r.property_id]) prices[r.property_id] = r.base_price_idr
        })
        setRoomPrices(prices)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = [...properties]
    if (brandFilters.length > 0) result = result.filter((p) => brandFilters.includes(p.brand))
    if (cityFilters.length > 0) result = result.filter((p) => cityFilters.includes(p.city))
    if (starFilter > 0) result = result.filter((p) => p.star_rating >= starFilter)
    result = result.filter((p) => { const price = roomPrices[p.id] || 0; return price >= minPrice && price <= maxPrice })
    if (sortBy === 'price-low') result.sort((a, b) => (roomPrices[a.id] || 0) - (roomPrices[b.id] || 0))
    else if (sortBy === 'price-high') result.sort((a, b) => (roomPrices[b.id] || 0) - (roomPrices[a.id] || 0))
    else if (sortBy === 'rating') result.sort((a, b) => b.star_rating - a.star_rating)
    return result
  }, [properties, brandFilters, cityFilters, starFilter, minPrice, maxPrice, sortBy, roomPrices])

  const toggleBrand = (brand) => setBrandFilters((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand])
  const toggleCity = (city) => setCityFilters((prev) => prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city])
  const clearFilters = () => { setBrandFilters([]); setCityFilters([]); setMinPrice(0); setMaxPrice(10000000); setStarFilter(0) }
  const hasActiveFilters = brandFilters.length > 0 || cityFilters.length > 0 || starFilter > 0 || minPrice > 0 || maxPrice < 10000000

  return (
    <div className="min-h-screen">
      <SearchWidget />

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-bold text-text-primary">
              {loading ? 'Searching...' : `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'} found`}
            </h1>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-[12px] text-cta hover:text-cta-hover font-medium flex items-center gap-1">
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden text-[13px] text-text-secondary border border-card-border px-3 py-1.5 rounded hover:bg-card-bg transition-colors duration-150">
              Filters
            </button>
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-grey-400" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="text-[13px] font-medium text-text-primary bg-card-bg border border-card-border rounded px-2 py-1.5 outline-none focus:border-cta cursor-pointer">
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Star Rating</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Filter Sidebar */}
          <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto' : 'hidden'} lg:block lg:relative lg:w-[200px] lg:shrink-0`}>
            <div className="lg:sticky lg:top-4">
              <div className="bg-card-bg border border-card-border rounded-[6px] p-4">
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h2 className="text-[13px] font-semibold text-text-primary">Filters</h2>
                  <button onClick={() => setShowFilters(false)}><X className="w-4 h-4" /></button>
                </div>

                {/* Brand */}
                <div className="mb-5">
                  <h3 className="text-[11px] font-semibold text-text-primary uppercase tracking-[0.08em] mb-2">Brand</h3>
                  <div className="space-y-1.5">
                    {BRANDS.map((brand) => (
                      <label key={brand.name} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={brandFilters.includes(brand.name)} onChange={() => toggleBrand(brand.name)}
                          className="w-3.5 h-3.5 rounded border-grey-300 text-cta focus:ring-cta accent-cta" />
                        <span className="text-[13px] text-text-body">{brand.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* City */}
                <div className="mb-5">
                  <h3 className="text-[11px] font-semibold text-text-primary uppercase tracking-[0.08em] mb-2">City</h3>
                  <div className="space-y-1.5">
                    {CITIES.map((city) => (
                      <label key={city} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={cityFilters.includes(city)} onChange={() => toggleCity(city)}
                          className="w-3.5 h-3.5 rounded border-grey-300 text-cta focus:ring-cta accent-cta" />
                        <span className="text-[13px] text-text-body">{city}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Star rating */}
                <div className="mb-5">
                  <h3 className="text-[11px] font-semibold text-text-primary uppercase tracking-[0.08em] mb-2">Min Stars</h3>
                  <div className="flex gap-1.5">
                    {[0, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setStarFilter(s)}
                        className={`px-2 py-1 rounded text-[12px] font-medium transition-colors duration-150 ${
                          starFilter === s ? 'bg-cta text-white' : 'bg-grey-100 text-text-secondary hover:bg-grey-200'
                        }`}>
                        {s === 0 ? 'All' : `${s}★`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <h3 className="text-[11px] font-semibold text-text-primary uppercase tracking-[0.08em] mb-2">Max Price</h3>
                  <input type="range" min={0} max={10000000} step={500000} value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-cta" />
                  <div className="flex justify-between text-[11px] text-text-secondary mt-1">
                    <span>IDR 0</span>
                    <span>IDR {(maxPrice / 1000000).toFixed(1)}M</span>
                  </div>
                </div>

                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-[12px] text-cta hover:text-cta-hover font-medium">
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="bg-card-bg border border-card-border rounded-[6px] overflow-hidden animate-pulse flex">
                    <div className="w-[280px] h-[180px] bg-grey-200 hidden md:block" />
                    <div className="flex-1 p-4 space-y-3">
                      <div className="h-4 bg-grey-200 rounded w-1/4" />
                      <div className="h-5 bg-grey-200 rounded w-1/2" />
                      <div className="h-3 bg-grey-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-text-secondary text-sm mb-3">No properties found</p>
                <button onClick={clearFilters} className="bg-cta text-white text-[13px] font-semibold uppercase tracking-[0.5px] px-4 py-2 rounded transition-colors duration-150 hover:bg-cta-hover">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((p) => (
                  <PropertyCard key={p.id} property={p} minPrice={roomPrices[p.id]} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
