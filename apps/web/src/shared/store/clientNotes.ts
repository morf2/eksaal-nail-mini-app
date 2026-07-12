import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ClientNotesState {
  // Keyed by telegramId — the only stable client identifier we have without real auth.
  notes: Record<string, string>
  setNote: (telegramId: string, note: string) => void
}

// Persisted to localStorage (key: eksaal-client-notes) — mock stand-in for a real
// per-client notes field on the User table until the backend exists.
export const useClientNotesStore = create<ClientNotesState>()(
  persist(
    (set) => ({
      notes: {},
      setNote: (telegramId, note) =>
        set((state) => ({ notes: { ...state.notes, [telegramId]: note } })),
    }),
    { name: 'eksaal-client-notes' },
  ),
)
