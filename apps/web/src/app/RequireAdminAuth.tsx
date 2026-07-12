import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuthStore } from '../shared/store/adminAuth'

// Guards every /admin/* route except /admin/login itself. Client-side only for now —
// once a real backend exists, admin API calls must also independently verify the
// session server-side; this guard alone is UX, not a security boundary.
export default function RequireAdminAuth() {
  const status = useAdminAuthStore((state) => state.status)
  const location = useLocation()

  // Verifying the session token's signature is async — render nothing for that
  // brief moment rather than redirecting to /admin/login before we actually know.
  if (status === 'checking') {
    return null
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
