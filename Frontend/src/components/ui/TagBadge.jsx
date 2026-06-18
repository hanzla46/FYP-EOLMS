import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

const speciesTints = {
  Cattle: { bg: 'bg-pasture-100 dark:bg-pasture-600/20', dot: 'bg-pasture-500', text: 'text-pasture-600 dark:text-pasture-400' },
  Sheep: { bg: 'bg-wheat-100 dark:bg-wheat-500/20', dot: 'bg-wheat-500', text: 'text-wheat-500 dark:text-wheat-400' },
  Goat: { bg: 'bg-mist-50 dark:bg-mist-900', dot: 'bg-slate2-400', text: 'text-slate2-400 dark:text-slate2-600' },
  default: { bg: 'bg-mist-50 dark:bg-mist-900', dot: 'bg-slate2-400', text: 'text-slate2-400 dark:text-slate2-600' },
}

export function TagBadge({ tag, species, to, className }) {
  const tint = speciesTints[species] || speciesTints.default
  const content = (
    <span className={cn(
      'relative inline-flex items-center h-[26px] pl-2.5 pr-2.5 rounded-sm font-mono text-xs tracking-wider whitespace-nowrap',
      tint.bg, tint.text, 'shadow-sm',
      className
    )}>
      <span className={cn(
        'absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full',
        tint.dot
      )} />
      {tag}
    </span>
  )

  if (to) {
    return (
      <Link to={to} className="inline-flex ml-[3px] overflow-visible hover:brightness-90 dark:hover:brightness-110 transition">
        {content}
      </Link>
    )
  }
  return <span className="inline-flex ml-[3px] overflow-visible">{content}</span>
}
