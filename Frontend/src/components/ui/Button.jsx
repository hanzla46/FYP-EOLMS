import { cva } from 'class-variance-authority'
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pasture-500 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-pasture-600 text-white hover:bg-pasture-500 dark:bg-pasture-400 dark:text-ink-900 dark:hover:bg-pasture-500',
        secondary: 'bg-wheat-500 text-white hover:bg-wheat-400 dark:bg-wheat-400 dark:text-ink-900 dark:hover:bg-wheat-500',
        ghost: 'text-ink-900 hover:bg-mist-50 dark:text-ink-100 dark:hover:bg-mist-900',
        destructive: 'bg-clay-600 text-white hover:bg-clay-400 dark:bg-clay-400 dark:text-ink-900 dark:hover:bg-clay-600',
        outline: 'border border-slate2-400 text-ink-900 hover:bg-mist-50 dark:text-ink-100 dark:border-slate2-600 dark:hover:bg-mist-900',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-sm',
        md: 'h-10 px-4 text-sm rounded-md',
        lg: 'h-12 px-6 text-base rounded-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

const Button = forwardRef(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
))
Button.displayName = 'Button'

export { Button, buttonVariants }
