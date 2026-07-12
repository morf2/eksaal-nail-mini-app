import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Placeholder media (Mixkit / Unsplash, commercial-use license) — replace with real EKSAAL NAIL footage/photography.
const HERO_VIDEO = '/hero.mp4'
const HERO_IMAGE = '/hero-placeholder.jpg'

// Underlying clip may be longer than 4-5s (no trimming tool available in this environment) —
// loop only the first LOOP_SECONDS so the on-screen result matches the 4-5s loop spec.
const LOOP_SECONDS = 5

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const navigate = useNavigate()

  const [videoFailed, setVideoFailed] = useState(false)
  const [mediaReady, setMediaReady] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (video && video.currentTime >= LOOP_SECONDS) {
      video.currentTime = 0
    }
  }

  return (
    <section
      ref={containerRef}
      className="relative mx-4 mt-4 h-[78vh] max-h-[620px] overflow-hidden rounded-[2rem] bg-surface"
    >
      {!videoFailed ? (
        <motion.video
          ref={videoRef}
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onCanPlay={() => setMediaReady(true)}
          onError={() => setVideoFailed(true)}
          style={{ y: mediaY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: mediaReady ? 1 : 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-x-0 -top-16 h-[calc(100%+8rem)] w-full object-cover"
        />
      ) : (
        <motion.img
          src={HERO_IMAGE}
          alt="EKSAAL NAIL"
          onLoad={() => setMediaReady(true)}
          style={{ y: mediaY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: mediaReady ? 1 : 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-x-0 -top-16 h-[calc(100%+8rem)] w-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-background/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />

      <div className="relative flex h-full flex-col justify-end gap-6 p-8 pb-10">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading text-4xl leading-tight text-heading"
        >
          Маникюр,
          <br />
          созданный для тебя
        </motion.h1>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{
            scale: 1.03,
            boxShadow: '0 14px 32px -8px rgba(217,143,167,0.6)',
          }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/booking')}
          className="w-fit rounded-full bg-accent px-9 py-3.5 font-body text-sm font-medium uppercase tracking-[0.15em] text-background shadow-[0_8px_24px_-8px_rgba(217,143,167,0.45)] transition-shadow"
        >
          Записаться
        </motion.button>
      </div>
    </section>
  )
}
