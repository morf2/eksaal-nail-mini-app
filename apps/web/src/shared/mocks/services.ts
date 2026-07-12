import type { Service } from '@eksaal/shared'

// Temporary default seed — used to initialize useServicesStore on first run. From then
// on the admin-managed store (localStorage) is the source of truth, not this file.
export const mockServices: Service[] = [
  {
    id: 'manicure-no-coating',
    name: 'Маникюр без покрытия',
    category: 'MANICURE',
    description: 'Обработка кутикулы и формы ногтя без покрытия.',
    durationMinutes: 40,
    price: 500,
    priceLabel: '500 ₽',
    isPriceFrom: false,
    isActive: true,
  },
  {
    id: 'manicure-with-coating',
    name: 'Маникюр с покрытием',
    category: 'MANICURE',
    description: 'Маникюр + покрытие гель-лаком.',
    durationMinutes: 70,
    price: 1700,
    priceLabel: '1700 ₽',
    isPriceFrom: false,
    isActive: true,
  },
  {
    id: 'extension',
    name: 'Наращивание',
    category: 'EXTENSION',
    description: 'Наращивание гелем, форма и длина по желанию.',
    durationMinutes: 120,
    price: 1800,
    priceLabel: 'от 1800 ₽',
    isPriceFrom: true,
    isActive: true,
  },
]
