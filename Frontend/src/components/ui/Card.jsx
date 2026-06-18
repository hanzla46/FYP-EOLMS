import { cn } from '../../lib/utils'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#16201A] border border-slate2-400/20 dark:border-slate2-600/20 rounded-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('px-5 py-4 border-b border-slate2-400/20 dark:border-slate2-600/20', className)}>
      {children}
    </div>
  )
}

export function CardContent({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>
}
