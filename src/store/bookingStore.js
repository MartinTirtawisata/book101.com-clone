import { create } from 'zustand'
import { addDays, format } from 'date-fns'

const today = new Date()
const tomorrow = addDays(today, 1)

export const useBookingStore = create((set, get) => ({
  // Search params
  destination: '',
  checkIn: format(today, 'yyyy-MM-dd'),
  checkOut: format(tomorrow, 'yyyy-MM-dd'),
  adults: 2,
  children: 0,

  // Selected room
  selectedProperty: null,
  selectedRoom: null,

  // Guest details
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  guestCountry: '',
  specialRequests: '',

  // Booking result
  bookingResult: null,

  // Actions
  setSearchParams: (params) => set(params),
  setDestination: (destination) => set({ destination }),
  setCheckIn: (checkIn) => set({ checkIn }),
  setCheckOut: (checkOut) => set({ checkOut }),
  setAdults: (adults) => set({ adults }),
  setChildren: (children) => set({ children }),
  setSelectedProperty: (selectedProperty) => set({ selectedProperty }),
  setSelectedRoom: (selectedRoom) => set({ selectedRoom }),
  setGuestDetails: (details) => set(details),
  setBookingResult: (bookingResult) => set({ bookingResult }),

  resetBooking: () => set({
    selectedProperty: null,
    selectedRoom: null,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestCountry: '',
    specialRequests: '',
    bookingResult: null,
  }),

  getTotalNights: () => {
    const { checkIn, checkOut } = get()
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)))
  },
}))
