import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import css from '../styles/components/Toast.module.css'

type Variant = 'error' | 'success'
interface ToastItem {
  id: number
  message: string
  variant: Variant
}

interface ToastApi {
  /* A field is missing/invalid — tells the visitor exactly what to fix. */
  error: (message: string) => void
  success: (message: string) => void
}

const ToastContext = createContext<ToastApi>({ error: () => {}, success: () => {} })

export function useToast(): ToastApi {
  return useContext(ToastContext)
}

const DISMISS_MS = 4500

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)
  const reduce = useReducedMotion()

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (message: string, variant: Variant) => {
      const id = nextId.current++
      setToasts((t) => [...t, { id, message, variant }])
      setTimeout(() => dismiss(id), DISMISS_MS)
    },
    [dismiss],
  )

  const api: ToastApi = {
    error: (m) => push(m, 'error'),
    success: (m) => push(m, 'success'),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={css.stack} aria-live="assertive" aria-atomic="true">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={`${css.toast} ${t.variant === 'error' ? css.toastError : css.toastSuccess}`}
              role="alert"
            >
              {t.variant === 'error' ? (
                <AlertTriangle size={18} aria-hidden />
              ) : (
                <CheckCircle2 size={18} aria-hidden />
              )}
              <span>{t.message}</span>
              <button type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
                <X size={15} aria-hidden />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
