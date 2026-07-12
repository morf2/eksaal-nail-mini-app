import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAdminAuthStore } from '../shared/store/adminAuth'

const NAV_ITEMS = [
  { to: '/admin', label: 'Заявки', end: true },
  { to: '/admin/portfolio', label: 'Портфолио' },
  { to: '/admin/services', label: 'Услуги' },
  { to: '/admin/schedule', label: 'Расписание' },
  { to: '/admin/settings', label: 'Настройки' },
]

// Shell for the protected /admin area (see RequireAdminAuth) — no bottom nav, that's
// a client-only concept. A small top bar carries admin navigation + logout instead.
export default function AdminLayout() {
  const navigate = useNavigate()
  const logout = useAdminAuthStore((state) => state.logout)

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-heading text-sm tracking-[0.15em] text-heading">EKSAAL · ADMIN</span>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/admin/login', { replace: true })
            }}
            className="flex items-center gap-1.5 font-body text-xs text-text/50"
          >
            <LogOut size={13} strokeWidth={1.5} />
            Выйти
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `shrink-0 rounded-full px-3 py-1.5 font-body text-xs transition-colors ${
                  isActive ? 'bg-accent text-background' : 'text-text/50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <Outlet />
    </div>
  )
}
