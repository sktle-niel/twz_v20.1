import {
  Armchair,
  Cable,
  Cog,
  Cpu,
  Crosshair,
  Disc3,
  Droplets,
  Eye,
  FlaskConical,
  Gauge,
  Lightbulb,
  Magnet,
  MoveVertical,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

export interface Service {
  name: string
  icon: LucideIcon
}

export interface ServiceCategory {
  id: string
  label: string
  blurb: string
  services: Service[]
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'engine',
    label: 'Engine',
    blurb: 'Fuel-injection care and engine electronics.',
    services: [
      { name: 'FI Cleaning', icon: Droplets },
      { name: 'FI Diagnosing Tools', icon: Gauge },
      { name: 'Injector Testing', icon: FlaskConical },
      { name: 'Stock ECU Remapping (Honda & Yamaha)', icon: Cpu },
    ],
  },
  {
    id: 'electrical',
    label: 'Electrical & Lighting',
    blurb: 'Lights, horns, and clean wiring work.',
    services: [
      { name: 'Headlight Upgrade & Setup', icon: Lightbulb },
      { name: 'Mini Driving Lights', icon: Sparkles },
      { name: 'Loud Horn Upgrade', icon: Volume2 },
      { name: 'Wiring', icon: Cable },
    ],
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    blurb: 'Keep your ride safe and reliable.',
    services: [
      { name: 'Preventive Maintenance', icon: ShieldCheck },
      { name: 'Vulcanizing', icon: Disc3 },
      { name: 'Magneto Cleaning', icon: Magnet },
      { name: 'Overhauling', icon: Wrench },
    ],
  },
  {
    id: 'performance',
    label: 'Performance',
    blurb: 'CVT work and suspension tuning.',
    services: [
      { name: 'CVT Upgrade', icon: Cog },
      { name: 'CVT Cleaning', icon: Droplets },
      { name: 'CVT Tuning', icon: SlidersHorizontal },
      { name: 'Front Shock Repack', icon: MoveVertical },
    ],
  },
  {
    id: 'customization',
    label: 'Customization',
    blurb: 'Details that make the bike yours.',
    services: [
      { name: 'Rim Alignment', icon: Crosshair },
      { name: 'Eye Line', icon: Eye },
      { name: 'Upholstery Upgrade', icon: Armchair },
    ],
  },
]

/* A short list for the home-page preview grid. */
export const FEATURED_SERVICES: Service[] = [
  { name: 'Preventive Maintenance', icon: ShieldCheck },
  { name: 'FI Cleaning', icon: Droplets },
  { name: 'CVT Upgrade', icon: Cog },
  { name: 'ECU Remapping', icon: Cpu },
  { name: 'Headlight Upgrade', icon: Lightbulb },
  { name: 'Vulcanizing', icon: Disc3 },
  { name: 'Overhauling', icon: Wrench },
  { name: 'Rim Alignment', icon: Crosshair },
]
