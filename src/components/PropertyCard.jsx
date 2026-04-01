import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import BrandBadge from './BrandBadge'
import StarRating from './StarRating'
import { formatIDR } from '../lib/constants'

export default function PropertyCard({ property, minPrice }) {
  const amenities = property.amenities || []
  const displayAmenities = amenities.slice(0, 5)

  return (
    <Link
      to={`/property/${property.id}`}
      className="group bg-card-bg border border-card-border rounded-[6px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-shadow duration-150 flex flex-col md:flex-row no-underline"
    >
      {/* Photo */}
      <div className="md:w-[280px] h-[180px] md:h-auto shrink-0">
        <img
          src={property.hero_image_url}
          alt={property.name}
          className="w-full h-full object-cover md:rounded-l-[6px] md:rounded-r-none rounded-t-[6px] md:rounded-t-none"
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between min-h-[180px]">
        {/* Top */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <BrandBadge brand={property.brand} />
            <StarRating rating={property.star_rating} />
          </div>

          <h3 className="text-[16px] font-semibold text-text-primary mt-1 leading-tight">
            {property.name}
          </h3>

          <p className="text-[13px] text-text-secondary flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {property.city}{property.address ? ` — ${property.address}` : ''}
          </p>

          {/* Amenity chips */}
          <div className="flex flex-wrap gap-1 mt-2">
            {displayAmenities.map((amenity) => (
              <span
                key={amenity}
                className="text-[11px] text-text-secondary bg-grey-100 px-2 py-0.5 rounded-xl"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex items-end justify-between mt-3 pt-3 border-t border-card-border">
          <div>
            <p className="text-[18px] font-bold text-text-primary price-format">
              {minPrice ? formatIDR(minPrice) : 'Check rates'}
            </p>
            <p className="text-[11px] text-text-secondary">/ night</p>
          </div>
          <span className="bg-cta hover:bg-cta-hover text-white text-[13px] font-semibold uppercase tracking-[0.5px] px-4 py-2 rounded transition-colors duration-150">
            Book Now
          </span>
        </div>
      </div>
    </Link>
  )
}
