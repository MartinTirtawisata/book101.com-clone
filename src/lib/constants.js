export const BRANDS = [
  { name: 'THE HAVEN', tagline: 'Upscale Leisure', color: 'bg-haven', textColor: 'text-white' },
  { name: 'THE 1O1', tagline: 'Upscale Premium', color: 'bg-the101', textColor: 'text-white' },
  { name: '1O1 STYLE', tagline: 'Midscale Premium', color: 'bg-style101', textColor: 'text-white' },
  { name: '1O1 URBAN', tagline: 'Midscale Select', color: 'bg-urban101', textColor: 'text-white' },
  { name: 'FRii', tagline: 'Midscale Boutique', color: 'bg-frii', textColor: 'text-white' },
]

export const CITIES = [
  'Bali', 'Jakarta', 'Yogyakarta', 'Bandung', 'Malang', 'Bogor', 'Lombok', 'Palembang',
]

export const TAX_RATE = 0.11

export function formatIDR(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getBrandColor(brand) {
  const map = {
    'THE HAVEN': 'bg-haven',
    'THE 1O1': 'bg-the101',
    '1O1 STYLE': 'bg-style101',
    '1O1 URBAN': 'bg-urban101',
    'FRii': 'bg-frii',
  }
  return map[brand] || 'bg-charcoal-700'
}

export function getBrandTextColor(brand) {
  return 'text-white'
}
