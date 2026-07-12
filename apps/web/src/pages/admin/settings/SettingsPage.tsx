import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { BookingSettings, MasterProfile, StudioSettings } from '@eksaal/shared'
import { useAppSettingsStore } from '../../../shared/store/appSettings'
import { useAdminBookingsStore } from '../../../shared/store/adminBookings'
import { fileToDataUrl } from '../../../shared/fileToDataUrl'
import ConfirmDialog from '../../../components/ConfirmDialog'

const LEAD_TIME_OPTIONS = [0, 1, 2, 3, 4, 6, 12, 24]

function PhotoPicker({
  photoUrl,
  onChange,
}: {
  photoUrl: string | null
  onChange: (dataUrl: string) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setError(null)
      onChange(await fileToDataUrl(file))
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : 'Не удалось загрузить фото')
    }
  }

  return (
    <div>
      <p className="mb-2 font-body text-xs text-text/50">Фото</p>
      <div className="flex items-center gap-3">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-background font-heading text-lg text-text/30">
            ?
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="flex-1 font-body text-xs text-text/60 file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-body file:text-xs file:text-background"
        />
      </div>
      {error && <p className="mt-1.5 font-body text-xs text-red-400/80">{error}</p>}
    </div>
  )
}

function SaveButton({ isDirty, onClick }: { isDirty: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      disabled={!isDirty}
      whileTap={isDirty ? { scale: 0.97 } : undefined}
      onClick={onClick}
      className={`w-full rounded-full px-6 py-3 font-body text-xs font-medium uppercase tracking-[0.1em] transition-colors ${
        isDirty ? 'bg-accent text-background' : 'bg-background text-text/30'
      }`}
    >
      {isDirty ? 'Сохранить' : 'Сохранено'}
    </motion.button>
  )
}

function MasterProfileSection() {
  const masterProfile = useAppSettingsStore((state) => state.settings.masterProfile)
  const updateMasterProfile = useAppSettingsStore((state) => state.updateMasterProfile)
  const [draft, setDraft] = useState<MasterProfile>(masterProfile)
  const isDirty = JSON.stringify(draft) !== JSON.stringify(masterProfile)

  return (
    <section className="mb-8">
      <h2 className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
        Профиль мастера
      </h2>
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface p-5">
        <PhotoPicker photoUrl={draft.photoUrl} onChange={(photoUrl) => setDraft({ ...draft, photoUrl })} />

        <div>
          <p className="mb-2 font-body text-xs text-text/50">Имя</p>
          <input
            type="text"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 font-body text-sm text-text focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <p className="mb-2 font-body text-xs text-text/50">Описание</p>
          <textarea
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            rows={2}
            className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 font-body text-sm text-text focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <p className="mb-2 font-body text-xs text-text/50">Telegram</p>
            <input
              type="text"
              value={draft.telegramUsername}
              onChange={(event) => setDraft({ ...draft, telegramUsername: event.target.value })}
              placeholder="@username"
              className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 font-body text-sm text-text placeholder:text-text/30 focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <p className="mb-2 font-body text-xs text-text/50">Телефон</p>
            <input
              type="text"
              value={draft.phone}
              onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
              placeholder="+7 900 000-00-00"
              className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 font-body text-sm text-text placeholder:text-text/30 focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <SaveButton isDirty={isDirty} onClick={() => updateMasterProfile(draft)} />
      </div>
    </section>
  )
}

