import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Service, ServiceCategory } from '@eksaal/shared'
import { mockServices } from '../mocks/services'

export interface ServiceInput {
  name: string
  category: ServiceCategory
  description?: string
  durationMinutes: number
  price: number
  isPriceFrom: boolean
}

interface ServicesState {
  services: Service[]
  // Simulates the future POST /admin/services.
  addService: (input: ServiceInput) => void
  // Simulates the future PATCH /admin/services/:id.
  updateService: (id: string, input: ServiceInput) => void
  toggleHidden: (id: string) => void
  // Simulates the future DELETE /admin/services/:id.
  deleteService: (id: string) => void
}

function createMockServiceId(): string {
  return `service-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function buildPriceLabel(price: number, isPriceFrom: boolean): string {
  return isPriceFrom ? `от ${price} ₽` : `${price} ₽`
}

// Persisted to localStorage (key: eksaal-admin-services) — the mock stand-in for a real
// Service DB table until the backend exists. Read by both the client booking flow
// (ServiceSelector) and the homepage (PopularServices), so admin edits show up
// immediately everywhere without a page reload.
export const useServicesStore = create<ServicesState>()(
  persist(
    (set) => ({
      services: mockServices,

      addService: (input) =>
        set((state) => ({
          services: [
            {
              id: createMockServiceId(),
              name: input.name,
              category: input.category,
              description: input.description,
              durationMinutes: input.durationMinutes,
              price: input.price,
              priceLabel: buildPriceLabel(input.price, input.isPriceFrom),
              isPriceFrom: input.isPriceFrom,
              isActive: true,
            },
            ...state.services,
          ],
        })),

      updateService: (id, input) =>
        set((state) => ({
          services: state.services.map((service) =>
            service.id === id
              ? {
                  ...service,
                  name: input.name,
                  category: input.category,
                  description: input.description,
                  durationMinutes: input.durationMinutes,
                  price: input.price,
                  priceLabel: buildPriceLabel(input.price, input.isPriceFrom),
                  isPriceFrom: input.isPriceFrom,
                }
              : service,
          ),
        })),

      toggleHidden: (id) =>
        set((state) => ({
          services: state.services.map((service) =>
            service.id === id ? { ...service, isActive: !service.isActive } : service,
          ),
        })),

      deleteService: (id) =>
        set((state) => ({ services: state.services.filter((service) => service.id !== id) })),
    }),
    { name: 'eksaal-admin-services' },
  ),
)
