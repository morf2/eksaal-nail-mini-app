import { motion } from 'framer-motion'
import type { CoatingStatus, DesiredLength } from '@eksaal/shared'
import PhoneInput from '../PhoneInput'

interface AdditionalInfoFormProps {
  phone: string
  showPhoneError?: boolean
  coatingStatus: CoatingStatus | null
  desiredLength: DesiredLength | null
  comment: string
  onPhoneChange: (value: string) => void
  onCoatingStatusChange: (value: CoatingStatus) => void
  onDesiredLengthChange: (value: DesiredLength) => void
  onCommentChange: (value: string) => void
}

const COATING_OPTIONS: { value: CoatingStatus; label: string }[] = [
  { value: 'NONE', label: 'Нет' },
  { value: 'HAS_OLD_COATING', label: 'Есть старое покрытие' },
]

const LENGTH_OPTIONS: { value: DesiredLength; label: string }[] = [
  { value: 'SHORT', label: 'Короткая' },
  { value: 'MEDIUM', label: 'Средняя' },
  { value: 'LONG', label: 'Длинная' },
]

function Chip<T extends string>({
  label,
  isSelected,
  onClick,
}: {
  label: string
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 font-body text-xs transition-colors ${
        isSelected ? 'border-accent bg-accent text-background' : 'border-white/10 bg-surface text-text/70'
      }`}
    >
      {label}
    </motion.button>
  )
}

export default function AdditionalInfoForm({
  phone,
  showPhoneError = false,
  coatingStatus,
  desiredLength,
  comment,
  onPhoneChange,
  onCoatingStatusChange,
  onDesiredLengthChange,
  onCommentChange,
}: AdditionalInfoFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 font-body text-xs text-text/50">Телефон для связи</p>
        <PhoneInput value={phone} onChange={onPhoneChange} showError={showPhoneError} />
      </div>

      <div>
        <p className="mb-2 font-body text-xs text-text/50">Старое покрытие</p>
        <div className="flex flex-wrap gap-2">
          {COATING_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              isSelected={coatingStatus === option.value}
              onClick={() => onCoatingStatusChange(option.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-body text-xs text-text/50">Желаемая длина</p>
        <div className="flex flex-wrap gap-2">
          {LENGTH_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              isSelected={desiredLength === option.value}
              onClick={() => onDesiredLengthChange(option.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-body text-xs text-text/50">Комментарий</p>
        <textarea
          value={comment}
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder="Аллергия, пожелания по форме или другие важные детали"
          rows={3}
          className="w-full rounded-2xl border border-white/10 bg-surface px-4 py-3 font-body text-sm text-text placeholder:text-text/30 focus:border-accent focus:outline-none"
        />
      </div>
    </div>
  )
}
