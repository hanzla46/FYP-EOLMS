import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

export function Tooltip({ content, children, className }) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const show = () => {
      const rect = el.getBoundingClientRect()
      setPosition({ x: rect.left + rect.width / 2, y: rect.top - 8 })
      setVisible(true)
    }
    const hide = () => setVisible(false)
    el.addEventListener('mouseenter', show)
    el.addEventListener('mouseleave', hide)
    el.addEventListener('focus', show)
    el.addEventListener('blur', hide)
    return () => {
      el.removeEventListener('mouseenter', show)
      el.removeEventListener('mouseleave', hide)
      el.removeEventListener('focus', show)
      el.removeEventListener('blur', hide)
    }
  }, [])

  return (
    <span ref={ref} className={cn('inline-flex', className)}>
      {children}
      {visible && (
        <div
          className="fixed z-50 px-2 py-1 text-xs bg-ink-900 dark:bg-ink-100 text-ink-100 dark:text-ink-900 rounded-sm shadow pointer-events-none whitespace-nowrap"
          style={{ left: position.x, top: position.y, transform: 'translate(-50%, -100%)' }}
        >
          {content}
        </div>
      )}
    </span>
  )
}
