import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Check, CreditCard, Building2, Landmark, Copy, Download, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useBookingStore } from '../store/bookingStore'
import { formatIDR, TAX_RATE } from '../lib/constants'
import BrandBadge from '../components/BrandBadge'
import { format } from 'date-fns'

const STEPS = ['Review', 'Guest Details', 'Payment']

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-cta border-t-transparent rounded-full" />
      </div>
    )
  }

  const nights = getTotalNights()
  const roomTotal = selectedRoom.base_price_idr * nights
  const taxAmount = Math.round(roomTotal * TAX_RATE)
  const grandTotal = roomTotal + taxAmount

  const validateGuest = () => {
    const errs = {}
    if (!guestName.trim()) errs.name = 'Required'
    if (!guestEmail.trim()) errs.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) errs.email = 'Invalid email'
    if (!guestPhone.trim()) errs.phone = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleConfirmBooking = async () => {
    setLoading(true)
    const { data } = await supabase.from('bookings').insert({
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
    if (data) { setBookingResult(data); setStep(3) }
    else alert('Booking failed. Please try again.')
  }

  const copyRef = () => {
    if (bookingResult) {
      navigator.clipboard.writeText(bookingResult.booking_ref)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Step indicator */}
      {step < 3 && (
        <div className="bg-card-bg border-b border-card-border">
          <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-colors duration-150 ${
                    i < step ? 'bg-success text-white' : i === step ? 'bg-cta text-white' : 'bg-grey-200 text-grey-400'
                  }`}>
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-[12px] mt-1 ${i === step ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>{s}</span>
                </div>
                {i < 2 && <div className="w-16 h-px bg-grey-200 mx-3 mb-5" />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main */}
          <div className="flex-1 max-w-[640px] mx-auto lg:mx-0">
            {/* Step 0: Review */}
            {step === 0 && (
              <div className="bg-card-bg border border-card-border rounded-[6px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
                <h2 className="text-[22px] font-bold text-text-primary mb-5">Review Your Booking</h2>

                <div className="flex gap-3 mb-5 pb-5 border-b border-card-border">
                  <img src={selectedProperty.hero_image_url} alt="" className="w-24 h-16 rounded object-cover shrink-0" />
                  <div>
                    <BrandBadge brand={selectedProperty.brand} />
                    <h3 className="text-[14px] font-semibold text-text-primary mt-1">{selectedProperty.name}</h3>
                    <p className="text-[12px] text-text-secondary">{selectedProperty.city}</p>
                  </div>
                </div>

                <div className="space-y-2 text-[14px] mb-5">
                  <div className="flex justify-between"><span className="text-text-secondary">Room Type</span><span className="font-medium text-text-primary">{selectedRoom.name}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Check-in</span><span className="font-medium text-text-primary">{format(new Date(checkIn), 'dd MMM yyyy')}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Check-out</span><span className="font-medium text-text-primary">{format(new Date(checkOut), 'dd MMM yyyy')}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Duration</span><span className="font-medium text-text-primary">{nights} night{nights > 1 ? 's' : ''}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Guests</span><span className="font-medium text-text-primary">{adults + children}</span></div>
                </div>

                {/* Price breakdown */}
                <div className="border-t border-card-border pt-3 space-y-2 text-[14px] mb-5">
                  <div className="flex justify-between"><span className="text-text-secondary">Room ({formatIDR(selectedRoom.base_price_idr)} x {nights})</span><span className="font-semibold text-text-primary">{formatIDR(roomTotal)}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Tax & Service (11%)</span><span className="font-semibold text-text-primary">{formatIDR(taxAmount)}</span></div>
                  <div className="flex justify-between border-t border-card-border pt-2"><span className="font-bold text-text-primary">Total</span><span className="font-bold text-[18px] text-text-primary">{formatIDR(grandTotal)}</span></div>
                </div>

                <button onClick={() => setStep(1)} className="w-full bg-cta hover:bg-cta-hover text-white py-3 rounded text-[13px] font-semibold uppercase tracking-[0.5px] transition-colors duration-150">
                  Continue
                </button>
              </div>
            )}

            {/* Step 1: Guest Details */}
            {step === 1 && (
              <div className="bg-card-bg border border-card-border rounded-[6px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
                <button onClick={() => setStep(0)} className="flex items-center gap-1 text-[13px] text-text-secondary hover:text-text-primary mb-4">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <h2 className="text-[22px] font-bold text-text-primary mb-5">Guest Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">Full Name *</label>
                    <input type="text" value={guestName} onChange={(e) => setGuestDetails({ guestName: e.target.value })}
                      placeholder="As shown on your ID"
                      className={`w-full px-3 py-2.5 border rounded text-[14px] text-text-primary outline-none focus:border-cta ${errors.name ? 'border-red-400' : 'border-card-border'}`} />
                    {errors.name && <p className="text-red-500 text-[12px] mt-0.5">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">Email Address *</label>
                    <input type="email" value={guestEmail} onChange={(e) => setGuestDetails({ guestEmail: e.target.value })}
                      placeholder="your@email.com"
                      className={`w-full px-3 py-2.5 border rounded text-[14px] text-text-primary outline-none focus:border-cta ${errors.email ? 'border-red-400' : 'border-card-border'}`} />
                    {errors.email && <p className="text-red-500 text-[12px] mt-0.5">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">Phone Number *</label>
                    <input type="tel" value={guestPhone} onChange={(e) => setGuestDetails({ guestPhone: e.target.value })}
                      placeholder="+62 812 3456 7890"
                      className={`w-full px-3 py-2.5 border rounded text-[14px] text-text-primary outline-none focus:border-cta ${errors.phone ? 'border-red-400' : 'border-card-border'}`} />
                    {errors.phone && <p className="text-red-500 text-[12px] mt-0.5">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">Country of Origin</label>
                    <input type="text" value={guestCountry} onChange={(e) => setGuestDetails({ guestCountry: e.target.value })}
                      placeholder="Indonesia"
                      className="w-full px-3 py-2.5 border border-card-border rounded text-[14px] text-text-primary outline-none focus:border-cta" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">Special Requests</label>
                    <textarea value={specialRequests} onChange={(e) => setGuestDetails({ specialRequests: e.target.value })}
                      placeholder="Any special requests..."
                      rows={3}
                      className="w-full px-3 py-2.5 border border-card-border rounded text-[14px] text-text-primary outline-none focus:border-cta resize-none" />
                  </div>
                </div>

                <button onClick={() => { if (validateGuest()) setStep(2) }}
                  className="w-full mt-5 bg-cta hover:bg-cta-hover text-white py-3 rounded text-[13px] font-semibold uppercase tracking-[0.5px] transition-colors duration-150">
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-card-bg border border-card-border rounded-[6px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
                <button onClick={() => setStep(1)} className="flex items-center gap-1 text-[13px] text-text-secondary hover:text-text-primary mb-4">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <h2 className="text-[22px] font-bold text-text-primary mb-5">Payment Method</h2>

                <div className="space-y-2 mb-5">
                  {[
                    { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2, desc: 'BCA / Mandiri / BNI' },
                    { id: 'virtual_account', label: 'Virtual Account', icon: Landmark, desc: 'Auto-generated VA number' },
                    { id: 'credit_card', label: 'Credit Card', icon: CreditCard, desc: 'Visa / Mastercard / JCB' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded border text-left transition-colors duration-150 ${
                        paymentMethod === method.id ? 'border-cta bg-cta/5' : 'border-card-border hover:border-grey-300'
                      }`}
                    >
                      <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-cta' : 'text-grey-400'}`} />
                      <div className="flex-1">
                        <p className="text-[14px] font-medium text-text-primary">{method.label}</p>
                        <p className="text-[12px] text-text-secondary">{method.desc}</p>
                      </div>
                      {paymentMethod === method.id && <Check className="w-4 h-4 text-cta" />}
                    </button>
                  ))}
                </div>

                <div className="bg-grey-50 rounded p-3 mb-5 text-[13px] text-text-body">
                  {paymentMethod === 'bank_transfer' && <p>Transfer to BCA 123-456-7890 a/n PT Panorama Hospitality. Amount: <strong>{formatIDR(grandTotal)}</strong></p>}
                  {paymentMethod === 'virtual_account' && <p>BCA VA: <strong>8810 1234 5678 9012</strong>. Amount: <strong>{formatIDR(grandTotal)}</strong></p>}
                  {paymentMethod === 'credit_card' && <p>You will be redirected to secure payment. Amount: <strong>{formatIDR(grandTotal)}</strong>. (Demo — no payment processed)</p>}
                </div>

                <button onClick={handleConfirmBooking} disabled={loading}
                  className="w-full bg-cta hover:bg-cta-hover text-white py-3 rounded text-[13px] font-semibold uppercase tracking-[0.5px] transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Processing...</> : 'Confirm Booking'}
                </button>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && bookingResult && (
              <div className="bg-card-bg border border-card-border rounded-[6px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)] text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-[22px] font-bold text-text-primary mb-1">Booking Confirmed!</h2>
                <p className="text-[14px] text-text-secondary mb-5">Your reservation has been successfully created.</p>

                <div className="bg-grey-50 rounded p-4 mb-5 inline-block">
                  <p className="text-[12px] text-text-secondary mb-1">Booking Reference</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[28px] font-bold text-text-primary tracking-wider font-mono">{bookingResult.booking_ref}</span>
                    <button onClick={copyRef} className="p-1.5 hover:bg-grey-200 rounded transition-colors duration-150">
                      {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-grey-400" />}
                    </button>
                  </div>
                </div>

                <div className="text-left border-t border-card-border pt-4 space-y-2 text-[14px] mb-5">
                  <div className="flex justify-between"><span className="text-text-secondary">Hotel</span><span className="font-medium text-text-primary">{selectedProperty.name}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Room</span><span className="font-medium text-text-primary">{selectedRoom.name}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Check-in</span><span className="font-medium text-text-primary">{format(new Date(checkIn), 'dd MMM yyyy')}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Check-out</span><span className="font-medium text-text-primary">{format(new Date(checkOut), 'dd MMM yyyy')}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Guest</span><span className="font-medium text-text-primary">{guestName}</span></div>
                  <div className="flex justify-between border-t border-card-border pt-2"><span className="font-bold text-text-primary">Total</span><span className="font-bold text-[18px] text-text-primary">{formatIDR(grandTotal)}</span></div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button className="flex items-center justify-center gap-2 bg-grey-100 hover:bg-grey-200 text-text-primary px-4 py-2.5 rounded text-[13px] font-medium transition-colors duration-150">
                    <Download className="w-4 h-4" /> Download Voucher
                  </button>
                  <button onClick={() => navigate('/manage')}
                    className="flex items-center justify-center gap-2 bg-cta hover:bg-cta-hover text-white px-4 py-2.5 rounded text-[13px] font-semibold uppercase tracking-[0.5px] transition-colors duration-150">
                    Manage Booking
                  </button>
                </div>

                <p className="text-[12px] text-text-secondary mt-4">Confirmation sent to <strong>{guestEmail}</strong></p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {step < 3 && (
            <aside className="lg:w-64 shrink-0">
              <div className="bg-card-bg border border-card-border rounded-[6px] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
                <div className="flex gap-2.5 mb-3 pb-3 border-b border-card-border">
                  <img src={selectedProperty.hero_image_url} alt="" className="w-14 h-10 rounded object-cover" />
                  <div>
                    <p className="text-[13px] font-semibold text-text-primary">{selectedProperty.name}</p>
                    <p className="text-[11px] text-text-secondary">{selectedRoom.name}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-[13px]">
                  <div className="flex justify-between"><span className="text-text-secondary">Room</span><span className="font-semibold text-text-primary">{formatIDR(roomTotal)}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Tax (11%)</span><span className="font-semibold text-text-primary">{formatIDR(taxAmount)}</span></div>
                  <div className="flex justify-between border-t border-card-border pt-1.5 font-bold"><span className="text-text-primary">Total</span><span className="text-text-primary">{formatIDR(grandTotal)}</span></div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
