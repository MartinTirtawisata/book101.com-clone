import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-navy w-full h-14 flex items-center z-50 relative">
      <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-0.5 text-white no-underline">
          <span className="text-[15px] font-bold tracking-wide">PHM</span>
          <span className="text-[15px] font-normal tracking-[0.15em] ml-1">HOTELS</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0 text-white text-[13px] font-medium">
          <Link to="/manage" className="px-4 py-1 hover:text-cta transition-colors duration-150">
            My Booking
          </Link>
          <span className="w-px h-4 bg-white/20" />
          <span className="px-4 py-1 text-white/80 cursor-default">IDR</span>
          <span className="w-px h-4 bg-white/20" />
          <span className="px-4 py-1 text-white/80 cursor-default">EN / ID</span>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-navy border-t border-white/10 z-50">
          <nav className="flex flex-col p-4 gap-1">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-white text-[13px] font-medium py-2 px-3 hover:bg-white/10 rounded">Home</Link>
            <Link to="/search" onClick={() => setMobileOpen(false)} className="text-white text-[13px] font-medium py-2 px-3 hover:bg-white/10 rounded">Hotels</Link>
            <Link to="/manage" onClick={() => setMobileOpen(false)} className="text-white text-[13px] font-medium py-2 px-3 hover:bg-white/10 rounded">My Booking</Link>
          </nav>
        </div>
      )}
    </header>
  )
}
