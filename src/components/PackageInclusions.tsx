import { CheckCircle2 } from 'lucide-react'
import {
  formatPeso,
  PACKAGE_EQUIPMENT,
  PACKAGE_PARTS_VALUE,
  PACKAGE_SUPPORT,
  PACKAGE_TAGS,
} from '../data/franchise'
import css from '../styles/components/PackageInclusions.module.css'

/* The complete franchise package, as printed on the flyer: equipment,
   starting inventory value, business support, and the pitch tags. A plain
   light "spec card" by design, so it reads the same whether it sits on a
   light section or as a highlight callout inside a dark one. */
export default function PackageInclusions() {
  return (
    <div className={`card ${css.card}`}>
      <p className="kicker">Complete Package · Ready to Operate</p>

      <div className={css.lists}>
        <div>
          <h3>{PACKAGE_EQUIPMENT.title}</h3>
          <ul>
            {PACKAGE_EQUIPMENT.items.map((item) => (
              <li key={item}>
                <CheckCircle2 size={18} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>{PACKAGE_SUPPORT.title}</h3>
          <ul>
            {PACKAGE_SUPPORT.items.map((item) => (
              <li key={item}>
                <CheckCircle2 size={18} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className={css.value}>
        <strong>{formatPeso(PACKAGE_PARTS_VALUE)}</strong>
        Worth of Parts &amp; Accessories Included
      </p>

      <ul className={css.tags}>
        {PACKAGE_TAGS.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </div>
  )
}
