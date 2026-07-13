/* Franchise qualification rules and shared options. */

/* Applications below this amount cannot proceed (the package price itself). */
export const MIN_FRANCHISE_INVESTMENT = 1_300_000

/* The standard franchise package amount offered as a one-click preset. */
export const SUGGESTED_INVESTMENT = 1_300_000

/* ₱1,300,000.00 */
export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/* "₱1.3 million" / "₱850 thousand" — used to make the magnitude unmistakable. */
export function humanizePeso(amount: number): string {
  if (amount >= 1_000_000) {
    return `₱${Number((amount / 1_000_000).toFixed(2))} million`
  }
  if (amount >= 1_000) {
    return `₱${Number((amount / 1_000).toFixed(1))} thousand`
  }
  return formatPeso(amount)
}

/* Complete franchise package — what's physically included on top of the
   investment itself (equipment + starting inventory + business support). */
export interface PackageList {
  title: string
  items: string[]
}

export const PACKAGE_EQUIPMENT: PackageList = {
  title: 'Equipment Included',
  items: [
    'Tire Changer Machine',
    'Air Compressor',
    'Motorcycle Lifter',
    'CCTV System',
    'POS System (Loyverse)',
  ],
}

export const PACKAGE_SUPPORT: PackageList = {
  title: 'Full Business Support',
  items: ['Setup Assistance', 'Staff Training', 'Marketing Support', 'Proven System'],
}

/* Parts & accessories starting stock, bundled into the package. */
export const PACKAGE_PARTS_VALUE = 600_000

export const PACKAGE_TAGS = ['High Demand', 'Fast ROI', 'Profitable Business']

export interface IncomeSource {
  value: string
  label: string
  description: string
}

export const INCOME_SOURCES: IncomeSource[] = [
  {
    value: 'business-owner',
    label: 'Business Owner',
    description: 'You run or co-own an existing business.',
  },
  {
    value: 'employed-professional',
    label: 'Employed / Professional',
    description: 'Salary or income from professional practice.',
  },
  {
    value: 'ofw',
    label: 'OFW / Overseas Income',
    description: 'Work abroad or remittance-backed funding.',
  },
  {
    value: 'other',
    label: 'Other',
    description: "We'll ask you to tell us a bit more.",
  },
]
