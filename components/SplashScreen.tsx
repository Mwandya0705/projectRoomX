'use client'

import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    // GSAP initial fade-in
    gsap.fromTo(logoRef.current, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )

    // Smooth count up from 0 to 100% in 2.8 seconds
    const duration = 2800 
    const startTime = performance.now()

    let animationFrameId: number

    const updateCounter = (now: number) => {
      const elapsed = now - startTime
      const progressRatio = Math.min(elapsed / duration, 1)
      
      // Easing the count to feel premium (slow down towards 100%)
      const easedProgress = 1 - Math.pow(1 - progressRatio, 3) 
      const currentPercent = Math.floor(easedProgress * 100)

      setPercent(currentPercent)

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${currentPercent}%`
      }

      if (progressRatio < 1) {
        animationFrameId = requestAnimationFrame(updateCounter)
      } else {
        // Completed 100% - trigger premium fade out
        setTimeout(() => {
          gsap.to(containerRef.current, {
            opacity: 0,
            scale: 0.98,
            duration: 0.7,
            ease: 'power3.inOut',
            onComplete: onComplete
          })
        }, 300)
      }
    }

    animationFrameId = requestAnimationFrame(updateCounter)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="flex flex-col items-center select-none animate-fade-in">
        
        {/* LOGO */}
        <div
          ref={logoRef}
          className="text-8xl font-nanum font-bold tracking-[-0.02em] shrink-0 hover:opacity-90 transition-opacity"
        >
          <span className="text-gray-900">Room</span>
          <span className="text-emerald-500">X</span>
        </div>

        {/* LOADING PROGRESS */}
        <div className="mt-8 flex flex-col items-center gap-3">
          {/* Elegant percentage counter */}
          <span className="text-2xl font-mono font-medium text-gray-400 tracking-wider">
            {String(percent).padStart(3, '0')}%
          </span>

          {/* Minimalist modern progress bar */}
          <div className="w-56 h-[3px] bg-gray-100 rounded-full overflow-hidden relative">
            <div
              ref={progressBarRef}
              className="h-full bg-emerald-500 rounded-full transition-all duration-75 ease-out"
              style={{ width: '0%' }}
            />
          </div>
        </div>

      </div>

      {/* Aesthetic ambient subtle grid background matching RoomX flavor but very clean light grey */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full bg-[linear-gradient(#000000_1px,transparent_1px),linear-gradient(90deg,#000000_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>
    </div>
  )
}