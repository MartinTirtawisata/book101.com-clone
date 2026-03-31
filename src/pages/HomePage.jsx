import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Tag, Gift, Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import SearchWidget from '../components/SearchWidget'
import PropertyCard from '../components/PropertyCard'
import BrandBadge from '../components/BrandBadge'
import { supabase } from '../lib/supabase'
import { BRANDS } from '../lib/constants'

const BENEFITS = [
  { icon: Tag, title: 'Best Rate Guarantee', desc: 'Always the lowest price when you book direct with us.' },
  { icon: Shield, title: 'Free Cancellation', desc: 'Flexible booking with free cancellation up to 24 hours.' },
  { icon: Star, title: 'Loyalty Rewards', desc: 'Earn points on every stay, redeemable across all properties.' },
  { icon: Gift, title: 'Exclusive Perks', desc: 'Complimentary upgrades, welcome drinks & late checkout.' },
]

const brandImages = {
  'THE HAVEN': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600',
  'THE 1O1': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600',
  '1O1 STYLE': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',
  '1O1 URBAN': 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600',
  'FRii': 'https://images.unsplash.com/photo-1540541338537-519b7e8d6b55?w=600',
}

export default function HomePage() {
  const [properties, setProperties] = useState([])
  const [roomPrices, setRoomPrices] = useState({})

  useEffect(() => {
    async function load() {
      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .limit(8)

      if (props) {
        setProperties(props)
        // Get min prices per property
        const { data: rooms } = await supabase
          .from('room_types')
          .select('property_id, base_price_idr')
          .eq('is_active', true)

        if (rooms) {
          const prices = {}
          rooms.forEach((r) => {
            if (!prices[r.property_id] || r.base_price_idr < prices[r.property_id]) {
              prices[r.property_id] = r.base_price_idr
            }
          })
          setRoomPrices(prices)
        }
      }
    }
    load()
  }, [])

  const featured = properties.slice(0, 4)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920"
            alt="Luxury hotel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-gold-300 text-sm uppercase tracking-[0.3em] mb-4 font-medium">PT Panorama Hospitality Management</p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl text-white mb-4 leading-tight">
              Discover Indonesia's<br />Finest Hotels
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              5 brands. 18 properties. 2,064 rooms across the archipelago's most extraordinary destinations.
            </p>
          </div>
          <SearchWidget />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full" />
          </div>
        </div>
      </section>

      {/* Why Book Direct */}
      <section className="py-20 bg-gradient-to-b from-gold-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gold-600 text-sm uppercase tracking-[0.2em] font-semibold mb-2">Why Book Direct</p>
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal-800">The Direct Advantage</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-6 shadow-sm border border-charcoal-100 hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold-100 transition-colors">
                  <b.icon className="w-6 h-6 text-gold-600" />
                </div>
                <h3 className="font-semibold text-charcoal-800 mb-2">{b.title}</h3>
                <p className="text-sm text-charcoal-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featured.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-gold-600 text-sm uppercase tracking-[0.2em] font-semibold mb-2">Featured Hotels</p>
                <h2 className="font-serif text-3xl md:text-4xl text-charcoal-800">Popular Destinations</h2>
              </div>
              <Link to="/search" className="hidden md:flex items-center gap-1 text-gold-600 font-semibold text-sm hover:text-gold-700 transition-colors">
                View All Hotels <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((p) => (
                <PropertyCard key={p.id} property={p} minPrice={roomPrices[p.id]} />
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link to="/search" className="inline-flex items-center gap-1 text-gold-600 font-semibold text-sm">
                View All Hotels <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Brand Showcase */}
      <section className="py-20 bg-charcoal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gold-400 text-sm uppercase tracking-[0.2em] font-semibold mb-2">Our Portfolio</p>
            <h2 className="font-serif text-3xl md:text-4xl text-white">Five Brands, One Promise</h2>
            <p className="text-charcoal-400 mt-3 max-w-xl mx-auto">From upscale leisure retreats to midscale boutique gems — there's a PHM hotel for every journey.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {BRANDS.map((brand) => (
              <Link
                key={brand.name}
                to={`/search?brand=${encodeURIComponent(brand.name)}`}
                className="group relative rounded-2xl overflow-hidden h-72"
              >
                <img
                  src={brandImages[brand.name]}
                  alt={brand.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-bold text-lg mb-1">{brand.name}</h3>
                  <p className="text-white/70 text-sm">{brand.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-gold-600 to-gold-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Ready to Explore?</h2>
          <p className="text-gold-100 mb-8 text-lg">Book direct and enjoy exclusive rates across all 18 PHM Hotels properties.</p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 bg-white text-gold-700 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Browse All Hotels <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
