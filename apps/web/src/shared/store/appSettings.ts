import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings, BookingSettings, MasterProfile, StudioSettings } from '@eksaal/shared'

interface AppSettingsState {
  settings: AppSettings
  updateMasterProfile: (profile: MasterProfile) => void
  updateBookingSettings: (settings: BookingSettings) => void
  updateStudioSettings: (settings: StudioSettings) => void
}

const DEFAULT_SETTINGS: AppSettings = {
  masterProfile: {
    name: 'Мастер EKSAAL NAIL',
    photoUrl: null,
    description: '',
    telegramUsername: '',
    phone: '',
  },
  bookingSettings: {
    autoConfirm: false,
    reminderDayBeforeEnabled: true,
    minLeadTimeHours: 2,
  },
  studioSettings: {
    name: 'EKSAAL NAIL',
    photoUrl: null,
    description: '',
  },
}

// Persisted to localStorage (key: eksaal-app-settings) — mock stand-in for a real
// Settings/Studio DB table until the backend exists.
export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      updateMasterProfile: (masterProfile) =>
        set((state) => ({ settings: { ...state.settings, masterProfile } })),

      updateBookingSettings: (bookingSettings) =>
        set((state) => ({ settings: { ...state.settings, bookingSettings } })),

      updateStudioSettings: (studioSettings) =>
        set((state) => ({ settings: { ...state.settings, studioSettings } })),
    }),
    { name: 'eksaal-app-settings' },
  ),
)
