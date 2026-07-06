export const SITE = {
  name: 'Two Wheels Zone',
  tagline: 'Alagang Casa Para sa mga Motorista',
  description:
    'Your trusted partner for premium motorcycle parts, expert maintenance, and comprehensive services. CASA-quality craftsmanship at affordable prices.',
  phone: '0936 951 0201',
  phoneHref: 'tel:+639369510201',
  address: '329 Malvar Road, Puerto Princesa City, 5300 Palawan',
  hours: 'Monday to Sunday · 7:00 AM - 9:00 PM',
  facebook: 'https://web.facebook.com/TwoWheelsZone',
  since: 2021,
} as const

export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/services', label: 'Services' },
  { to: '/casa-quality', label: 'Casa Quality' },
  { to: '/branches', label: 'Branches' },
  { to: '/franchise', label: 'Franchise' },
] as const

/* Brands carried/serviced — shown as a text strip in the footer
   (the old site hotlinked logo images from third-party sites). */
export const PARTNERS = [
  'Honda',
  'Yamaha',
  'Suzuki',
  'Kawasaki',
  'Shell',
  'Caltex',
  'Motul',
  'Racing Boy',
  'Yoshimura',
  'X-Speed',
  'BOMX',
] as const
