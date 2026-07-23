import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PortfolioItem } from '@eksaal/shared'
import { mockPortfolioItems } from '../mocks/portfolio'
import {
  createPortfolioItemApi,
  deletePortfolioItemApi,
  fetchPortfolioFromApi,
  updatePortfolioItemApi,
} from '../api/portfolioApi'
import type { UpdatePortfolioItemPayload } from '../api/portfolioApi'

interface NewPortfolioItemInput {
  imageBase64: string
  title: string
  category: PortfolioItem['category']
  description?: string
}

interface PortfolioState {
  items: PortfolioItem[]
  // Writes to POST /portfolio in the background — see comment on the implementation below.
  addItem: (input: NewPortfolioItemInput) => void
  // Writes to PATCH /portfolio/:id in the background (edits and hide/show both use this).
  updateItem: (id: string, patch: UpdatePortfolioItemPayload) => void
  toggleHidden: (id: string) => void
  // Writes to DELETE /portfolio/:id in the background.
  deleteItem: (id: string) => void
}

function createLocalPortfolioId(): string {
  return `portfolio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Persisted to localStorage (key: eksaal-admin-portfolio) as an offline cache / fallback —
// same pattern as useAdminBookingsStore in adminBookings.ts. The source of truth is
// apps/api's /portfolio API (Postgres + S3-backed) — on module load this store immediately
// tries to hydrate `items` from GET /portfolio, overwriting the localStorage-restored value
// with the server's copy. If the API is unreachable, that hydration silently fails and
// whatever persist() already restored keeps serving the app.
export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      items: mockPortfolioItems,

      // Optimistic local insert first (instant UI feedback), then persist to the API in
      // the background and reconcile the client-generated id with the server-assigned
      // one once it responds. If the API is unreachable, the local copy is simply left
      // as-is — that's the fallback.
      addItem: (input) => {
        const localId = createLocalPortfolioId()
        const optimisticItem: PortfolioItem = {
          id: localId,
          imageUrl: input.imageBase64,
          title: input.title,
          category: input.category,
          description: input.description,
          isHidden: false,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ items: [optimisticItem, ...state.items] }))

        createPortfolioItemApi(input)
          .then((serverItem) => {
            set((state) => ({
              items: state.items.map((item) => (item.id === localId ? serverItem : item)),
            }))
          })
          .catch((error) => {
            console.warn(
              '[portfolio] API unavailable, keeping local-only item (localStorage fallback):',
              error,
            )
          })
      },

      updateItem: (id, patch) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...patch, imageUrl: patch.imageBase64 ?? item.imageUrl }
              : item,
          ),
        }))

        updatePortfolioItemApi(id, patch)
          .then((serverItem) => {
            set((state) => ({
              items: state.items.map((item) => (item.id === id ? serverItem : item)),
            }))
          })
          .catch((error) => {
            console.warn(
              '[portfolio] API unavailable, keeping local-only update (localStorage fallback):',
              error,
            )
          })
      },

      toggleHidden: (id) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, isHidden: !item.isHidden } : item,
          ),
        }))

        const item = get().items.find((entry) => entry.id === id)
        if (!item) return

        updatePortfolioItemApi(id, { isHidden: item.isHidden })
          .then((serverItem) => {
            set((state) => ({
              items: state.items.map((entry) => (entry.id === id ? serverItem : entry)),
            }))
          })
          .catch((error) => {
            console.warn(
              '[portfolio] API unavailable, keeping local-only visibility change (localStorage fallback):',
              error,
            )
          })
      },

      deleteItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
        deletePortfolioItemApi(id).catch((error) => {
          console.warn(
            '[portfolio] API unavailable, item removed locally only (localStorage fallback):',
            error,
          )
        })
      },
    }),
    { name: 'eksaal-admin-portfolio' },
  ),
)

// Fire-and-forget hydration from the API — replaces the localStorage/mock seed
// with the server's list, same pattern as adminBookings.ts.
function refetchPortfolio(): void {
  fetchPortfolioFromApi()
    .then((items) => usePortfolioStore.setState({ items }))
    .catch((error) => {
      console.warn('[portfolio] API unavailable, keeping cached portfolio (fallback):', error)
    })
}

refetchPortfolio()

// Same reasoning as the polling block in adminBookings.ts: this store is shared
// by the admin panel, the Web gallery, and the Telegram Mini App as separate
// sessions, so a new/edited/deleted item added in one only reaches the others via
// re-fetching.
const PORTFOLIO_POLL_INTERVAL_MS = 5000
if (typeof window !== 'undefined') {
  setInterval(refetchPortfolio, PORTFOLIO_POLL_INTERVAL_MS)
  window.addEventListener('focus', refetchPortfolio)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refetchPortfolio()
  })
}
