import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './Button'

export function Dialog({ open, onClose, title, description, children, className }) {
  const overlayRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement
    contentRef.current?.focus()
    return () => prev?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const focusable = contentRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/30 dark:bg-black/50"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={cn(
          'bg-white dark:bg-[#16201A] rounded-lg w-full max-w-md shadow-lg border border-slate2-400/20 dark:border-slate2-600/20 flex flex-col max-h-[85vh]',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate2-400/20 dark:border-slate2-600/20 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">{title}</h2>
            {description && <p className="text-xs text-slate2-400 mt-0.5">{description}</p>}
          </div>
          <button onClick={onClose} className="text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', variant = 'destructive' }) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="text-sm text-slate2-400 dark:text-slate2-600 mb-4">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant={variant} size="sm" onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Button>
      </div>
    </Dialog>
  )
}
