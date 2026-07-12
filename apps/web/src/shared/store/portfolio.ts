import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PortfolioItem } from '@eksaal/shared'
import { mockPortfolioItems } from '../mocks/portfolio'

interface NewPortfolioItemInput {
  imageUrl: string
  title: string
  category: PortfolioItem['category']
  description?: string
}

interface PortfolioState {
  items: PortfolioItem[]
  // Simulates the future POST /admin/portfolio.
  addItem: (input: NewPortfolioItemInput) => void
  // Simulates the future PATCH /admin/portfolio/:id (used for both hide/show and edits).
  updateItem: (id: string, patch: Partial<NewPortfolioItemInput>) => void
  toggleHidden: (id: string) => void
  // Simulates the future DELETE /admin/portfolio/:id.
  deleteItem: (id: string) => void
}

function createMockPortfolioId(): string {
  return `portfolio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Persisted to localStorage (key: eksaal-admin-portfolio) — the mock stand-in for a
// real database + S3-hosted images until the backend exists (see project plan).
export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      items: mockPortfolioItems,

      addItem: (input) =>
        set((state) => ({
          items: [
            {
              id: createMockPortfolioId(),
              imageUrl: input.imageUrl,
              title: input.title,
              category: input.category,
              description: input.description,
              isHidden: false,
              createdAt: new Date().toISOString(),
            },
            ...state.items,
          ],
        })),

      updateItem: (id, patch) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),

      toggleHidden: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, isHidden: !item.isHidden } : item,
          ),
        })),

      deleteItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
    }),
    { name: 'eksaal-admin-portfolio' },
  ),
)
