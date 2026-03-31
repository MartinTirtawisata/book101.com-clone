import { Link } from 'react-router-dom'
import { MapPin, Wifi, Car, Waves, Utensils } from 'lucide-react'
import BrandBadge from './BrandBadge'
import StarRating from './StarRating'
import { formatIDR } from '../lib/constants'

const amenityIcons = {
  'Free WiFi': Wifi,
  'Airport Transfer': Car,
  'Swimming Pool': Waves,
  'Infinity Pool': Waves,
  'Rooftop Pool': Waves,
  'Beachfront Pool': Waves,
  'Pool & Sundeck': Waves,
  'Heated Pool': Waves,
  'Restaurant': Utensils,
  'Fine Dining Restaurant': Utensils,
  'Restaurant & Bar': Utensils,
  'Cafe & Restaurant': Utensils,
  'All-Day Dining': Utensils,
  'Casual Dining': Utensils,
  'Beach Restaurant': Utensils,
}

export default function PropertyCard({ property, minPrice }) {
  const amenities = property.amenities || []
  const displayAmenities = amenities.slice(0, 4)

  return (
    <Link
      to={`/property/${property.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-charcoal-100"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={property.hero_image_url}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <BrandBadge brand={property.brand} size="xs" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-charcoal-800 text-lg leading-tight group-hover:text-gold-700 transition-colors">
            {property.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={property.star_rating} />
          <span className="flex items-center gap-1 text-sm text-charcoal-500">
            <MapPin className="w-3.5 h-3.5" />
            {property.city}
          </span>
        </div>

        {/* Amenity icons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {displayAmenities.map((amenity) => {
            const Icon = amenityIcons[amenity]
            return Icon ? (
              <span key={amenity} className="flex items-center gap-1 text-xs text-charcoal-500 bg-charcoal-50 px-2 py-1 rounded-full">
                <Icon className="w-3 h-3" />
                {amenity}
              </span>
            ) : (
              <span key={amenity} className="text-xs text-charcoal-500 bg-charcoal-50 px-2 py-1 rounded-full">
                {amenity}
              </span>
            )
          })}
        </div>

        {/* Price & CTA */}
        <div className="flex items-end justify-between pt-3 border-t border-charcoal-100">
          <div>
            <p className="text-xs text-charcoal-400">From</p>
            <p className="text-lg font-bold text-charcoal-800 price-format">
              {minPrice ? formatIDR(minPrice) : 'Check rates'}
            </p>
            <p className="text-xs text-charcoal-400">/night</p>
          </div>
          <span className="bg-gold-50 text-gold-700 px-4 py-2 rounded-xl text-sm font-semibold group-hover:bg-gold-600 group-hover:text-white transition-all">
            View Rooms
          </span>
        </div>
      </div>
    </Link>
  )
}
