/* Philippine motorcycle market — annual sales in million units.
   Figures carried over from the old site's franchise page. */
export interface MarketYear {
  year: number
  units: number
  projected?: boolean
}

export const MARKET_UNITS: MarketYear[] = [
  { year: 2021, units: 1.43 },
  { year: 2022, units: 1.56 },
  { year: 2023, units: 1.67 },
  { year: 2024, units: 1.79 },
  { year: 2025, units: 2.37 },
  { year: 2026, units: 2.4, projected: true },
]

