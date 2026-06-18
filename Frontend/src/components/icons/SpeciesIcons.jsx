export function CattleIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12h3l2-4h2l2-2h2l2 2h2l2 4h3" />
      <path d="M8 12v2c0 2 1 3 4 3s4-1 4-3v-2" />
      <path d="M9 8l-2-3M15 8l2-3" />
      <path d="M6 12l-1 3M18 12l1 3" />
      <circle cx="8" cy="10" r="0.8" />
      <circle cx="16" cy="10" r="0.8" />
    </svg>
  )
}

export function SheepIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="12" cy="16" rx="10" ry="6" />
      <ellipse cx="12" cy="14" rx="6" ry="5" />
      <path d="M12 9c-3 0-6-3-6-5s3-1 6-1 6-1 6 1-3 5-6 5z" />
      <circle cx="9" cy="13" r="0.8" />
      <circle cx="15" cy="13" r="0.8" />
    </svg>
  )
}

export function GoatIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 8c-3 0-5 2-5 5s2 5 5 5 5-2 5-5-2-5-5-5z" />
      <path d="M12 8v-4l3-2M12 4l-3-2" />
      <path d="M12 8c-2 0-4-1-5-2M12 8c2 0 4-1 5-2" />
      <circle cx="10" cy="11" r="0.8" />
      <circle cx="14" cy="11" r="0.8" />
      <line x1="12" y1="13" x2="12" y2="14" />
    </svg>
  )
}

export function SpeciesIcon({ species, className }) {
  const Comp = species === 'Cattle' ? CattleIcon : species === 'Sheep' ? SheepIcon : species === 'Goat' ? GoatIcon : CattleIcon
  const color = species === 'Cattle' ? 'text-pasture-500' : species === 'Sheep' ? 'text-wheat-500' : 'text-slate2-400'
  return <Comp className={`w-5 h-5 ${color} ${className || ''}`} />
}
