import { Star } from 'lucide-react'

export default function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'fill-star text-star' : 'text-grey-300'}`}
        />
      ))}
    </div>
  )
}
