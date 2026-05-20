'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export default function CrossingWord() {
  const wordRef = useRef<HTMLHeadingElement>(null)

  useGSAP(() => {
    const word = wordRef.current
    if (!word) return

    let mm = gsap.matchMedia()

    // Mobile layout (under 768px) - Scrolls 40% faster by travelling a wider distance
    mm.add("(max-width: 767px)", () => {
      gsap.fromTo(
        word,
        { x: '190vw' },
        {
          x: '-1650vw',
          ease: 'none',
          scrollTrigger: {
            trigger: '#rolling-section',
            start: '22% 85%',
            end: 'bottom 50%',
            scrub: true,
            markers: false,
          },
        }
      )
    })

    // Desktop/Laptop layout (768px and above)
    mm.add("(min-width: 768px)", () => {
      gsap.fromTo(
        word,
        { x: '350vw' },
        {
          x: '-950vw',
          ease: 'none',
          scrollTrigger: {
            trigger: '#rolling-section',
            start: '18% 85%',
            end: 'bottom 50%',
            scrub: true,
            markers: false,
          },
        }
      )
    })

    return () => mm.revert()
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
      <h2
        ref={wordRef}
        className="whitespace-nowrap text-[5rem] sm:text-[9rem] md:text-[16rem] font-normal tracking-tight font-nanum text-white select-none will-change-transform opacity-90"
      >
        Sell Your Skills, Sync Your Sessions.
      </h2>
    </div>
  )
}