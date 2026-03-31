import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown, ArrowUpDown } from 'lucide-react'
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

  // Filters
  const [brandFilters, setBrandFilters] = useState([])
  const [cityFilters, setCityFilters] = useState([])
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(10000000)
  const [starFilter, setStarFilter] = useState(0)
  const [sortBy, setSortBy] = useState('recommended')

  useEffect(() => {
    const dest = searchParams.get('destination')
    const brand = searchParams.get('brand')
    if (dest) {
      setDestination(dest)
      setCityFilters([dest])
    }
    if (brand) {
      setBrandFilters([brand])
    }
  }, [searchParams])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)

      const { data: rooms } = await supabase
        .from('room_types')
        .select('property_id, base_price_idr')
        .eq('is_active', true)

      if (props) setProperties(props)
      if (rooms) {
        const prices = {}
        rooms.forEach((r) => {
          if (!prices[r.property_id] || r.base_price_idr < prices[r.property_id]) {
            prices[r.property_id] = r.base_price_idr
          }
        })
        setRoomPrices(prices)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = [...properties]

    if (brandFilters.length > 0) {
      result = result.filter((p) => brandFilters.includes(p.brand))
    }
    if (cityFilters.length > 0) {
      result = result.filter((p) => cityFilters.includes(p.city))
    }
    if (starFilter > 0) {
      result = result.filter((p) => p.star_rating >= starFilter)
    }
    result = result.filter((p) => {
      const price = roomPrices[p.id] || 0
      return price >= minPrice && price <= maxPrice
    })

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => (roomPrices[a.id] || 0) - (roomPrices[b.id] || 0))
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (roomPrices[b.id] || 0) - (roomPrices[a.id] || 0))
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.star_rating - a.star_rating)
    }

    return result
  }, [properties, brandFilters, cityFilters, starFilter, minPrice, maxPrice, sortBy, roomPrices])

  const toggleBrand = (brand) => {
    setBrandFilters((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  const toggleCity = (city) => {
    setCityFilters((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    )
  }

  const clearFilters = () => {
    setBrandFilters([])
    setCityFilters([])
    setMinPrice(0)
    setMaxPrice(10000000)
    setStarFilter(0)
  }

  const hasActiveFilters = brandFilters.length > 0 || cityFilters.length > 0 || starFilter > 0 || minPrice > 0 || maxPrice < 10000000

  return (
    <div className="min-h-screen pt-20 bg-charcoal-50">
      {/* Search bar */}
      <div className="bg-white border-b border-charcoal-100 sticky top-16 lg:top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <SearchWidget compact />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-charcoal-800">
              {loading ? 'Searching...' : `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'} found`}
            </h1>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Clear filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-charcoal-200 rounded-xl text-sm font-medium text-charcoal-600 hover:bg-white transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-charcoal-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm font-medium text-charcoal-700 bg-white border border-charcoal-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gold-400 cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Star Rating</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : 'hidden'} lg:block lg:relative lg:w-64 lg:shrink-0`}>
            <div className="lg:sticky lg:top-40">
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
              </div>

              {/* Brand filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider mb-3">Brand</h3>
                <div className="space-y-2">
                  {BRANDS.map((brand) => (
                    <label key={brand.name} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={brandFilters.includes(brand.name)}
                        onChange={() => toggleBrand(brand.name)}
                        className="w-4 h-4 rounded border-charcoal-300 text-gold-600 focus:ring-gold-400"
                      />
                      <span className="text-sm text-charcoal-600 group-hover:text-charcoal-800">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* City filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider mb-3">City</h3>
                <div className="space-y-2">
                  {CITIES.map((city) => (
                    <label key={city} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={cityFilters.includes(city)}
                        onChange={() => toggleCity(city)}
                        className="w-4 h-4 rounded border-charcoal-300 text-gold-600 focus:ring-gold-400"
                      />
                      <span className="text-sm text-charcoal-600 group-hover:text-charcoal-800">{city}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Star rating filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider mb-3">Minimum Stars</h3>
                <div className="flex gap-2">
                  {[0, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStarFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        starFilter === s ? 'bg-gold-600 text-white' : 'bg-white border border-charcoal-200 text-charcoal-600 hover:border-gold-400'
                      }`}
                    >
                      {s === 0 ? 'All' : `${s}★+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider mb-3">Max Price/Night</h3>
                <input
                  type="range"
                  min={0}
                  max={10000000}
                  step={500000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-gold-600"
                />
                <div className="flex justify-between text-xs text-charcoal-500 mt-1">
                  <span>IDR 0</span>
                  <span>IDR {(maxPrice / 1000000).toFixed(1)}M</span>
                </div>
              </div>

              <button
                onClick={() => { clearFilters(); setShowFilters(false) }}
                className="w-full lg:hidden bg-gold-600 text-white py-3 rounded-xl font-semibold mt-4"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-charcoal-100 animate-pulse">
                    <div className="h-52 bg-charcoal-100" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-charcoal-100 rounded w-3/4" />
                      <div className="h-4 bg-charcoal-100 rounded w-1/2" />
                      <div className="h-4 bg-charcoal-100 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏨</div>
                <h2 className="text-xl font-semibold text-charcoal-700 mb-2">No properties found</h2>
                <p className="text-charcoal-500 mb-6">Try adjusting your filters or search for a different destination.</p>
                <button onClick={clearFilters} className="bg-gold-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gold-700 transition-colors">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
