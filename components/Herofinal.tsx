"use client"

import React, { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export default function HeroFinal() {
  const heroRef = useRef<HTMLDivElement>(null)
  const lineLeftRef = useRef<HTMLSpanElement>(null)
  const lineRightRef = useRef<HTMLSpanElement>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const contentCardRef = useRef<HTMLDivElement>(null)
  const tradingCardRef = useRef<HTMLDivElement>(null)
  const tradingImageRef = useRef<HTMLImageElement>(null)

  useGSAP(
    () => {
      if (!heroRef.current) return
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=300',
          scrub: 1,
          pin: false,
          invalidateOnRefresh: true,
        },
      })

      tl.to(lineLeftRef.current, {
        x: '-60%',
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

  useGSAP(
    () => {
      if (!cardsContainerRef.current) return
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cardsContainerRef.current,
          start: ' 74.5% center ', // Starts earlier to catch the negative margin overlap
          end: '90%  center', // Ends later to allow the animation to finish as the section scrolls out
          scrub: 1,
          markers: false,
        },
      })

      tl.to([contentCardRef.current, tradingImageRef.current], {
        y: -600, // faster movement
        ease: 'none',
      }, 0)

      tl.to(tradingCardRef.current, {
        y: -70, // slower movement
        ease: 'none',
      }, 0)
    },
    { scope: cardsContainerRef }
  )

  return (
    <div className="bg-[#f5f6f2]">
      {/* ================= SECTION 1: HERO ================= */}
      <section
        ref={heroRef}
        className="
                            relative 
                            min-h-[75vh] 
                            flex flex-col items-center justify-center 
                            px-4 sm:px-8 
                            overflow-hidden 
                            pb-0
                          "
      >
        <h1 className="flex flex-col items-center text-center font-normal text-gray-900 tracking-[-0.05em] font-montserrat leading-[1.1] text-[clamp(1.8rem,7vw,5rem)]">
          <span ref={lineLeftRef} className="block will-change-transform whitespace-nowrap">
            Welcome{' '}
            <span className="inline-block w-[1.1em] h-[1.1em] mx-1 align-middle rounded-lg overflow-hidden bg-gray-200 relative -top-[0.05em]">
              <img src="/media/images/afro.jpg" alt="" className="w-full h-full object-cover" />
            </span>
            to the AI era
          </span>

          <span ref={lineRightRef} className="block will-change-transform mt-2 whitespace-nowrap">
            Content creation rooms & live trading{' '}
            <span
              className="inline-block w-[1.6em] h-[1.1em] mx-1 align-middle rounded-lg overflow-hidden relative -top-[0.05em]"
              style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #f472b6 100%)' }}
            >
              <img src="/media/images/trader.jpg" alt="" className="w-full h-full object-cover" />
            </span>
          </span>
        </h1>

        <p className="mt-6 text-center text-gray-500 max-w-xl text-base sm:text-lg leading-relaxed px-4">
          A complete, AI-powered solution helping creators improve engagement and streamline their live workflows.
        </p>

        <div className="mt-8">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="px-8 py-3 rounded-full bg-emerald-700 text-white font-semibold text-sm sm:text-base hover:bg-emerald-800 transition-colors shadow-sm">
                Get a demo
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="px-8 py-3 rounded-full bg-emerald-700 text-white font-semibold text-sm sm:text-base hover:bg-emerald-800 transition-colors shadow-sm">
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* ================= SECTION 2: CARDS ================= */}
      <section
        ref={cardsContainerRef}
        className="relative overflow-visible pt-0 pb-24 -mt-1 lg:-mt-1 z-10"
      >
        {/* ^ -mt-10 pulls the section up. Increase to -mt-32 if you want it even higher */}
        <div className="grid gap-6 md:grid-cols-2 w-full max-w-[1850px] mx-auto px-4 lg:px-10">

          <div
            ref={contentCardRef}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-600 via-rose-300 to-amber-300 p-8 sm:p-12 min-h-[600px] lg:min-h-[750px] flex flex-col justify-start shadow-2xl will-change-transform"
          >
            {/* TOP LAYER: Text Content */}
            <div className="relative z-30">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight max-w-xs">
                  Content Creation Room
                </h2>
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-lg animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  Live
                </span>
              </div>

              <p className="text-base sm:text-lg text-gray-800 max-w-sm leading-relaxed opacity-90">
                Run a private studio for your fans. Teach, build, or create live in a distraction-free room.
              </p>

              {/* DIAMOND AVATAR GROUP - Positioned below paragraph */}
              <div className="relative mt-8 ml-4 flex items-center justify-end flex-row-reverse -space-x-3 space-x-reverse">
                {/* The Badge (+88) - Now appears first in DOM but last visually because of flex-row-reverse */}
                <div className="z-10 w-10 h-10 rounded-full border-2 border-white bg-white/60 backdrop-blur-md flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-lg">
                  +88
                </div>

                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="
                                relative
                                w-10 h-10 
                                rounded-full 
                                border-2 border-white 
                                overflow-hidden 
                                shadow-md 
                                transition-transform 
                                hover:-translate-y-1 
                                hover:scale-110 
                                hover:z-50
                              "
                    style={{ zIndex: 5 - i }} // Manual Z-index so the first one is always on top
                  >
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="viewer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* MAIN GLASS BOX - Background for Features and Image */}
            <div className="mt-auto mb-20 relative w-full h-[320px] rounded-[2.5rem] bg-white/30 border border-white/20 backdrop-blur-md shadow-inner z-10 flex items-center">

              <div className="pl-8 space-y-4 z-30 relative">
                {['Live Teaching', 'Video, Audio & Chat', 'Distraction-Free'].map((text, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center shadow-md border-2 border-white/50">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={4} // Increased thickness for visibility
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm lg:text-base font-bold text-gray-800">{text}</span>
                  </div>
                ))}
              </div>

              {/* Image positioned inside/breaking out of the box */}
              <Image
                src="/media/images/cameraman2.png"
                alt="Content Creation Room"
                width={600}
                height={800}
                className="
                                absolute 
                                bottom-0
                                right-0
                                h-[230%] 
                                w-auto 
                                object-contain
                                pointer-events-none 
                                drop-shadow-[0_25px_25px_rgba(0,0,0,0.25)]
                                z-20
                              "
              />
            </div>

            {/* EXTERNAL WAVEFORM - Adjusted left padding */}
            <div className="absolute bottom-10 left-[4rem] z-20 flex items-end gap-1 h-12">
              {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 0.9, 0.5, 0.7, 0.4].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-green-900 rounded-full animate-bounce"
                  style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>

            {/* Watch Now Button */}
            <button className="absolute bottom-10 right-12 z-40 px-6 py-3 bg-green-900 hover:bg-red-700 text-white rounded-2xl font-bold shadow-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
              Enter Now
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
            </button>
          </div>

          {/* ================= Trading Room Card ================= */}
          <div
            ref={tradingCardRef}
            className="relative overflow-visible rounded-[2.5rem] bg-gradient-to-br from-teal-600 via-emerald-200 to-emerald-300 p-8 sm:p-12 min-h-[600px] lg:min-h-[750px] flex flex-col justify-start shadow-2xl will-change-transform"
          >
            {/* TOP LAYER: Header */}
            <div className="relative z-30">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight max-w-xs mb-4">
                Trading Room
              </h2>

              <p className="text-base sm:text-lg text-gray-700 max-w-sm leading-relaxed opacity-90">
                Host your private trading floor. Share live charts and strategies with members in real time.
              </p>

              {/* Floating Profit Tickers - Different Colors & Expanded */}
              <div className="mt-8 flex flex-wrap gap-3 max-w-md">
                {/* BTC - Emerald Gain */}
                <div className="px-4 py-2 rounded-xl bg-white/50 backdrop-blur-md border border-emerald-400/50 shadow-sm flex items-center gap-2 transition-transform hover:scale-105">
                  <span className="text-emerald-700 font-bold">BTC</span>
                  <span className="text-emerald-600 font-medium">+4.2%</span>
                </div>

                {/* ETH - Sky Blue Stability */}
                <div className="px-4 py-2 rounded-xl bg-white/50 backdrop-blur-md border border-blue-400/50 shadow-sm flex items-center gap-2 transition-transform hover:scale-105">
                  <span className="text-blue-700 font-bold">ETH</span>
                  <span className="text-blue-600 font-medium">+2.8%</span>
                </div>

                {/* SOL - Purple Momentum */}
                <div className="px-4 py-2 rounded-xl bg-white/50 backdrop-blur-md border border-purple-400/50 shadow-sm flex items-center gap-2 transition-transform hover:scale-105">
                  <span className="text-purple-700 font-bold">SOL</span>
                  <span className="text-purple-600 font-medium">+8.1%</span>
                </div>

                {/* NVDA - Amber Warning/Peak */}
                <div className="px-4 py-2 rounded-xl bg-white/50 backdrop-blur-md border border-amber-400/50 shadow-sm flex items-center gap-2 transition-transform hover:scale-105">
                  <span className="text-amber-700 font-bold">NVDA</span>
                  <span className="text-amber-600 font-medium">-0.4%</span>
                </div>
              </div>

              {/* Live Market Badge - Repositioned Below Tickers */}
              <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-700 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Market Open
              </div>
            </div>

            {/* MAIN GLASS BOX - Dashboard Shelf */}
            <div className="mt-auto relative w-full h-[320px] rounded-[2.5rem] bg-white/25 border border-white/40 backdrop-blur-md shadow-inner z-10 flex flex-col justify-center overflow-hidden">

              {/* Feature List */}
              <div className="pl-8 space-y-4 z-30 relative">
                {['Live Chart Sharing', 'Strategy Breakdown', 'Membership Control'].map((text, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center shadow-md border-2 border-white/50">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={4} // Increased thickness for visibility
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm lg:text-base font-bold text-gray-800">{text}</span>
                  </div>
                ))}
              </div>

              {/* SVG Chart Background (Emerald tint) */}
              <div className="absolute bottom-0 left-0 w-full h-32 opacity-30 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <path
                    d="M0 80 Q 50 20, 100 70 T 200 30 T 300 60 T 400 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-emerald-700"
                  />
                </svg>
              </div>
            </div>

            {/* THE TRADER IMAGE */}
            <Image
              ref={tradingImageRef}
              src="/media/images/gustavo1.png"
              alt="Trader"
              width={700}
              height={900}
              className="
      absolute 
      bottom-0
      right-0
      h-[110%] 
      sm:h-[130%] 
      lg:h-[108%] 
      w-auto 
      object-contain
      pointer-events-none 
      drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)]
      z-20
      will-change-transform
    "
            />

            {/* Bottom Action Button */}
            <button className="absolute bottom-10 right-10 z-40 px-10 py-3.5 bg-green-900 hover:bg-black text-white rounded-2xl font-bold shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              Join Floor
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}