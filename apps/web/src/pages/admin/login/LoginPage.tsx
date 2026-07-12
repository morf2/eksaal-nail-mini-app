import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAdminAuthStore } from '../../../shared/store/adminAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginAdmin = useAdminAuthStore((state) => state.loginAdmin)

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setSubmitting] = useState(false)

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/admin'

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const result = await loginAdmin(login.trim(), password)
      if (!result.success) {
        setError(result.error ?? 'Неверный логин или пароль')
        return
      }
      navigate(redirectTo, { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xs"
      >
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/40">
            <Lock size={18} strokeWidth={1.5} className="text-accent" />
          </div>
          <p className="font-heading text-xl text-heading">EKSAAL NAIL</p>
          <p className="font-body text-xs uppercase tracking-[0.15em] text-text/40">
            Вход для мастера
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <p className="mb-2 font-body text-xs text-text/50">Логин</p>
            <input
              type="text"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              autoComplete="username"
              className="w-full rounded-2xl border border-white/10 bg-surface px-4 py-3 font-body text-sm text-text focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <p className="mb-2 font-body text-xs text-text/50">Пароль</p>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="w-full rounded-2xl border border-white/10 bg-surface px-4 py-3 font-body text-sm text-text focus:border-accent focus:outline-none"
            />
          </div>

          {error && <p className="font-body text-xs text-red-400/80">{error}</p>}

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.97 }}
            className="mt-3 w-full rounded-full bg-accent px-8 py-3.5 font-body text-sm font-medium uppercase tracking-[0.15em] text-background shadow-[0_8px_24px_-8px_rgba(217,143,167,0.45)] disabled:opacity-60"
          >
            {isSubmitting ? 'Проверяем…' : 'Войти'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
