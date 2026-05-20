'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import SplashScreen from './SplashScreen'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Only show splash screen once per tab session to preserve back navigation scroll restoration
    const hasSeen = sessionStorage.getItem('hasSeenSplash')
    if (hasSeen === 'true') {
      setShowSplash(false)
    }
  }, [])

  const handleComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true')
    setShowSplash(false)
    // Guarantee window scroll starts at the top on first entry
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen key="splash" onComplete={handleComplete} />
        )}
      </AnimatePresence>
      <main className={`transition-opacity duration-1000 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        {!showSplash && children}
      </main>
    </>
  )
}
