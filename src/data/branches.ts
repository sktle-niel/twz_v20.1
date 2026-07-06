import { SITE } from './site'

export interface Branch {
  id: string
  name: string
  address: string
  hours: string
  services: string
  facebook: string
  mapsUrl: string
}

/* Embed for the main branch (same map the old contact page used — no API key needed). */
export const MAIN_MAP_EMBED =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3932.219523849814!2d118.743392!3d9.7474639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33b563eb61d65407%3A0xeb029b393a73ae04!2sTwo%20Wheels%20Zone!5e0!3m2!1sen!2sph!4v1766419038506!5m2!1sen!2sph'

/* NOTE: static data for now — the old site loaded branches from the database.
   Replace with an API call once the backend is wired up. */
export const BRANCHES: Branch[] = [
  {
    id: 'puerto-princesa',
    name: 'Puerto Princesa Main Branch',
    address: SITE.address,
    hours: SITE.hours,
    services: 'Full service, parts & accessories',
    facebook: SITE.facebook,
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Two+Wheels+Zone+Puerto+Princesa',
  },
  {
    id: 'taytay',
    name: 'Taytay Branch',
    address: 'Taytay, Palawan',
    hours: SITE.hours,
    services: 'Parts, accessories & service',
    facebook: SITE.facebook,
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Two+Wheels+Zone+Taytay+Palawan',
  },
]
