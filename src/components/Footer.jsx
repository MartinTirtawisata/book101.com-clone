import { Link } from 'react-router-dom'
import { BRANDS } from '../lib/constants'

export default function Footer() {
  return (
    <footer className="bg-navy text-white/70">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1 mb-3">
              <span className="text-white text-[15px] font-bold">PHM</span>
              <span className="text-white text-[15px] font-normal tracking-[0.15em]">HOTELS</span>
            </div>
            <p className="text-[12px] leading-relaxed text-white/50">
              PT Panorama Hospitality Management — 5 brands, 18 properties, 2,064 rooms across Indonesia.
            </p>
          </div>

          {/* Our Brands */}
          <div>
            <h3 className="text-white text-[11px] font-semibold uppercase tracking-[0.08em] mb-3">Our Brands</h3>
            <ul className="space-y-2">
              {BRANDS.map((brand) => (
                <li key={brand.name}>
                  <Link
                    to={`/search?brand=${encodeURIComponent(brand.name)}`}
                    className="text-[12px] text-white/60 hover:text-cta transition-colors duration-150"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-[11px] font-semibold uppercase tracking-[0.08em] mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-[12px] text-white/60 hover:text-cta transition-colors duration-150">Home</Link></li>
              <li><Link to="/search" className="text-[12px] text-white/60 hover:text-cta transition-colors duration-150">All Hotels</Link></li>
              <li><Link to="/manage" className="text-[12px] text-white/60 hover:text-cta transition-colors duration-150">Manage Booking</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-[11px] font-semibold uppercase tracking-[0.08em] mb-3">Contact</h3>
            <ul className="space-y-2 text-[12px] text-white/60">
              <li>reservations@phmhotels.com</li>
              <li>+62 21 2963 5555</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center">
          <p className="text-[11px] text-white/40">
            &copy; {new Date().getFullYear()} PT Panorama Hospitality Management. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
