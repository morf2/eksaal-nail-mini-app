import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import type { PortfolioCategory } from '@eksaal/shared'
import { fileToDataUrl } from '../../shared/fileToDataUrl'
import { TEXT_COLORS } from '../../shared/textColors'

interface PortfolioFormProps {
  onSubmit: (input: {
    imageUrl: string
    title: string
    category: PortfolioCategory
    description?: string
  }) => void
  onCancel: () => void
}

const CATEGORY_OPTIONS: { value: PortfolioCategory; label: string }[] = [
  { value: 'MANICURE', label: 'Маникюр' },
  { value: 'PEDICURE', label: 'Педикюр' },
  { value: 'EXTENSION', label: 'Наращивание' },
  { value: 'NAIL_ART', label: 'Дизайн ногтей' },
]

export default function PortfolioForm({ onSubmit, onCancel }: PortfolioFormProps) {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<PortfolioCategory>('MANICURE')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const canSubmit = Boolean(imageDataUrl) && title.trim().length > 0

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setError(null)
      const dataUrl = await fileToDataUrl(file)
      setImageDataUrl(dataUrl)
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : 'Не удалось загрузить фото')
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!imageDataUrl || !title.trim()) return
    onSubmit({
      imageUrl: imageDataUrl,
      title: title.trim(),
      category,
      description: description.trim() || undefined,
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
        <p className="mb-2 font-body text-xs" style={{ color: TEXT_COLORS.secondary }}>
          Фото
        </p>
        {imageDataUrl ? (
          <div className="flex items-center gap-3">
            <img src={imageDataUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
            <button
              type="button"
              onClick={() => setImageDataUrl(null)}
              className="font-body text-xs underline underline-offset-4"
              style={{ color: TEXT_COLORS.secondary }}
            >
              Заменить
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full font-body text-xs file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-body file:text-xs file:text-background"
            style={{ color: TEXT_COLORS.secondary }}
          />
        )}
        {error && (
          <p className="mt-1.5 font-body text-xs" style={{ color: '#F87171' }}>
            {error}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 font-body text-xs" style={{ color: TEXT_COLORS.secondary }}>
          Название работы
        </p>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Например: Миндальная форма, нюд"
          className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 font-body text-sm placeholder:text-secondary focus:border-accent focus:outline-none"
          style={{ color: TEXT_COLORS.primary }}
        />
      </div>

      <div>
        <p className="mb-2 font-body text-xs" style={{ color: TEXT_COLORS.secondary }}>
          Категория
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((option) => {
            const isSelected = category === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategory(option.value)}
                className={`rounded-full border px-4 py-2 font-body text-xs transition-colors ${
                  isSelected ? 'border-accent bg-accent' : 'border-white/10'
                }`}
                style={{ color: isSelected ? TEXT_COLORS.primary : TEXT_COLORS.secondary }}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 font-body text-xs" style={{ color: TEXT_COLORS.secondary }}>
          Описание (необязательно)
        </p>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 font-body text-sm placeholder:text-secondary focus:border-accent focus:outline-none"
          style={{ color: TEXT_COLORS.primary }}
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
          className="flex-1 rounded-full border border-white/15 px-4 py-3 font-body text-xs"
          style={{ color: TEXT_COLORS.secondary }}
        >
          Отмена
        </motion.button>
      </div>
    </motion.form>
  )
}
