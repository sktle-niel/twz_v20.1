import { usePageTitle } from '../hooks/usePageTitle'
import type { LegalSection } from '../data/legal'
import css from '../styles/components/LegalPage.module.css'

interface LegalPageProps {
  title: string
  intro: string
  sections: LegalSection[]
}

export default function LegalPage({ title, intro, sections }: LegalPageProps) {
  usePageTitle(title)

  return (
    <>
      <header className={css.header}>
        <div className="container">
          <h1>{title}</h1>
        </div>
      </header>
      <section className={`section ${css.body}`}>
        <div className={`container ${css.prose}`}>
          <p className={css.intro}>{intro}</p>
          {sections.map(({ heading, paragraphs }) => (
            <section key={heading}>
              <h2>{heading}</h2>
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </section>
    </>
  )
}
