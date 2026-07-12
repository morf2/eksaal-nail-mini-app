import type { PortfolioItem } from '@eksaal/shared'

// Temporary seed data standing in for the future GET /portfolio response —
// replace with a real API call once the backend exists.
export const mockPortfolioItems: PortfolioItem[] = [
  {
    id: 'nail-1',
    imageUrl: '/portfolio/nail-1.jpg',
    title: 'Классический нюд',
    category: 'MANICURE',
    description: 'Аккуратный нюдовый маникюр с глянцевым покрытием.',
    isHidden: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'nail-2',
    imageUrl: '/portfolio/nail-2.jpg',
    title: 'Миндальная форма, пыльно-розовый',
    category: 'MANICURE',
    description: 'Форма миндаль, покрытие в фирменном оттенке EKSAAL.',
    isHidden: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'nail-3',
    imageUrl: '/portfolio/nail-3.jpg',
    title: 'Наращивание, квадрат',
    category: 'EXTENSION',
    description: 'Наращивание гелем, квадратная форма средней длины.',
    isHidden: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'nail-4',
    imageUrl: '/portfolio/nail-4.jpg',
    title: 'Минималистичный дизайн',
    category: 'NAIL_ART',
    description: 'Тонкие линии и акцент на одном пальце.',
    isHidden: false,
    createdAt: new Date().toISOString(),
  },
]
