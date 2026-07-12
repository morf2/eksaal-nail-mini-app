import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { Phone } from 'lucide-react'
import {
  extractSubscriberDigits,
  formatSubscriberDigits,
  getPhoneError,
  isValidRussianPhone,
} from '../../shared/phone'
import { requestTelegramContact } from '../../shared/telegram'

interface PhoneInputProps {
  value: string // subscriber digits, 0-10 chars (the part after the fixed +7)
  onChange: (subscriberDigits: string) => void
  showError?: boolean
}

export default function PhoneInput({ value, onChange, showError = false }: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [touched, setTouched] = useState(false)
  const [isRequestingContact, setRequestingContact] = useState(false)

  const shouldShowError = (touched || showError) && !isValidRussianPhone(value)
  const errorMessage = shouldShowError ? getPhoneError(value) : null

  // +7 is a fixed label outside the input, so onChange only ever has to parse the
  // editable remainder — no risk of the "7" from the prefix leaking back into digits.
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(extractSubscriberDigits(event.target.value))
  }

  const handleShareContact = async () => {
    setRequestingContact(true)
    try {
      const phone = await requestTelegramContact()
      if (phone) onChange(extractSubscriberDigits(phone))
      setTouched(true)
    } finally {
      setRequestingContact(false)
    }
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex items-center rounded-2xl border bg-surface px-4 py-3 ${
          errorMessage ? 'border-red-400/60' : 'border-white/10 focus-within:border-accent'
        }`}
      >
        <span className="shrink-0 select-none font-body text-sm text-text/50">+7</span>
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={formatSubscriberDigits(value)}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          placeholder=" 900 000-00-00"
          maxLength={13}
          className="w-full bg-transparent pl-1 font-body text-sm text-text placeholder:text-text/30 focus:outline-none"
        />
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={handleShareContact}
        disabled={isRequestingContact}
        className="mt-2 flex items-center gap-1.5 font-body text-xs text-accent disabled:opacity-40"
      >
        <Phone size={13} strokeWidth={2} />
        {isRequestingContact ? 'Запрашиваем...' : 'Поделиться контактом'}
      </motion.button>

      {errorMessage && <p className="mt-1.5 font-body text-xs text-red-400/80">{errorMessage}</p>}
    </div>
  )
}
