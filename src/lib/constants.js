export const BRANDS = [
  { name: 'THE HAVEN', tagline: 'Upscale Leisure' },
  { name: 'THE 1O1', tagline: 'Upscale Premium' },
  { name: '1O1 STYLE', tagline: 'Midscale Premium' },
  { name: '1O1 URBAN', tagline: 'Midscale Select' },
  { name: 'FRii', tagline: 'Midscale Boutique' },
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

export function getBrandBadgeStyle(brand) {
  const styles = {
    'THE HAVEN': { bg: 'bg-badge-haven-bg', text: 'text-badge-haven-text' },
    'THE 1O1': { bg: 'bg-badge-101-bg', text: 'text-badge-101-text' },
    '1O1 STYLE': { bg: 'bg-badge-style-bg', text: 'text-badge-style-text' },
    '1O1 URBAN': { bg: 'bg-badge-urban-bg', text: 'text-badge-urban-text' },
    'FRii': { bg: 'bg-badge-frii-bg', text: 'text-badge-frii-text' },
  }
  return styles[brand] || { bg: 'bg-grey-700', text: 'text-white' }
}
