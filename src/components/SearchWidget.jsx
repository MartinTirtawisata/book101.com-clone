import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
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

  return (
    <form onSubmit={handleSearch} className="bg-navy-light w-full">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-0">
        {/* Destination */}
        <div className="flex-1 min-w-0 px-4 border-r border-white/20 h-full flex flex-col justify-center">
          <label className="text-[10px] uppercase text-white/60 tracking-wider leading-none mb-1">Destination</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="bg-transparent text-white text-sm font-medium outline-none w-full cursor-pointer appearance-none"
          >
            <option value="" className="text-grey-800">All Destinations</option>
            {CITIES.map((city) => (
              <option key={city} value={city} className="text-grey-800">{city}</option>
            ))}
          </select>
        </div>

        {/* Check-in */}
        <div className="px-4 border-r border-white/20 h-full flex flex-col justify-center">
          <label className="text-[10px] uppercase text-white/60 tracking-wider leading-none mb-1">Check-in</label>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            className="bg-transparent text-white text-sm font-medium outline-none w-[130px] [color-scheme:dark]"
          />
        </div>

        {/* Check-out */}
        <div className="px-4 border-r border-white/20 h-full flex flex-col justify-center">
          <label className="text-[10px] uppercase text-white/60 tracking-wider leading-none mb-1">Check-out</label>
          <input
            type="date"
            value={checkOut}
            min={minCheckOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="bg-transparent text-white text-sm font-medium outline-none w-[130px] [color-scheme:dark]"
          />
        </div>

        {/* Guests */}
        <div className="px-4 border-r border-white/20 h-full flex flex-col justify-center">
          <label className="text-[10px] uppercase text-white/60 tracking-wider leading-none mb-1">Guests</label>
          <div className="flex items-center gap-2">
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer appearance-none"
            >
              {[1,2,3,4,5,6].map((n) => (
                <option key={n} value={n} className="text-grey-800">{n} Adult{n > 1 ? 's' : ''}</option>
              ))}
            </select>
            <select
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer appearance-none"
            >
              {[0,1,2,3,4].map((n) => (
                <option key={n} value={n} className="text-grey-800">{n} Child{n !== 1 ? 'ren' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="pl-4 flex items-center">
          <button
            type="submit"
            className="bg-cta hover:bg-cta-hover text-white text-[13px] font-semibold uppercase tracking-[0.5px] px-6 py-2 rounded transition-colors duration-150 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>
    </form>
  )
}
