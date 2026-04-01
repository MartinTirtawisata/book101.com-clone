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
    if (!bookingRef.trim() || !email.trim()) { setError('Please enter both fields.'); return }
    setError(''); setLoading(true); setBooking(null)

    const { data } = await supabase
      .from('bookings').select('*')
      .eq('booking_ref', bookingRef.toUpperCase().trim())
      .eq('guest_email', email.trim().toLowerCase())
      .single()

    if (data) {
      setBooking(data)
      const [{ data: prop }, { data: rm }] = await Promise.all([
        supabase.from('properties').select('*').eq('id', data.property_id).single(),
        supabase.from('room_types').select('*').eq('id', data.room_type_id).single(),
      ])
      setProperty(prop); setRoom(rm)
    } else {
      setError('No booking found. Check your reference and email.')
    }
    setLoading(false)
  }

  const handleCancel = async () => {
    setCancelling(true)
    const { error: cancelError } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id)
    if (!cancelError) setBooking({ ...booking, status: 'cancelled' })
    setCancelling(false); setShowCancel(false)
  }

  return (
    <div className="min-h-screen bg-page-bg pt-6">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-[22px] font-bold text-text-primary text-center mb-1">Manage Booking</h1>
        <p className="text-[14px] text-text-secondary text-center mb-6">Enter your booking reference and email.</p>

        {/* Lookup Form */}
        <form onSubmit={handleLookup} className="bg-card-bg border border-card-border rounded-[6px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)] mb-6">
          <div className="space-y-3">
            <div>
              <label className="block text-[13px] font-medium text-text-primary mb-1">Booking Reference</label>
              <input type="text" value={bookingRef} onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
                placeholder="e.g. A1B2C3D4"
                className="w-full px-3 py-2.5 border border-card-border rounded text-[14px] text-text-primary font-mono tracking-wider uppercase outline-none focus:border-cta" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-primary mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="The email used during booking"
                className="w-full px-3 py-2.5 border border-card-border rounded text-[14px] text-text-primary outline-none focus:border-cta" />
            </div>
            {error && <p className="text-red-500 text-[13px] flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-cta hover:bg-cta-hover text-white py-3 rounded text-[13px] font-semibold uppercase tracking-[0.5px] transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <><Search className="w-4 h-4" /> Find Booking</>}
            </button>
          </div>
        </form>

        {/* Booking Details */}
        {booking && (
          <div className="bg-card-bg border border-card-border rounded-[6px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
            <div className={`px-4 py-2.5 flex items-center gap-2 text-[13px] font-semibold ${
              booking.status === 'confirmed' ? 'bg-success/10 text-success' :
              booking.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'
            }`}>
              {booking.status === 'confirmed' && <Check className="w-3.5 h-3.5" />}
              {booking.status === 'cancelled' && <X className="w-3.5 h-3.5" />}
              <span className="capitalize">{booking.status}</span>
              <span className="text-[12px] font-normal ml-auto opacity-70">Ref: {booking.booking_ref}</span>
            </div>

            <div className="p-4">
              {property && (
                <div className="flex gap-3 mb-4 pb-4 border-b border-card-border">
                  <img src={property.hero_image_url} alt="" className="w-20 h-14 rounded object-cover shrink-0" />
                  <div>
                    <h3 className="text-[14px] font-semibold text-text-primary">{property.name}</h3>
                    <p className="text-[12px] text-text-secondary flex items-center gap-1"><MapPin className="w-3 h-3" /> {property.city}</p>
                    {room && <p className="text-[12px] text-text-body mt-0.5">{room.name}</p>}
                  </div>
                </div>
              )}

              <div className="space-y-2 text-[14px] mb-4">
                <div className="flex justify-between"><span className="text-text-secondary">Guest</span><span className="font-medium text-text-primary">{booking.guest_name}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Email</span><span className="font-medium text-text-primary">{booking.guest_email}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Check-in</span><span className="font-medium text-text-primary">{format(new Date(booking.check_in), 'dd MMM yyyy')}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Check-out</span><span className="font-medium text-text-primary">{format(new Date(booking.check_out), 'dd MMM yyyy')}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Guests</span><span className="font-medium text-text-primary">{booking.adults + booking.children}</span></div>
                {booking.special_requests && (
                  <div className="flex justify-between"><span className="text-text-secondary">Requests</span><span className="font-medium text-text-primary text-right max-w-[60%]">{booking.special_requests}</span></div>
                )}
                <div className="flex justify-between border-t border-card-border pt-2">
                  <span className="font-bold text-text-primary">Total</span>
                  <span className="font-bold text-[18px] text-text-primary">{formatIDR(booking.total_price_idr)}</span>
                </div>
              </div>

              {booking.status === 'confirmed' && (
                <button onClick={() => setShowCancel(true)}
                  className="w-full border-2 border-red-300 text-red-600 py-2.5 rounded text-[13px] font-semibold uppercase tracking-[0.5px] hover:bg-red-50 transition-colors duration-150">
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        )}

        {/* Cancel modal */}
        {showCancel && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCancel(false)}>
            <div className="bg-card-bg rounded-[6px] p-6 max-w-sm w-full shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-[16px] font-semibold text-text-primary mb-1">Cancel Booking?</h3>
                <p className="text-[13px] text-text-secondary mb-5">This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowCancel(false)}
                    className="flex-1 py-2.5 rounded border border-card-border text-[13px] font-medium text-text-primary hover:bg-grey-50 transition-colors duration-150">
                    Keep Booking
                  </button>
                  <button onClick={handleCancel} disabled={cancelling}
                    className="flex-1 py-2.5 rounded bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors duration-150 disabled:opacity-50">
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
