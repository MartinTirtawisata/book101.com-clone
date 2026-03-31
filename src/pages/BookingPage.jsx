import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Check, CreditCard, Building2, Landmark, Copy, Download, ArrowLeft, Shield, Tag, Gift } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useBookingStore } from '../store/bookingStore'
import { formatIDR, TAX_RATE } from '../lib/constants'
import BrandBadge from '../components/BrandBadge'
import { format } from 'date-fns'

const STEPS = ['Review', 'Guest Details', 'Payment', 'Confirmation']

export default function BookingPage() {
  const { roomTypeId } = useParams()
  const navigate = useNavigate()
  const store = useBookingStore()
  const {
    selectedProperty, selectedRoom, checkIn, checkOut, adults, children,
    guestName, guestEmail, guestPhone, guestCountry, specialRequests,
    setGuestDetails, setSelectedProperty, setSelectedRoom, setBookingResult,
    bookingResult, getTotalNights,
  } = store

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [errors, setErrors] = useState({})
  const [copied, setCopied] = useState(false)

  // Load room/property if not in store (e.g., direct URL access)
  useEffect(() => {
    if (!selectedRoom || selectedRoom.id !== roomTypeId) {
      async function load() {
        const { data: room } = await supabase.from('room_types').select('*').eq('id', roomTypeId).single()
        if (room) {
          setSelectedRoom(room)
          const { data: prop } = await supabase.from('properties').select('*').eq('id', room.property_id).single()
          if (prop) setSelectedProperty(prop)
        }
      }
      load()
    }
  }, [roomTypeId])

  if (!selectedRoom || !selectedProperty) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gold-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-charcoal-500">Loading booking details...</p>
        </div>
      </div>
    )
  }

  const nights = getTotalNights()
  const roomTotal = selectedRoom.base_price_idr * nights
  const taxAmount = Math.round(roomTotal * TAX_RATE)
  const grandTotal = roomTotal + taxAmount

  const validateGuest = () => {
    const errs = {}
    if (!guestName.trim()) errs.name = 'Full name is required'
    if (!guestEmail.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) errs.email = 'Enter a valid email'
    if (!guestPhone.trim()) errs.phone = 'Phone number is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleConfirmBooking = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('bookings').insert({
      property_id: selectedProperty.id,
      room_type_id: selectedRoom.id,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      check_in: checkIn,
      check_out: checkOut,
      adults,
      children,
      total_price_idr: grandTotal,
      special_requests: specialRequests || null,
    }).select().single()

    setLoading(false)
    if (data) {
      setBookingResult(data)
      setStep(3)
    } else {
      alert('Booking failed. Please try again.')
    }
  }

  const copyRef = () => {
    if (bookingResult) {
      navigator.clipboard.writeText(bookingResult.booking_ref)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen pt-20 bg-charcoal-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress steps */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.slice(0, 3).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  i < step ? 'bg-green-500 text-white' : i === step ? 'bg-gold-600 text-white' : 'bg-charcoal-200 text-charcoal-500'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${i === step ? 'text-charcoal-800' : 'text-charcoal-400'}`}>{s}</span>
                {i < 2 && <div className="w-8 sm:w-16 h-px bg-charcoal-200" />}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            {/* Step 0: Review */}
            {step === 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-charcoal-100">
                <h2 className="text-xl font-semibold text-charcoal-800 mb-6">Review Your Booking</h2>

                <div className="flex gap-4 mb-6 pb-6 border-b border-charcoal-100">
                  <img src={selectedProperty.hero_image_url} alt="" className="w-28 h-20 rounded-xl object-cover shrink-0" />
                  <div>
                    <BrandBadge brand={selectedProperty.brand} size="xs" />
                    <h3 className="font-semibold text-charcoal-800 mt-1">{selectedProperty.name}</h3>
                    <p className="text-sm text-charcoal-500">{selectedProperty.city}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between"><span className="text-charcoal-500">Room Type</span><span className="font-medium">{selectedRoom.name}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-500">Check-in</span><span className="font-medium">{format(new Date(checkIn), 'EEE, dd MMM yyyy')}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-500">Check-out</span><span className="font-medium">{format(new Date(checkOut), 'EEE, dd MMM yyyy')}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-500">Duration</span><span className="font-medium">{nights} night{nights > 1 ? 's' : ''}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-500">Guests</span><span className="font-medium">{adults + children} guest{adults + children > 1 ? 's' : ''}</span></div>
                </div>

                <div className="bg-charcoal-50 rounded-xl p-4 space-y-2 text-sm mb-6">
                  <div className="flex justify-between"><span className="text-charcoal-500">Room Rate ({formatIDR(selectedRoom.base_price_idr)} × {nights})</span><span className="font-medium">{formatIDR(roomTotal)}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-500">Tax & Service (11%)</span><span className="font-medium">{formatIDR(taxAmount)}</span></div>
                  <div className="flex justify-between pt-2 border-t border-charcoal-200"><span className="font-semibold text-charcoal-800">Total</span><span className="font-bold text-lg text-charcoal-800">{formatIDR(grandTotal)}</span></div>
                </div>

                <button onClick={() => setStep(1)} className="w-full bg-gold-600 hover:bg-gold-700 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg">
                  Continue
                </button>
              </div>
            )}

            {/* Step 1: Guest Details */}
            {step === 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-charcoal-100">
                <button onClick={() => setStep(0)} className="flex items-center gap-1 text-sm text-charcoal-500 hover:text-charcoal-700 mb-4">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="text-xl font-semibold text-charcoal-800 mb-6">Guest Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestDetails({ guestName: e.target.value })}
                      placeholder="As shown on your ID"
                      className={`w-full px-4 py-3 border rounded-xl text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-gold-400 ${errors.name ? 'border-red-400' : 'border-charcoal-200'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestDetails({ guestEmail: e.target.value })}
                      placeholder="your@email.com"
                      className={`w-full px-4 py-3 border rounded-xl text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-gold-400 ${errors.email ? 'border-red-400' : 'border-charcoal-200'}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestDetails({ guestPhone: e.target.value })}
                      placeholder="+62 812 3456 7890"
                      className={`w-full px-4 py-3 border rounded-xl text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-gold-400 ${errors.phone ? 'border-red-400' : 'border-charcoal-200'}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Country of Origin</label>
                    <input
                      type="text"
                      value={guestCountry}
                      onChange={(e) => setGuestDetails({ guestCountry: e.target.value })}
                      placeholder="Indonesia"
                      className="w-full px-4 py-3 border border-charcoal-200 rounded-xl text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-gold-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Special Requests</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setGuestDetails({ specialRequests: e.target.value })}
                      placeholder="Any special requests for your stay..."
                      rows={3}
                      className="w-full px-4 py-3 border border-charcoal-200 rounded-xl text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => { if (validateGuest()) setStep(2) }}
                  className="w-full mt-6 bg-gold-600 hover:bg-gold-700 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-charcoal-100">
                <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-charcoal-500 hover:text-charcoal-700 mb-4">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="text-xl font-semibold text-charcoal-800 mb-6">Payment Method</h2>

                <div className="space-y-3 mb-6">
                  {[
                    { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2, desc: 'Manual transfer to BCA / Mandiri / BNI' },
                    { id: 'virtual_account', label: 'Virtual Account', icon: Landmark, desc: 'Auto-generated VA number (BCA, Mandiri, BNI)' },
                    { id: 'credit_card', label: 'Credit Card', icon: CreditCard, desc: 'Visa / Mastercard / JCB' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        paymentMethod === method.id
                          ? 'border-gold-400 bg-gold-50 ring-2 ring-gold-200'
                          : 'border-charcoal-200 hover:border-charcoal-300'
                      }`}
                    >
                      <method.icon className={`w-6 h-6 ${paymentMethod === method.id ? 'text-gold-600' : 'text-charcoal-400'}`} />
                      <div>
                        <p className="font-medium text-charcoal-800">{method.label}</p>
                        <p className="text-xs text-charcoal-500">{method.desc}</p>
                      </div>
                      {paymentMethod === method.id && <Check className="w-5 h-5 text-gold-600 ml-auto" />}
                    </button>
                  ))}
                </div>

                {/* Mock instructions */}
                <div className="bg-charcoal-50 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-charcoal-700 text-sm mb-2">Payment Instructions</h4>
                  {paymentMethod === 'bank_transfer' && (
                    <div className="text-sm text-charcoal-600 space-y-1">
                      <p>Transfer to: BCA 123-456-7890 a/n PT Panorama Hospitality</p>
                      <p>Amount: <strong>{formatIDR(grandTotal)}</strong></p>
                      <p className="text-xs text-charcoal-400 mt-2">Payment will be confirmed within 1×24 hours.</p>
                    </div>
                  )}
                  {paymentMethod === 'virtual_account' && (
                    <div className="text-sm text-charcoal-600 space-y-1">
                      <p>BCA VA: <strong>8810 1234 5678 9012</strong></p>
                      <p>Amount: <strong>{formatIDR(grandTotal)}</strong></p>
                      <p className="text-xs text-charcoal-400 mt-2">VA valid for 24 hours. Auto-confirmed upon payment.</p>
                    </div>
                  )}
                  {paymentMethod === 'credit_card' && (
                    <div className="text-sm text-charcoal-600 space-y-1">
                      <p>You will be redirected to a secure payment page.</p>
                      <p>Amount: <strong>{formatIDR(grandTotal)}</strong></p>
                      <p className="text-xs text-charcoal-400 mt-2">This is a demo — no actual payment will be processed.</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="w-full bg-gold-600 hover:bg-gold-700 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </>
                  ) : 'Confirm Booking'}
                </button>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && bookingResult && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-charcoal-100 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-charcoal-800 mb-2">Booking Confirmed!</h2>
                <p className="text-charcoal-500 mb-6">Your reservation has been successfully created.</p>

                <div className="bg-charcoal-50 rounded-xl p-6 mb-6 inline-block mx-auto">
                  <p className="text-sm text-charcoal-500 mb-1">Booking Reference</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-charcoal-800 tracking-wider font-mono">
                      {bookingResult.booking_ref}
                    </span>
                    <button
                      onClick={copyRef}
                      className="p-2 hover:bg-charcoal-200 rounded-lg transition-colors"
                      title="Copy reference"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-charcoal-500" />}
                    </button>
                  </div>
                </div>

                <div className="text-left bg-charcoal-50 rounded-xl p-5 space-y-2 text-sm mb-6">
                  <div className="flex justify-between"><span className="text-charcoal-500">Hotel</span><span className="font-medium">{selectedProperty.name}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-500">Room</span><span className="font-medium">{selectedRoom.name}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-500">Check-in</span><span className="font-medium">{format(new Date(checkIn), 'EEE, dd MMM yyyy')}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-500">Check-out</span><span className="font-medium">{format(new Date(checkOut), 'EEE, dd MMM yyyy')}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-500">Guest</span><span className="font-medium">{guestName}</span></div>
                  <div className="flex justify-between pt-2 border-t border-charcoal-200"><span className="font-semibold">Total Paid</span><span className="font-bold text-lg">{formatIDR(grandTotal)}</span></div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button className="flex items-center justify-center gap-2 bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-700 px-6 py-3 rounded-xl font-medium transition-colors">
                    <Download className="w-4 h-4" /> Download Voucher
                  </button>
                  <button
                    onClick={() => navigate('/manage')}
                    className="flex items-center justify-center gap-2 bg-gold-600 hover:bg-gold-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
                  >
                    Manage My Booking
                  </button>
                </div>

                <p className="text-sm text-charcoal-400 mt-6">A confirmation email has been sent to <strong>{guestEmail}</strong></p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {step < 3 && (
            <aside className="lg:w-72 shrink-0">
              {/* Price summary */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-charcoal-100 mb-4">
                <div className="flex gap-3 mb-4 pb-4 border-b border-charcoal-100">
                  <img src={selectedProperty.hero_image_url} alt="" className="w-16 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="font-semibold text-charcoal-800 text-sm">{selectedProperty.name}</p>
                    <p className="text-xs text-charcoal-500">{selectedRoom.name}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-charcoal-500">Room</span><span className="font-medium">{formatIDR(roomTotal)}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-500">Tax (11%)</span><span className="font-medium">{formatIDR(taxAmount)}</span></div>
                  <div className="flex justify-between pt-2 border-t border-charcoal-100 font-semibold"><span>Total</span><span className="text-lg">{formatIDR(grandTotal)}</span></div>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-gold-50 rounded-2xl p-5 border border-gold-200">
                <h4 className="font-semibold text-gold-800 text-sm mb-3">Book Direct Benefits</h4>
                <ul className="space-y-2">
                  {[
                    { icon: Tag, text: 'Best Rate Guarantee' },
                    { icon: Shield, text: 'Free Cancellation' },
                    { icon: Gift, text: 'Complimentary Perks' },
                  ].map((b) => (
                    <li key={b.text} className="flex items-center gap-2 text-sm text-gold-700">
                      <b.icon className="w-4 h-4 text-gold-500" />
                      {b.text}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
