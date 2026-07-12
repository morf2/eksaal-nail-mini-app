// Direct hex values applied via inline `style` (not Tailwind color classes) for the
// portfolio/gallery text elements — bypasses Tailwind's CSS-variable-based color
// pipeline entirely, so there is no indirection left that could fail to render.
export const TEXT_COLORS = {
  primary: '#FAF4F2',
  secondary: '#A8A0A3',
  accent: '#D98FA7',
} as const
