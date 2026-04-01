import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Users, Maximize2, BedDouble, X, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import BrandBadge from '../components/BrandBadge'
import StarRating from '../components/StarRating'
import SearchWidget from '../components/SearchWidget'
import { supabase } from '../lib/supabase'
import { useBookingStore } from '../store/bookingStore'
import { formatIDR, TAX_RATE } from '../lib/constants'
import { format } from 'date-fns'

export default function PropertyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { checkIn, checkOut, adults, children, setSelectedProperty, setSelectedRoom, getTotalNights } = useBookingStore()

  const [property, setProperty] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('rooms')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [activeThumb, setActiveThumb] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: prop }, { data: roomData }] = await Promise.all([
        supabase.from('properties').select('*').eq('id', id).single(),
        supabase.from('room_types').select('*').eq('property_id', id).eq('is_active', true),
      ])
      setProperty(prop)
      setRooms(roomData || [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen">
        <SearchWidget />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-[420px] bg-grey-200 rounded-[6px]" />
            <div className="h-6 bg-grey-200 rounded w-1/3" />
            <div className="h-4 bg-grey-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen">
        <SearchWidget />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-text-secondary">Property not found.</p>
          <button onClick={() => navigate('/search')} className="text-cta font-medium text-sm mt-2 hover:text-cta-hover">Browse all hotels</button>
        </div>
      </div>
    )
  }

  const allImages = [property.hero_image_url, ...(property.gallery_urls || [])]
  const nights = getTotalNights()
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId)
  const roomTotal = selectedRoom ? selectedRoom.base_price_idr * nights : 0
  const taxAmount = Math.round(roomTotal * TAX_RATE)
  const grandTotal = roomTotal + taxAmount

  const handleSelectRoom = (room) => {
    setSelectedRoomId(room.id)
    setSelectedProperty(property)
    setSelectedRoom(room)
  }

  const handleProceed = () => {
    if (selectedRoom) navigate(`/book/${selectedRoom.id}`)
  }

  const tabs = [
    { id: 'rooms', label: 'Rooms' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'location', label: 'Location' },
  ]

  return (
    <div className="min-h-screen">
      <SearchWidget />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Gallery */}
            <div className="mb-4">
              <div className="relative cursor-pointer" onClick={() => { setLightboxIndex(activeThumb); setLightboxOpen(true) }}>
                <img
                  src={allImages[activeThumb] || property.hero_image_url}
                  alt={property.name}
                  className="w-full h-[420px] object-cover rounded-[6px]"
                />
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-2">
                  {allImages.slice(0, 4).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveThumb(i)}
                      className={`h-20 flex-1 rounded overflow-hidden border-2 transition-colors duration-150 ${
                        activeThumb === i ? 'border-cta' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property info */}
            <div className="flex items-center gap-3 mb-1">
              <BrandBadge brand={property.brand} />
              <StarRating rating={property.star_rating} />
            </div>
            <h1 className="text-[24px] font-bold text-text-primary mt-2">{property.name}</h1>
            <p className="text-[13px] text-text-secondary flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" /> {property.city}{property.address ? ` — ${property.address}` : ''}
            </p>
            <p className="text-[14px] text-text-body mt-3 leading-relaxed">{property.description}</p>

            {/* Tabs */}
            <div className="border-b border-card-border mt-6 mb-4 flex gap-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-[13px] uppercase font-medium tracking-[0.5px] px-4 py-3 border-b-2 transition-colors duration-150 ${
                    activeTab === tab.id
                      ? 'border-cta text-cta'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'rooms' && (
              <div className="flex flex-col gap-3">
                {rooms.length === 0 ? (
                  <div className="bg-card-bg border border-card-border rounded-[6px] p-8 text-center">
                    <p className="text-text-secondary text-sm">No rooms available for this property yet.</p>
                  </div>
                ) : (
                  rooms.map((room) => (
                    <div key={room.id} className={`bg-card-bg border rounded-[6px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex flex-col md:flex-row transition-colors duration-150 ${
                      selectedRoomId === room.id ? 'border-cta' : 'border-card-border'
                    }`}>
                      <div className="md:w-[200px] h-[160px] md:h-auto shrink-0">
                        <img
                          src={`https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&sig=${room.id}`}
                          alt={room.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <h3 className="text-[16px] font-semibold text-text-primary">{room.name}</h3>
                          <p className="text-[13px] text-text-secondary mt-1">{room.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2 text-[12px] text-text-secondary">
                            {room.size_sqm && (
                              <span className="flex items-center gap-1 bg-grey-100 px-2 py-0.5 rounded">
                                <Maximize2 className="w-3 h-3" /> {room.size_sqm} m²
                              </span>
                            )}
                            <span className="flex items-center gap-1 bg-grey-100 px-2 py-0.5 rounded">
                              <Users className="w-3 h-3" /> Max {room.max_guests}
                            </span>
                            {room.bed_type && (
                              <span className="flex items-center gap-1 bg-grey-100 px-2 py-0.5 rounded">
                                <BedDouble className="w-3 h-3" /> {room.bed_type}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(room.amenities || []).slice(0, 5).map((a) => (
                              <span key={a} className="text-[11px] text-text-secondary bg-grey-100 px-2 py-0.5 rounded-xl">{a}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-end justify-between mt-3 pt-3 border-t border-card-border">
                          <div>
                            <p className="text-[18px] font-bold text-text-primary price-format">{formatIDR(room.base_price_idr)}</p>
                            <p className="text-[11px] text-text-secondary">/ night, before tax</p>
                          </div>
                          <button
                            onClick={() => handleSelectRoom(room)}
                            className={`text-[13px] font-semibold uppercase tracking-[0.5px] px-4 py-2 rounded transition-colors duration-150 ${
                              selectedRoomId === room.id
                                ? 'bg-cta text-white'
                                : 'border-2 border-cta text-cta hover:bg-cta hover:text-white'
                            }`}
                          >
                            {selectedRoomId === room.id ? (
                              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Selected</span>
                            ) : 'Select Room'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'facilities' && (
              <div className="bg-card-bg border border-card-border rounded-[6px] p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(property.amenities || []).map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 p-2.5 bg-grey-50 rounded">
                      <Check className="w-3.5 h-3.5 text-cta shrink-0" />
                      <span className="text-[13px] text-text-body">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="bg-card-bg border border-card-border rounded-[6px] p-4">
                <p className="text-[13px] text-text-secondary mb-3">{property.address}</p>
                <div className="rounded overflow-hidden h-72 bg-grey-100">
                  {property.latitude && property.longitude ? (
                    <iframe title="Map" width="100%" height="100%" style={{ border: 0 }} loading="lazy"
                      src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
                      <MapPin className="w-8 h-8 mr-2" /> Map location not available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="bg-card-bg border border-card-border rounded-[6px] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.08)] lg:sticky lg:top-4">
              <h3 className="text-[14px] font-semibold text-text-primary mb-3">Booking Summary</h3>

              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between"><span className="text-text-secondary">Check-in</span><span className="font-medium text-text-primary">{format(new Date(checkIn), 'dd MMM yyyy')}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Check-out</span><span className="font-medium text-text-primary">{format(new Date(checkOut), 'dd MMM yyyy')}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Duration</span><span className="font-medium text-text-primary">{nights} night{nights > 1 ? 's' : ''}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Guests</span><span className="font-medium text-text-primary">{adults + children}</span></div>
              </div>

              {selectedRoom && (
                <>
                  <div className="border-t border-card-border mt-3 pt-3">
                    <p className="text-[13px] font-semibold text-text-primary mb-2">{selectedRoom.name}</p>
                    <div className="space-y-1.5 text-[13px]">
                      <div className="flex justify-between"><span className="text-text-secondary">{formatIDR(selectedRoom.base_price_idr)} x {nights}</span><span className="font-semibold text-text-primary">{formatIDR(roomTotal)}</span></div>
                      <div className="flex justify-between"><span className="text-text-secondary">Tax (11%)</span><span className="font-semibold text-text-primary">{formatIDR(taxAmount)}</span></div>
                    </div>
                  </div>
                  <div className="border-t border-card-border mt-2 pt-2 flex justify-between">
                    <span className="text-[14px] font-bold text-text-primary">Total</span>
                    <span className="text-[18px] font-bold text-text-primary price-format">{formatIDR(grandTotal)}</span>
                  </div>
                </>
              )}

              <button
                onClick={handleProceed}
                disabled={!selectedRoom}
                className={`w-full mt-4 py-3 rounded text-[13px] font-semibold uppercase tracking-[0.5px] transition-colors duration-150 ${
                  selectedRoom
                    ? 'bg-cta hover:bg-cta-hover text-white'
                    : 'bg-grey-200 text-grey-400 cursor-not-allowed'
                }`}
              >
                {selectedRoom ? 'Proceed to Book' : 'Select a Room'}
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white p-2" onClick={() => setLightboxOpen(false)}><X className="w-7 h-7" /></button>
          <button className="absolute left-4 text-white p-2"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length) }}>
            <ChevronLeft className="w-7 h-7" />
          </button>
          <img src={allImages[lightboxIndex]} alt="" className="max-w-[90vw] max-h-[85vh] object-contain rounded" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 text-white p-2"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % allImages.length) }}>
            <ChevronRight className="w-7 h-7" />
          </button>
          <div className="absolute bottom-4 text-white text-[13px]">{lightboxIndex + 1} / {allImages.length}</div>
        </div>
      )}
    </div>
  )
}
