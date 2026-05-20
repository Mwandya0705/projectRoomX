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

    gsap.fromTo(
      word,
      { x: '200vw' },
      {
        x: '-500vw',
        ease: 'none',
        scrollTrigger: {
          trigger: '#rolling-section',
          start: '18% 85%',
          end: 'bottom 50%',
          scrub: true,
          markers: false, // Set to true to debug the trigger points
        },
      }
    )
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
      <h2
        ref={wordRef}
        className="whitespace-nowrap text-[16rem] font-[0.1] tracking-tight font-montserrat text-green-950 select-none will-change-transform"
      >
        Sell Your Skills, Sync Your Sessions.
      </h2>
    </div>
  )
}