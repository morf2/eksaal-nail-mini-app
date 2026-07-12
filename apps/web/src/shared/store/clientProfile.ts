import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ClientProfileState {
  // Overrides on top of Telegram's own name — null means "use the Telegram name".
  displayName: string | null
  // Subscriber digits (0-10 chars, same shape PhoneInput works with) — overrides the
  // phone from the client's most recent booking, if any.
  phone: string | null
  setDisplayName: (name: string) => void
  setPhone: (phone: string) => void
}

// Persisted to localStorage (key: eksaal-client-profile) — mock stand-in for a real
// User profile row until Telegram initData auth + a backend exist.
export const useClientProfileStore = create<ClientProfileState>()(
  persist(
    (set) => ({
      displayName: null,
      phone: null,
      setDisplayName: (displayName) => set({ displayName }),
      setPhone: (phone) => set({ phone }),
    }),
    { name: 'eksaal-client-profile' },
  ),
)
