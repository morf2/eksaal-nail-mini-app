import { z } from 'zod'

// Canonical stored format is always E.164 for Russian numbers: +7XXXXXXXXXX (11 digits
// total after the +). The frontend masks/formats for display; this is the contract the
// future backend should validate against too.
export const RUSSIAN_PHONE_REGEX = /^\+7\d{10}$/

export const russianPhoneSchema = z
  .string()
  .regex(RUSSIAN_PHONE_REGEX, 'Введите корректный номер в формате +7XXXXXXXXXX')
export type RussianPhone = z.infer<typeof russianPhoneSchema>
