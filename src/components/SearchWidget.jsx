import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Calendar, Users, ChevronDown } from 'lucide-react'
import { useBookingStore } from '../store/bookingStore'
import { CITIES } from '../lib/constants'
import { format, addDays } from 'date-fns'

export default function SearchWidget({ compact = false }) {
  const navigate = useNavigate()
  const {
    destination, checkIn, checkOut, adults, children,
    setDestination, setCheckIn, setCheckOut, setAdults, setChildren,
  } = useBookingStore()

  const today = format(new Date(), 'yyyy-MM-dd')
  const minCheckOut = checkIn ? format(addDays(new Date(checkIn), 1), 'yyyy-MM-dd') : today

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (destination) params.set('destination', destination)
    params.set('checkIn', checkIn)
    params.set('checkOut', checkOut)
    params.set('adults', adults)
    params.set('children', children)
    navigate(`/search?${params.toString()}`)
  }

  if (compact) {
    return (
      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg border border-charcoal-100 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gold-50 rounded-lg flex-1 min-w-[150px]">
            <MapPin className="w-4 h-4 text-gold-600 shrink-0" />
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bg-transparent text-sm font-medium text-charcoal-700 outline-none w-full cursor-pointer"
            >
              <option value="">All Destinations</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gold-50 rounded-lg">
            <Calendar className="w-4 h-4 text-gold-600 shrink-0" />
            <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)}
              className="bg-transparent text-sm font-medium text-charcoal-700 outline-none w-[120px]" />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gold-50 rounded-lg">
            <Calendar className="w-4 h-4 text-gold-600 shrink-0" />
            <input type="date" value={checkOut} min={minCheckOut} onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent text-sm font-medium text-charcoal-700 outline-none w-[120px]" />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gold-50 rounded-lg">
            <Users className="w-4 h-4 text-gold-600 shrink-0" />
            <span className="text-sm font-medium text-charcoal-700">{adults}A {children > 0 ? `${children}C` : ''}</span>
          </div>
          <button type="submit" className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-8 max-w-4xl w-full mx-auto">
      <h2 className="font-serif text-2xl md:text-3xl text-charcoal-800 mb-6 text-center">Find Your Perfect Stay</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Destination */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Destination</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-charcoal-50 border border-charcoal-200 rounded-xl text-charcoal-700 font-medium focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">All Destinations</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 pointer-events-none" />
          </div>
        </div>

        {/* Check-in */}
        <div>
          <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Check-in</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-charcoal-50 border border-charcoal-200 rounded-xl text-charcoal-700 font-medium focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Check-out */}
        <div>
          <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Check-out</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
            <input
              type="date"
              value={checkOut}
              min={minCheckOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-charcoal-50 border border-charcoal-200 rounded-xl text-charcoal-700 font-medium focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Guests */}
        <div>
          <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">Guests</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-charcoal-50 border border-charcoal-200 rounded-xl text-charcoal-700 font-medium focus:outline-none focus:ring-2 focus:ring-gold-400 appearance-none cursor-pointer"
              >
                {[1,2,3,4,5,6].map((n) => (
                  <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <select
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="w-20 py-3 px-2 bg-charcoal-50 border border-charcoal-200 rounded-xl text-charcoal-700 font-medium focus:outline-none focus:ring-2 focus:ring-gold-400 appearance-none cursor-pointer text-center"
            >
              {[0,1,2,3,4].map((n) => (
                <option key={n} value={n}>{n} Child{n !== 1 ? 'ren' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-gold-600 hover:bg-gold-700 text-white py-3 rounded-xl font-semibold text-base transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>
      </div>
    </form>
  )
}
