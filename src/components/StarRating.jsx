import { Star } from 'lucide-react'

export default function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-gold-400 text-gold-400' : 'text-charcoal-200'}`}
        />
      ))}
    </div>
  )
}
