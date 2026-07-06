import { useEffect } from 'react'

const BASE_TITLE = 'Two Wheels Zone | Motorcycle Service, Parts & Accessories'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Two Wheels Zone` : BASE_TITLE
  }, [title])
}
