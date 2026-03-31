import { getBrandColor } from '../lib/constants'

export default function BrandBadge({ brand, size = 'sm' }) {
  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  }

  return (
    <span className={`inline-block ${getBrandColor(brand)} text-white font-semibold uppercase tracking-wider rounded-full ${sizeClasses[size]}`}>
      {brand}
    </span>
  )
}
