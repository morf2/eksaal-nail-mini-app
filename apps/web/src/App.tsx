import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BrowserRouter } from 'react-router-dom'
import SplashScreen from './components/SplashScreen'
import AppRoutes from './app/AppRoutes'
import { initTelegramWebApp } from './shared/telegram/telegramInit'

export default function App() {
  const [isSplashVisible, setSplashVisible] = useState(true)

  useEffect(() => {
    initTelegramWebApp()
  }, [])

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        {isSplashVisible ? (
          <SplashScreen key="splash" onFinished={() => setSplashVisible(false)} />
        ) : (
          <AppRoutes key="app" />
        )}
      </AnimatePresence>
    </BrowserRouter>
  )
}
