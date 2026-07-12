import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import type { Service, ServiceCategory } from '@eksaal/shared'
import type { ServiceInput } from '../../shared/store/services'

interface ServiceFormProps {
  initialValues?: Service
  onSubmit: (input: ServiceInput) => void
  onCancel: () => void
}

const CATEGORY_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: 'MANICURE', label: 'Маникюр' },
  { value: 'PEDICURE', label: 'Педикюр' },
  { value: 'EXTENSION', label: 'Наращивание' },
  { value: 'NAIL_ART', label: 'Дизайн ногтей' },
]

export default function ServiceForm({ initialValues, onSubmit, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [category, setCategory] = useState<ServiceCategory>(initialValues?.category ?? 'MANICURE')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [price, setPrice] = useState(initialValues ? String(initialValues.price) : '')
  const [durationMinutes, setDurationMinutes] = useState(
    initialValues ? String(initialValues.durationMinutes) : '',
  )
  const [isPriceFrom, setIsPriceFrom] = useState(initialValues?.isPriceFrom ?? false)

  const priceValue = Number(price)
  const durationValue = Number(durationMinutes)
  const canSubmit =
    name.trim().length > 0 &&
    Number.isFinite(priceValue) &&
    priceValue >= 0 &&
    Number.isInteger(durationValue) &&
    durationValue > 0

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit({
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      price: priceValue,
      durationMinutes: durationValue,
      isPriceFrom,
    })
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={handleSubmit}
      className="mb-6 flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-surface p-5"
    >
      <div>
        <p className="mb-2 font-body text-xs text-text/50">Название</p>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Например: Маникюр с покрытием"
          className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 font-body text-sm text-text placeholder:text-text/30 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <p className="mb-2 font-body text-xs text-text/50">Категория</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCategory(option.value)}
              className={`rounded-full border px-4 py-2 font-body text-xs transition-colors ${
                category === option.value
                  ? 'border-accent bg-accent text-background'
                  : 'border-white/10 text-text/70'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <p className="mb-2 font-body text-xs text-text/50">Цена, ₽</p>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="1700"
            className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 font-body text-sm text-text placeholder:text-text/30 focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <p className="mb-2 font-body text-xs text-text/50">Длительность, мин</p>
          <input
            type="number"
            inputMode="numeric"
            min={5}
            step={5}
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(event.target.value)}
            placeholder="120"
            className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 font-body text-sm text-text placeholder:text-text/30 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsPriceFrom((value) => !value)}
        className={`w-fit rounded-full border px-4 py-2 font-body text-xs transition-colors ${
          isPriceFrom ? 'border-accent bg-accent text-background' : 'border-white/10 text-text/70'
        }`}
      >
        Цена «от» (например, для наращивания)
      </button>

      <div>
        <p className="mb-2 font-body text-xs text-text/50">Описание (необязательно)</p>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Например: Маникюр + покрытие гель-лаком"
          rows={2}
          className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 font-body text-sm text-text placeholder:text-text/30 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <motion.button
          type="submit"
          disabled={!canSubmit}
          whileTap={canSubmit ? { scale: 0.97 } : undefined}
          className="flex-1 rounded-full bg-accent px-4 py-3 font-body text-xs font-medium uppercase tracking-[0.1em] text-background disabled:opacity-40"
        >
          Сохранить
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onCancel}
          className="flex-1 rounded-full border border-white/15 px-4 py-3 font-body text-xs text-text/60"
        >
          Отмена
        </motion.button>
      </div>
    </motion.form>
  )
}
