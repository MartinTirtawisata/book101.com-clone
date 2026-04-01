import { getBrandBadgeStyle } from '../lib/constants'

export default function BrandBadge({ brand }) {
  const style = getBrandBadgeStyle(brand)

  return (
    <span className={`inline-block ${style.bg} ${style.text} text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-xl`}>
      {brand}
    </span>
  )
}
