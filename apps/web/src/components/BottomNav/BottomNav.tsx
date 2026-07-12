import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { CalendarPlus, Home, Image, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const items: NavItem[] = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/gallery', label: 'Работы', icon: Image },
  { to: '/booking', label: 'Запись', icon: CalendarPlus },
  { to: '/profile', label: 'Профиль', icon: User },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="mx-auto flex max-w-md items-center justify-between px-4">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="relative flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-3 text-[11px] transition-colors ${
                  isActive ? 'text-accent' : 'text-text/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute top-0 h-0.5 w-6 rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon size={20} strokeWidth={1.5} />
                  <span className="font-body">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
