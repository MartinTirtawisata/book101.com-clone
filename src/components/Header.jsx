import { Link, useLocation } from 'react-router-dom'
import { Hotel, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isHome ? 'bg-transparent' : 'bg-white/95 backdrop-blur-md shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Hotel className={`w-7 h-7 ${isHome ? 'text-gold-400' : 'text-gold-600'} transition-colors`} />
            <div className="flex flex-col">
              <span className={`text-lg font-semibold tracking-wide ${
                isHome ? 'text-white' : 'text-charcoal-800'
              } transition-colors`}>
                PHM Hotels
              </span>
              <span className={`text-[10px] uppercase tracking-[0.2em] -mt-1 ${
                isHome ? 'text-gold-300' : 'text-gold-600'
              } transition-colors`}>
                Book Direct
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-gold-600 ${
                isHome ? 'text-white/90' : 'text-charcoal-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/search"
              className={`text-sm font-medium transition-colors hover:text-gold-600 ${
                isHome ? 'text-white/90' : 'text-charcoal-600'
              }`}
            >
              Hotels
            </Link>
            <Link
              to="/manage"
              className={`text-sm font-medium transition-colors hover:text-gold-600 ${
                isHome ? 'text-white/90' : 'text-charcoal-600'
              }`}
            >
              Manage Booking
            </Link>
            <Link
              to="/search"
              className="bg-gold-600 hover:bg-gold-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-all hover:shadow-lg"
            >
              Book Now
            </Link>
          </nav>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg ${isHome ? 'text-white' : 'text-charcoal-700'}`}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow-xl border-t">
          <nav className="flex flex-col p-4 gap-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-charcoal-700 font-medium py-2 px-3 rounded-lg hover:bg-gold-50">Home</Link>
            <Link to="/search" onClick={() => setMobileOpen(false)} className="text-charcoal-700 font-medium py-2 px-3 rounded-lg hover:bg-gold-50">Hotels</Link>
            <Link to="/manage" onClick={() => setMobileOpen(false)} className="text-charcoal-700 font-medium py-2 px-3 rounded-lg hover:bg-gold-50">Manage Booking</Link>
            <Link to="/search" onClick={() => setMobileOpen(false)} className="bg-gold-600 text-white text-center py-3 rounded-full font-medium mt-2">Book Now</Link>
          </nav>
        </div>
      )}
    </header>
  )
}