function BookingSettingsSection() {
  const bookingSettings = useAppSettingsStore((state) => state.settings.bookingSettings)
  const updateBookingSettings = useAppSettingsStore((state) => state.updateBookingSettings)
  const [draft, setDraft] = useState<BookingSettings>(bookingSettings)
  const isDirty = JSON.stringify(draft) !== JSON.stringify(bookingSettings)

  return (
    <section className="mb-8">
      <h2 className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
        Настройки записи
      </h2>
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface p-5">
        <div>
          <p className="mb-2 font-body text-xs text-text/50">Автоматическое подтверждение</p>
          <div className="flex gap-2">
            {[
              { value: true, label: 'Да' },
              { value: false, label: 'Нет' },
            ].map((option) => (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => setDraft({ ...draft, autoConfirm: option.value })}
                className={`rounded-full border px-4 py-2 font-body text-xs transition-colors ${
                  draft.autoConfirm === option.value
                    ? 'border-accent bg-accent text-background'
                    : 'border-white/10 text-text/70'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 font-body text-xs text-text/40">
            {draft.autoConfirm
              ? 'Новые заявки сразу становятся подтверждёнными.'
              : 'Новые заявки ждут ручного подтверждения мастером.'}
          </p>
        </div>

        <div>
          <p className="mb-2 font-body text-xs text-text/50">Напоминание за день до записи</p>
          <div className="flex gap-2">
            {[
              { value: true, label: 'Включено' },
              { value: false, label: 'Выключено' },
            ].map((option) => (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => setDraft({ ...draft, reminderDayBeforeEnabled: option.value })}
                className={`rounded-full border px-4 py-2 font-body text-xs transition-colors ${
                  draft.reminderDayBeforeEnabled === option.value
                    ? 'border-accent bg-accent text-background'
                    : 'border-white/10 text-text/70'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 font-body text-xs text-text/50">Минимальное время до записи</p>
          <div className="flex flex-wrap gap-2">
            {LEAD_TIME_OPTIONS.map((hours) => (
              <button
                key={hours}
                type="button"
                onClick={() => setDraft({ ...draft, minLeadTimeHours: hours })}
                className={`rounded-full border px-4 py-2 font-body text-xs transition-colors ${
                  draft.minLeadTimeHours === hours
                    ? 'border-accent bg-accent text-background'
                    : 'border-white/10 text-text/70'
                }`}
              >
                {hours === 0 ? 'Без ограничения' : `${hours} ч`}
              </button>
            ))}
          </div>
        </div>

        <SaveButton isDirty={isDirty} onClick={() => updateBookingSettings(draft)} />
      </div>
    </section>
  )
}

function StudioSettingsSection() {
  const studioSettings = useAppSettingsStore((state) => state.settings.studioSettings)
  const updateStudioSettings = useAppSettingsStore((state) => state.updateStudioSettings)
  const [draft, setDraft] = useState<StudioSettings>(studioSettings)
  const isDirty = JSON.stringify(draft) !== JSON.stringify(studioSettings)

  return (
    <section>
      <h2 className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
        Общие настройки
      </h2>
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface p-5">
        <div>
          <p className="mb-2 font-body text-xs text-text/50">Название студии</p>
          <input
            type="text"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 font-body text-sm text-text focus:border-accent focus:outline-none"
          />
        </div>

        <PhotoPicker photoUrl={draft.photoUrl} onChange={(photoUrl) => setDraft({ ...draft, photoUrl })} />

        <div>
          <p className="mb-2 font-body text-xs text-text/50">Описание</p>
          <textarea
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            rows={2}
            className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 font-body text-sm text-text focus:border-accent focus:outline-none"
          />
        </div>

        <SaveButton isDirty={isDirty} onClick={() => updateStudioSettings(draft)} />
      </div>
    </section>
  )
}

function DevelopmentSection() {
  const bookingsCount = useAdminBookingsStore((state) => state.bookings.length)
  const clearTestBookings = useAdminBookingsStore((state) => state.clearTestBookings)
  const [isConfirmOpen, setConfirmOpen] = useState(false)

  return (
    <section>
      <h2 className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
        Разработка
      </h2>
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface p-5">
        <div>
          <p className="mb-1 font-body text-sm text-text">Тестовые заявки</p>
          <p className="font-body text-xs text-text/50">
            Сейчас в системе {bookingsCount} {bookingsCount === 1 ? 'заявка' : 'заявок'} —
            демо-данные и всё, что создано при тестировании записи. Реального backend'а
            ещё нет, поэтому все заявки в системе тестовые.
          </p>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => setConfirmOpen(true)}
          disabled={bookingsCount === 0}
          className="flex items-center justify-center gap-1.5 rounded-full border border-red-400/40 px-6 py-3 font-body text-xs font-medium uppercase tracking-[0.1em] text-red-400 disabled:opacity-40"
        >
          <Trash2 size={13} strokeWidth={1.5} />
          Очистить тестовые записи
        </motion.button>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Очистить все тестовые записи?"
        description="Удалит все заявки в системе (демо и созданные при тестировании). Действие необратимо. Расписание и услуги не изменятся."
        confirmLabel="Да, очистить"
        cancelLabel="Отмена"
        onConfirm={() => {
          clearTestBookings()
          setConfirmOpen(false)
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  )
}

export default function SettingsPage() {
  return (
    <div className="px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)] lg:px-6">
      <h1 className="mb-1 font-heading text-2xl text-heading">Настройки</h1>
      <p className="mb-8 font-body text-sm text-text/60">
        Профиль мастера, правила записи и общие данные студии
      </p>

      <MasterProfileSection />
      <BookingSettingsSection />
      <StudioSettingsSection />
      <div className="mt-8">
        <DevelopmentSection />
      </div>
    </div>
  )
}
