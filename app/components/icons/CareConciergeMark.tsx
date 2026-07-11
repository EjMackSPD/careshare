type CareConciergeMarkProps = {
  size?: number
  className?: string
}

// A small brand mark for the AI Care Concierge: the CareShare heart, cradled
// by two cupped hands (echoing the main logo), with a sparkle cluster inside
// standing in for the "AI-powered" insight.
export default function CareConciergeMark({ size = 24, className }: CareConciergeMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Cupped hands */}
      <path
        d="M10.3 17.3Q6 19.6 3 17.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M13.7 17.3Q18 19.6 21 17.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Heart outline */}
      <path
        d="M12 16.3s-5.6-3.6-5.6-7.6c0-2.2 1.7-3.7 3.6-3.7 1 0 1.9.5 2 1.3.1-.8 1-1.3 2-1.3 1.9 0 3.6 1.5 3.6 3.7 0 4-5.6 7.6-5.6 7.6z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Sparkle cluster inside the heart */}
      <path
        d="M12.6 6.9l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z"
        fill="currentColor"
      />
      <path
        d="M9.9 9.6l.28.75.75.28-.75.28-.28.75-.28-.75-.75-.28.75-.28z"
        fill="currentColor"
      />
    </svg>
  )
}
