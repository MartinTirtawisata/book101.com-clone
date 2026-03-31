import { useState } from 'react'
import { Search, AlertTriangle, Check, X, MapPin, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatIDR } from '../lib/constants'
import { format } from 'date-fns'

export default function ManageBookingPage() {
  const [bookingRef, setBookingRef] = useState('')
  const [email, setEmail] = useState('')
  const [booking, setBooking] = useState(null)
  const [property, setProperty] = useState(null)
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCancel, setShowCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const handleLookup = async (e) => {
    e.preventDefault()
    if (!bookingRef.trim() || !email.trim()) {
      setError('Please enter both booking reference and email.')
      return
    }
    setError('')
    setLoading(true)
    setBooking(null)

    const { data, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_ref', bookingRef.toUpperCase().trim())
      .eq('guest_email', email.trim().toLowerCase())
      .single()

    if (data) {
      setBooking(data)
      // Load property and room info
      const [{ data: prop }, { data: rm }] = await Promise.all([
        supabase.from('properties').select('*').eq('id', data.property_id).single(),
        supabase.from('room_types').select('*').eq('id', data.room_type_id).single(),
      ])
      setProperty(prop)
      setRoom(rm)
    } else {
      setError('No booking found. Please check your reference number and email.')
    }
    setLoading(false)
  }

  const handleCancel = async () => {
    setCancelling(true)
    const { error: cancelError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', booking.id)

    if (!cancelError) {
      setBooking({ ...booking, status: 'cancelled' })
    }
    setCancelling(false)
    setShowCancel(false)
  }

  return (
    <div className="min-h-screen pt-20 bg-charcoal-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-charcoal-800 mb-2">Manage Your Booking</h1>
          <p className="text-charcoal-500">Enter your booking reference and email to view your reservation.</p>
        </div>

        {/* Lookup Form */}
        <form onSubmit={handleLookup} className="bg-white rounded-2xl p-6 shadow-sm border border-charcoal-100 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Booking Reference</label>
              <input
                type="text"
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
                placeholder="e.g. A1B2C3D4"
                className="w-full px-4 py-3 border border-charcoal-200 rounded-xl text-charcoal-700 font-mono text-lg tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="The email used during booking"
                className="w-full px-4 py-3 border border-charcoal-200 rounded-xl text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-600 hover:bg-gold-700 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <><Search className="w-4 h-4" /> Find Booking</>
              )}
            </button>
          </div>
        </form>

        {/* Booking Details */}
        {booking && (
          <div className="bg-white rounded-2xl shadow-sm border border-charcoal-100 overflow-hidden">
            {/* Status banner */}
            <div className={`px-6 py-3 flex items-center gap-2 ${
              booking.status === 'confirmed' ? 'bg-green-50 text-green-700' :
              booking.status === 'cancelled' ? 'bg-red-50 text-red-700' :
              'bg-yellow-50 text-yellow-700'
            }`}>
              {booking.status === 'confirmed' && <Check className="w-4 h-4" />}
              {booking.status === 'cancelled' && <X className="w-4 h-4" />}
              <span className="font-semibold text-sm capitalize">{booking.status}</span>
              <span className="text-xs ml-auto">Ref: {booking.booking_ref}</span>
            </div>

            <div className="p-6">
              {/* Hotel info */}
              {property && (
                <div className="flex gap-4 mb-6 pb-6 border-b border-charcoal-100">
                  <img src={property.hero_image_url} alt="" className="w-24 h-18 rounded-xl object-cover shrink-0" />
                  <div>
                    <h3 className="font-semibold text-charcoal-800">{property.name}</h3>
                    <p className="text-sm text-charcoal-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5" /> {property.city}</p>
                    {room && <p className="text-sm text-charcoal-600 mt-1">{room.name}</p>}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between"><span className="text-charcoal-500">Guest</span><span className="font-medium">{booking.guest_name}</span></div>
                <div className="flex justify-between"><span className="text-charcoal-500">Email</span><span className="font-medium">{booking.guest_email}</span></div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Check-in</span>
                  <span className="font-medium flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-charcoal-400" />{format(new Date(booking.check_in), 'EEE, dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Check-out</span>
                  <span className="font-medium flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-charcoal-400" />{format(new Date(booking.check_out), 'EEE, dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between"><span className="text-charcoal-500">Guests</span><span className="font-medium">{booking.adults} Adult{booking.adults > 1 ? 's' : ''}{booking.children > 0 ? `, ${booking.children} Child${booking.children > 1 ? 'ren' : ''}` : ''}</span></div>
                {booking.special_requests && (
                  <div className="flex justify-between"><span className="text-charcoal-500">Special Requests</span><span className="font-medium text-right max-w-[60%]">{booking.special_requests}</span></div>
                )}
                <div className="flex justify-between pt-3 border-t border-charcoal-100">
                  <span className="font-semibold text-charcoal-800">Total</span>
                  <span className="font-bold text-lg text-charcoal-800">{formatIDR(booking.total_price_idr)}</span>
                </div>
              </div>

              {/* Cancel button */}
              {booking.status === 'confirmed' && (
                <button
                  onClick={() => setShowCancel(true)}
                  className="w-full border-2 border-red-200 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        )}

        {/* Cancel confirmation modal */}
        {showCancel && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCancel(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal-800 mb-2">Cancel Booking?</h3>
                <p className="text-sm text-charcoal-500 mb-6">This action cannot be undone. Your reservation at {property?.name} will be cancelled.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancel(false)}
                    className="flex-1 py-3 rounded-xl border border-charcoal-200 font-medium text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
