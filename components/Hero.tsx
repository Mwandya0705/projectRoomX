"use client"

import React, { useRef } from 'react'
import Link from 'next/link'
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const lineLeftRef = useRef<HTMLSpanElement>(null)
  const lineRightRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      if (!heroRef.current) return

      // Timeline starts as soon as the Hero enters the top of the viewport
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',    // Animation starts when top of hero hits top of screen
          end: '+=400',   // Animation finishes when bottom of hero hits top of screen
          scrub: 1,            // Smoothly links animation to scroll position
          pin: false,          // REMOVED PIN: Allows the page to scroll while words move
          invalidateOnRefresh: true,
        },
      })

      tl.to(lineLeftRef.current, {
        x: '-60%',             // Reduced distance for a smoother "gliding" exit
        opacity: 1,
        ease: 'none',
      }).to(
        lineRightRef.current,
        {
          x: '60%',
          opacity: 1,
          ease: 'none',
        },
        '<'
      )
    },
    { scope: heroRef }
  )

  return (
    <main>
      <section
        ref={heroRef}
        className="
          relative
          min-h-[calc(100vh-15rem)] 
          flex flex-col items-center justify-center
          px-4 sm:px-8
          overflow-hidden
        "
      >
        {/* Headline - Using clamp to keep text within viewport limits */}
        <h1
          className="
            flex flex-col items-center
            text-center
            font-normal
            text-gray-900
            tracking-[-0.05em]
            leading-[1.1]
            text-[clamp(1.8rem,7vw,5rem)] 
          "
        >
          {/* Line 1 */}
          <span
            ref={lineLeftRef}
            className="block will-change-transform whitespace-nowrap"
          >
            Welcome{' '}
            <span className="inline-block w-[1.1em] h-[1.1em] mx-1 align-middle rounded-lg overflow-hidden bg-gray-200 relative -top-[0.05em]">
              <img
                src="/media/images/afro.jpg"
                alt=""
                className="w-full h-full object-cover"
              />
            </span>
            to the AI era
          </span>

          {/* Line 2 */}
          <span
            ref={lineRightRef}
            className="block will-change-transform mt-2 whitespace-nowrap"
          >
            Content  creation rooms 
            & live trading{' '}
            <span
              className="inline-block w-[1.6em] h-[1.1em] mx-1 align-middle rounded-lg overflow-hidden relative -top-[0.05em]"
              style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #f472b6 100%)',
              }}
            >
              <img
                src="/media/images/trader.jpg"
                alt=""
                className="w-full h-full object-cover"
              />
            </span>
            
          </span>
        </h1>

        {/* Sub-copy */}
        <p className="mt-8 text-center text-gray-500 max-w-xl text-base sm:text-lg leading-relaxed px-4">
          A complete, AI-powered solution helping creators improve
          engagement and streamline their live workflows.
        </p>

        {/* CTA */}
        <div className="mt-10">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="px-8 py-3 rounded-full bg-emerald-700 text-white font-semibold text-sm sm:text-base hover:bg-emerald-800 transition-colors shadow-sm">
                Get a demo
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="px-8 py-3 rounded-full bg-emerald-700 text-white font-semibold text-sm sm:text-base hover:bg-emerald-800 transition-colors shadow-sm"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </section>
    </main>
  )
}