import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#111111',
        surface: '#1A1A1A',
        heading: '#F3D9DC',
        text: '#FAF4F2',
        secondary: '#A8A0A3',
        accent: '#D98FA7',
      },
      fontFamily: {
        heading: ['"Bodoni Moda"', 'serif'],
        body: ['Jost', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
