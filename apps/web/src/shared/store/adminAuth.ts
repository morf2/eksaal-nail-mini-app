import { create } from 'zustand'
import { fetchSessionApi, loginApi, logoutApi } from '../api/authApi'

type AdminAuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

interface LoginResult {
  success: boolean
  error?: string
}

interface AdminAuthState {
  status: AdminAuthStatus
  loginAdmin: (login: string, password: string) => Promise<LoginResult>
  logout: () => void
}

// No credentials and no session token handled client-side at all anymore — the
// admin session lives entirely in an httpOnly cookie set by apps/api (see
// shared/api/authApi.ts), which this store can't read or forge even if it wanted
// to. `status` starts at 'checking' until GET /admin/session resolves, so
// RequireAdminAuth doesn't flash a redirect before it knows the real state.
export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  status: 'checking',

  loginAdmin: async (login, password) => {
    try {
      const result = await loginApi(login, password)
      set({ status: result.authenticated ? 'authenticated' : 'unauthenticated' })
      return { success: result.authenticated }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Не удалось войти' }
    }
  },

  logout: () => {
    set({ status: 'unauthenticated' })
    logoutApi().catch((error) => {
      console.warn('[adminAuth] logout request failed (session cookie may still be cleared client-side):', error)
    })
  },
}))

fetchSessionApi()
  .then((result) => {
    useAdminAuthStore.setState({ status: result.authenticated ? 'authenticated' : 'unauthenticated' })
  })
  .catch((error) => {
    console.warn('[adminAuth] could not reach API to check session, treating as logged out:', error)
    useAdminAuthStore.setState({ status: 'unauthenticated' })
  })
