import { z } from 'zod'

// Shared taxonomy used by both services and portfolio work — a nail studio's services
// and the photos showcasing them naturally fall into the same categories.
export const serviceCategorySchema = z.enum(['MANICURE', 'PEDICURE', 'EXTENSION', 'NAIL_ART'])
export type ServiceCategory = z.infer<typeof serviceCategorySchema>
