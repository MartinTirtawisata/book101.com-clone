import { Hotel, Camera, Globe, Video, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BRANDS } from '../lib/constants'

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 text-charcoal-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Hotel className="w-6 h-6 text-gold-400" />
              <span className="text-white text-lg font-semibold tracking-wide">PHM Hotels</span>
            </div>
            <p className="text-sm leading-relaxed text-charcoal-400">
              PT Panorama Hospitality Management — 5 brands, 18 properties, 2,064 rooms across Indonesia's most extraordinary destinations.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-charcoal-400 hover:text-gold-400 transition-colors"><Camera className="w-5 h-5" /></a>
              <a href="#" className="text-charcoal-400 hover:text-gold-400 transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="#" className="text-charcoal-400 hover:text-gold-400 transition-colors"><Video className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Our Brands */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Our Brands</h3>
            <ul className="space-y-3">
              {BRANDS.map((brand) => (
                <li key={brand.name}>
                  <Link
                    to={`/search?brand=${encodeURIComponent(brand.name)}`}
                    className="text-sm hover:text-gold-400 transition-colors"
                  >
                    {brand.name} <span className="text-charcoal-500">— {brand.tagline}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm hover:text-gold-400 transition-colors">Home</Link></li>
              <li><Link to="/search" className="text-sm hover:text-gold-400 transition-colors">All Hotels</Link></li>
              <li><Link to="/manage" className="text-sm hover:text-gold-400 transition-colors">Manage Booking</Link></li>
              <li><a href="#" className="text-sm hover:text-gold-400 transition-colors">Best Rate Guarantee</a></li>
              <li><a href="#" className="text-sm hover:text-gold-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gold-400" />
                reservations@phmhotels.com
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gold-400" />
                +62 21 2963 5555
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-charcoal-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-charcoal-500">
            &copy; {new Date().getFullYear()} PT Panorama Hospitality Management. All rights reserved.
          </p>
          <p className="text-xs text-charcoal-500">
            Book direct for the best rates & exclusive benefits.
          </p>
        </div>
      </div>
    </footer>
  )
}
