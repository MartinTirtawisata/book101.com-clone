import { useEffect, useState } from 'react'
import { Shield, Tag, Gift, Star } from 'lucide-react'
import SearchWidget from '../components/SearchWidget'
import PropertyCard from '../components/PropertyCard'
import { supabase } from '../lib/supabase'

const BENEFITS = [
  { icon: Tag, label: 'Best Rate Guarantee' },
  { icon: Shield, label: 'Free Cancellation' },
  { icon: Star, label: 'Loyalty Rewards' },
  { icon: Gift, label: 'Exclusive Perks' },
]

export default function HomePage() {
  const [properties, setProperties] = useState([])
  const [roomPrices, setRoomPrices] = useState({})

  useEffect(() => {
    async function load() {
      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .limit(20)

      if (props) {
        setProperties(props)
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

  return (
    <div className="min-h-screen">
      {/* Search bar flush below navbar */}
      <SearchWidget />

      {/* Why Book Direct strip */}
      <div className="bg-card-bg border-b border-card-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-8 flex-wrap">
          {BENEFITS.map((b) => (
            <div key={b.label} className="flex items-center gap-1.5 text-[12px] text-text-secondary">
              <b.icon className="w-3.5 h-3.5 text-cta" />
              {b.label}
            </div>
          ))}
        </div>
      </div>

      {/* Property listing */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} minPrice={roomPrices[p.id]} />
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-16">
            <p className="text-text-secondary text-sm">Loading properties...</p>
          </div>
        )}
      </div>
    </div>
  )
}
