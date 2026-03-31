import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Users, Maximize2, BedDouble, Wifi, X, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import BrandBadge from '../components/BrandBadge'
import StarRating from '../components/StarRating'
import { supabase } from '../lib/supabase'
import { useBookingStore } from '../store/bookingStore'
import { formatIDR, TAX_RATE } from '../lib/constants'
import { format, differenceInDays } from 'date-fns'

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
      <div className="min-h-screen pt-24 bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-charcoal-100 rounded-2xl" />
            <div className="h-8 bg-charcoal-100 rounded w-1/2" />
            <div className="h-4 bg-charcoal-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-charcoal-700 mb-2">Property not found</h2>
          <button onClick={() => navigate('/search')} className="text-gold-600 font-medium hover:underline">Browse all hotels</button>
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
    if (selectedRoom) {
      navigate(`/book/${selectedRoom.id}`)
    }
  }

  const tabs = [
    { id: 'rooms', label: 'Rooms' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'location', label: 'Location' },
  ]

  return (
    <div className="min-h-screen pt-20 bg-charcoal-50">
      {/* Hero Gallery */}
      <div className="relative h-80 md:h-[28rem] overflow-hidden">
        <img
          src={property.hero_image_url}
          alt={property.name}
          className="w-full h-full object-cover"
          onClick={() => { setLightboxIndex(0); setLightboxOpen(true) }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div>
            <BrandBadge brand={property.brand} size="md" />
            <h1 className="font-serif text-3xl md:text-4xl text-white mt-3 mb-1">{property.name}</h1>
            <div className="flex items-center gap-3">
              <StarRating rating={property.star_rating} />
              <span className="text-white/80 flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4" /> {property.city}
              </span>
            </div>
          </div>
          {allImages.length > 1 && (
            <button
              onClick={() => { setLightboxIndex(0); setLightboxOpen(true) }}
              className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors"
            >
              View Gallery ({allImages.length})
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white p-2" onClick={() => setLightboxOpen(false)}>
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-4 text-white p-2"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length) }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <img
            src={allImages[lightboxIndex]}
            alt=""
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 text-white p-2"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % allImages.length) }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          <div className="absolute bottom-4 text-white text-sm">{lightboxIndex + 1} / {allImages.length}</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-charcoal-100">
              <p className="text-charcoal-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-charcoal-100 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gold-600 text-white shadow-sm'
                      : 'text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'rooms' && (
              <div className="space-y-4">
                {rooms.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-charcoal-100">
                    <p className="text-charcoal-500">No rooms available for this property yet.</p>
                  </div>
                ) : (
                  rooms.map((room) => (
                    <div key={room.id} className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all ${
                      selectedRoomId === room.id ? 'border-gold-400 ring-2 ring-gold-200' : 'border-charcoal-100'
                    }`}>
                      <div className="flex flex-col md:flex-row">
                        {/* Room image */}
                        <div className="md:w-72 h-48 md:h-auto shrink-0">
                          <img
                            src={`https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&sig=${room.id}`}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Room info */}
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-charcoal-800">{room.name}</h3>
                              <p className="text-sm text-charcoal-500 mt-1 leading-relaxed">{room.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 mb-4 text-sm text-charcoal-600">
                            {room.size_sqm && (
                              <span className="flex items-center gap-1 bg-charcoal-50 px-2.5 py-1 rounded-lg">
                                <Maximize2 className="w-3.5 h-3.5" /> {room.size_sqm} m²
                              </span>
                            )}
                            <span className="flex items-center gap-1 bg-charcoal-50 px-2.5 py-1 rounded-lg">
                              <Users className="w-3.5 h-3.5" /> Max {room.max_guests} guests
                            </span>
                            {room.bed_type && (
                              <span className="flex items-center gap-1 bg-charcoal-50 px-2.5 py-1 rounded-lg">
                                <BedDouble className="w-3.5 h-3.5" /> {room.bed_type}
                              </span>
                            )}
                          </div>
                          {/* Room amenities */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {(room.amenities || []).slice(0, 6).map((a) => (
                              <span key={a} className="text-xs bg-gold-50 text-gold-700 px-2 py-0.5 rounded-full">{a}</span>
                            ))}
                          </div>
                          <div className="flex items-end justify-between pt-3 border-t border-charcoal-100">
                            <div>
                              <p className="text-2xl font-bold text-charcoal-800 price-format">{formatIDR(room.base_price_idr)}</p>
                              <p className="text-xs text-charcoal-400">/night, before tax</p>
                            </div>
                            <button
                              onClick={() => handleSelectRoom(room)}
                              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                                selectedRoomId === room.id
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gold-600 hover:bg-gold-700 text-white hover:shadow-lg'
                              }`}
                            >
                              {selectedRoomId === room.id ? (
                                <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Selected</span>
                              ) : 'Select Room'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'facilities' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-charcoal-100">
                <h3 className="font-semibold text-charcoal-800 mb-4">Hotel Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(property.amenities || []).map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 p-3 bg-charcoal-50 rounded-xl">
                      <Check className="w-4 h-4 text-gold-600 shrink-0" />
                      <span className="text-sm text-charcoal-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-charcoal-100">
                <h3 className="font-semibold text-charcoal-800 mb-2">Location</h3>
                <p className="text-sm text-charcoal-500 mb-4">{property.address}</p>
                <div className="rounded-xl overflow-hidden h-80 bg-charcoal-100">
                  {property.latitude && property.longitude ? (
                    <iframe
                      title="Map"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-charcoal-400">
                      <MapPin className="w-12 h-12" />
                      <p className="ml-3">Map location not available</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <aside className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-charcoal-100 p-5 lg:sticky lg:top-28">
              <h3 className="font-semibold text-charcoal-800 mb-4">Booking Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Check-in</span>
                  <span className="font-medium text-charcoal-700">{format(new Date(checkIn), 'EEE, dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Check-out</span>
                  <span className="font-medium text-charcoal-700">{format(new Date(checkOut), 'EEE, dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Duration</span>
                  <span className="font-medium text-charcoal-700">{nights} night{nights > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Guests</span>
                  <span className="font-medium text-charcoal-700">{adults} Adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}</span>
                </div>
              </div>

              {selectedRoom && (
                <>
                  <div className="border-t border-charcoal-100 mt-4 pt-4">
                    <p className="text-sm font-semibold text-charcoal-700 mb-2">{selectedRoom.name}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">{formatIDR(selectedRoom.base_price_idr)} × {nights} night{nights > 1 ? 's' : ''}</span>
                        <span className="font-medium">{formatIDR(roomTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Tax (11%)</span>
                        <span className="font-medium">{formatIDR(taxAmount)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-charcoal-100 mt-3 pt-3 flex justify-between">
                    <span className="font-semibold text-charcoal-800">Total</span>
                    <span className="font-bold text-xl text-charcoal-800 price-format">{formatIDR(grandTotal)}</span>
                  </div>
                </>
              )}

              <button
                onClick={handleProceed}
                disabled={!selectedRoom}
                className={`w-full mt-5 py-3 rounded-xl font-semibold text-base transition-all ${
                  selectedRoom
                    ? 'bg-gold-600 hover:bg-gold-700 text-white hover:shadow-lg'
                    : 'bg-charcoal-100 text-charcoal-400 cursor-not-allowed'
                }`}
              >
                {selectedRoom ? 'Proceed to Book' : 'Select a Room'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
