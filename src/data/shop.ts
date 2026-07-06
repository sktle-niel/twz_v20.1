import shopee from '../assets/shop/shopee.png'
import lazada from '../assets/shop/lazada.png'

export interface ShopLink {
  name: string
  url: string
  image: string
  blurb: string
}

/* TODO: point these at the store's actual Shopee/Lazada profile URLs. */
export const SHOP_LINKS: ShopLink[] = [
  {
    name: 'Shopee',
    url: 'https://shopee.ph',
    image: shopee,
    blurb: 'Parts and accessories, shipped nationwide.',
  },
  {
    name: 'Lazada',
    url: 'https://www.lazada.com.ph',
    image: lazada,
    blurb: 'Genuine parts with buyer protection.',
  },
]
