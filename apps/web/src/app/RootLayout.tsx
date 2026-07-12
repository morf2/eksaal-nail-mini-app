import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import RouteErrorBoundary from './RouteErrorBoundary'

export default function RootLayout() {
  const location = useLocation()

  // Client-side navigation keeps the previous page's scroll offset by default —
  // most noticeable coming from the scrollable Gallery grid, landing mid-page on
  // whatever route comes next instead of at its top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-dvh bg-background pb-24">
      <AnimatePresence mode="popLayout">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <RouteErrorBoundary>
            <Outlet />
          </RouteErrorBoundary>
        </motion.main>
      </AnimatePresence>
      <BottomNav />
    </div>
  )
}
