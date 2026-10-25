import type { ReactNode } from 'react'

const paths: Record<string, ReactNode> = {
  bowl: (
    <>
      <path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0Z" />
      <path d="M8.5 7.5c0-1 1-1.4 1-2.5" />
      <path d="M12.5 7.5c0-1 1-1.4 1-2.5" />
    </>
  ),
  store: (
    <>
      <path d="M3.5 9.5 5 4h14l1.5 5.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M9 20v-5.5h6V20" />
      <path d="M3.5 9.5a2.8 2.8 0 0 0 5.6 0 2.8 2.8 0 0 0 5.6 0 2.8 2.8 0 0 0 5.8 0" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v4.5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5.5H5V7a3 3 0 0 0 3 3" />
      <path d="M16 5.5h3V7a3 3 0 0 1-3 3" />
      <path d="M12 12.5V16" />
      <path d="M9 20h6M10 16h4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c.6-3.6 3.6-5.8 7.5-5.8s6.9 2.2 7.5 5.8" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7.2 4.2 4.2 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z" />,
  shuffle: (
    <>
      <path d="M4 6h3c4.5 0 5.5 12 10 12h3" />
      <path d="M4 18h3c1.6 0 2.8-1.5 3.9-3.4" />
      <path d="M14.5 9.2C15.4 7.5 16.5 6 18 6h2" />
      <path d="m17 3 3 3-3 3M17 15l3 3-3 3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 1.8" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6-5.5 6-10a6 6 0 1 0-12 0c0 4.5 6 10 6 10Z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 3.5 19h17L12 4Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  arrowLeft: (
    <>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  chevronRight: <path d="m9 5 7 7-7 7" />,
  flame: (
    <>
      <path d="M12 3c1 3.5-2 4.2-2 7 0 1.4 1 2.4 2 2.4s2-1 2-2.4c0-1.2-.4-2-.4-2S16 9.5 16.5 12c.3 1.6-.2 5-4.5 5-3.8 0-5.6-2.6-5-5.5C7.6 8 12 6.5 12 3Z" />
      <path d="M12 21c-3 0-5.5-1.5-6-4" />
    </>
  ),
  share: (
    <>
      <path d="M12 15V4" />
      <path d="m8 8 4-4 4 4" />
      <path d="M5 14v5h14v-5" />
    </>
  ),
  sliders: (
    <>
      <path d="M5 8h9M18 8h1M5 16h3M12 16h7" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="10" cy="16" r="2" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5c.6 4.4 2.1 5.9 6.5 6.5-4.4.6-5.9 2.1-6.5 6.5-.6-4.4-2.1-5.9-6.5-6.5 4.4-.6 5.9-2.1 6.5-6.5Z" />
      <path d="M18.5 15.5c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z" />
    </>
  ),
  star: (
    <path
      d="m12 3.8 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8L12 3.8Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  eye: (
    <>
      <path d="M2.8 12S6.4 5.8 12 5.8 21.2 12 21.2 12 17.6 18.2 12 18.2 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
}

export function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 1.7,
}: {
  name: keyof typeof paths | string
  size?: number
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] ?? null}
    </svg>
  )
}

export function HeartIcon({ filled, size = 18 }: { filled?: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="heart-svg">
      <path
        d="M12 20.2s-7.8-4.6-7.8-10.3A4.4 4.4 0 0 1 12 6.8a4.4 4.4 0 0 1 7.8 3.1c0 5.7-7.8 10.3-7.8 10.3Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="stars" style={{ fontSize: size }} aria-label={`${value} 星`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={value >= n - 0.35 ? 'star on' : 'star'}>
          <Icon name="star" size={size} />
        </span>
      ))}
    </span>
  )
}
