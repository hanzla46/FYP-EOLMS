import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

export function Drawer({ open, onClose, title, children, side = 'right', className }) {
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

  const isRight = side === 'right'

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink-900/20 dark:bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={contentRef}
            tabIndex={-1}
            className={cn(
              'fixed z-50 top-0 bottom-0 w-full sm:w-[480px] bg-white dark:bg-[#16201A] shadow-lg border-l border-slate2-400/20 dark:border-slate2-600/20 flex flex-col',
              isRight ? 'right-0' : 'left-0',
              className
            )}
            initial={{ x: isRight ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRight ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate2-400/20 dark:border-slate2-600/20 flex-shrink-0">
              <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">{title}</h2>
              <button onClick={onClose} className="text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
