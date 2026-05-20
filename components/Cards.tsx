'use client'

import Image from 'next/image'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export default function Cards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentCardRef = useRef<HTMLDivElement>(null)
  const tradingCardRef = useRef<HTMLDivElement>(null)
  const tradingImageRef = useRef<HTMLImageElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          markers: false,
        },
      })

      tl.to([contentCardRef.current, tradingImageRef.current], {
        y: -120, 
        ease: 'none',
      }, 0)

      tl.to(tradingCardRef.current, {
        y: -60,
        ease: 'none',
      }, 0)
    },
    { scope: containerRef }
  )

  return (
    <section ref={containerRef} className="overflow-hidden">
      {/* Container Adjustments:
          1. Removed max-w-6xl and replaced with a wider max-w-[1600px] or 95vw
          2. px-4 lg:px-[clamp(1.75rem,5vw,3rem)] handles the "pl-7" requirement dynamically
      */}
      <div className="grid gap-6 md:grid-cols-2 w-full max-w-[1850px] mx-auto px-4 lg:px-10 py-24">
        
        {/* ================= Content Creation Room (FAST) ================= */}
        <div 
          ref={contentCardRef}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-300 via-rose-300 to-amber-300 p-8 sm:p-12 min-h-[400px] lg:min-h-[480px] flex flex-col justify-start will-change-transform"
        >
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Content Creation Room
            </h2>
            <p className="text-base sm:text-lg text-gray-800 max-w-lg leading-relaxed opacity-90">
              Run a private studio for your most engaged fans. Teach, build, or create live while
              subscribers join via video, audio, and chat in a distraction-free room.
            </p>
          </div>

          {/* Placeholder/Visual Element */}
          <div className="mt-12 h-48 sm:h-64 rounded-3xl bg-white/40 border border-white/40 backdrop-blur-sm flex items-center justify-center text-gray-600">
            {/* Visual element placeholder */}
          </div>

          <Image
            src="/media/images/camera1.png"
            alt="Content Creation Room"
            width={300}
            height={300}
            className="absolute -bottom-10 -left-10 w-64 sm:w-80 pointer-events-none drop-shadow-2xl"
          />
        </div>

        {/* ================= Trading Room (SLOW) ================= */}
        <div 
          ref={tradingCardRef}
          className="relative rounded-[2.5rem] bg-gradient-to-br from-teal-200 via-emerald-100 to-emerald-200 p-8 sm:p-12 min-h-[400px] lg:min-h-[480px] flex flex-col justify-start will-change-transform"
        >
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Trading Room
            </h2>
            <p className="text-base sm:text-lg text-gray-700 max-w-lg leading-relaxed opacity-90">
              Host your private trading floor. Share your live charts, strategies, and screen with
              paying members in real time while keeping full control over who gets in.
            </p>
          </div>

          {/* Floating image (FAST - moves with Content Card) */}
          <Image
            ref={tradingImageRef}
            src="/media/images/tradingcard1.png"
            alt="Trading Room"
            width={300}
            height={300}
            className="absolute bottom-0 right-0 w-64 sm:w-80 lg:w-96 pointer-events-none drop-shadow-2xl will-change-transform"
          />
        </div>
      </div>
    </section>
  )
}