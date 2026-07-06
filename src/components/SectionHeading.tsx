interface SectionHeadingProps {
  kicker?: string
  title: string
  lede?: string
  center?: boolean
  onDark?: boolean
}

export default function SectionHeading({
  kicker,
  title,
  lede,
  center,
  onDark,
}: SectionHeadingProps) {
  return (
    <div
      style={center ? { textAlign: 'center' } : undefined}
      data-on-dark={onDark || undefined}
    >
      {kicker && <p className="kicker">{kicker}</p>}
      <h2 className="section-title">{title}</h2>
      {lede && (
        <p className="section-lede" style={center ? { marginInline: 'auto' } : undefined}>
          {lede}
        </p>
      )}
    </div>
  )
}
