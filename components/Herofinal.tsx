"use client"

import React, { useRef, useState, useEffect } from 'react'
import { Link } from 'next-view-transitions'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export default function HeroFinal() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()
  const heroRef = useRef<HTMLDivElement>(null)
  const lineLeftRef = useRef<HTMLSpanElement>(null)
  const lineRightRef = useRef<HTMLSpanElement>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const contentCardRef = useRef<HTMLDivElement>(null)
  const tradingCardRef = useRef<HTMLDivElement>(null)
  const tradingImageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  useGSAP(
    () => {
      if (!heroRef.current) return
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          pin: false,
          invalidateOnRefresh: true,
          markers: false,
        },
      })

      tl.to(lineLeftRef.current, {
        x: '-230%',
        
        ease: 'none',
      }).to(
        lineRightRef.current,
        {
          x: '230%',
          
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

      let mm = gsap.matchMedia()

      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: cardsContainerRef.current,
            start: ' 74.5% center ',
            end: '90%  center',
            scrub: 1,
            markers: false,
          },
        })

        tl.to([contentCardRef.current, tradingImageRef.current], {
          y: -600,
          ease: 'none',
        }, 0)

        tl.to(tradingCardRef.current, {
          y: -70,
          ease: 'none',
        }, 0)
      })
    },
    { scope: cardsContainerRef }
  )

  return (
    <div className="bg-[#f5f6f2]">
      {/* ================= SECTION 1: HERO ================= */}
      <section
        ref={heroRef}
        className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-8 overflow-hidden pb-12 pt-40"
      >
        <h1 className="flex flex-col items-center text-center font-light text-gray-900 tracking-[-0.04em] font-nanum leading-[1.05] text-[clamp(1.5rem,5.5vw,2.5rem)] md:text-[clamp(2.5rem,7.8vw,5.8rem)]">
          <span ref={lineLeftRef} className="block will-change-transform whitespace-nowrap">
            Welcome{' '}
            <span className="inline-block w-[1.1em] h-[1.1em] mx-1.5 align-middle rounded-[12px] overflow-hidden bg-gray-200 relative -top-[0.05em] shadow-sm">
              <img src="/media/images/afro.jpg" alt="" className="w-full h-full object-cover" />
            </span>
            to the AI era
          </span>

          <span ref={lineRightRef} className="block will-change-transform mt-3 whitespace-nowrap">
            Content creation rooms & live trading{' '}
            <span
              className="inline-block w-[1.6em] h-[1.1em] mx-1.5 align-middle rounded-[12px] overflow-hidden relative -top-[0.05em] shadow-sm"
              style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #f472b6 100%)' }}
            >
              <img src="/media/images/trader.jpg" alt="" className="w-full h-full object-cover" />
            </span>
          </span>
        </h1>

        <p className="mt-10 text-center text-gray-700/90 max-w-2xl text-lg sm:text-[22px] leading-relaxed px-4 font-sans tracking-wide font-medium">
          A complete, AI-powered solution helping creators improve engagement and streamline their live workflows.
        </p>

        <div className="mt-10">
          {!user ? (
            <Link href="/dashboard/studio" className="inline-block px-8 py-3.5 rounded-full bg-emerald-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-[#003c33] transition-all shadow-md hover:scale-105 active:scale-95">
               Get a demo
            </Link>
          ) : (
            <Link href="/dashboard/studio" className="inline-block px-8 py-3.5 rounded-full bg-emerald-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-[#003c33] transition-all shadow-md hover:scale-105 active:scale-95">
              Go to AI Studio
            </Link>
          )}
        </div>
      </section>

      {/* ================= SECTION 2: CARDS ================= */}
      <section
        ref={cardsContainerRef}
        className="relative overflow-visible pt-0 pb-24 -mt-1 lg:-mt-1 z-10"
      >
        <div className="grid gap-6 md:grid-cols-2 w-full max-w-[1850px] mx-auto px-4 lg:px-10">

          <div
            ref={contentCardRef}
            className="relative overflow-hidden rounded-[2.5rem] bg-[#ff6b4a] p-8 sm:p-12 min-h-[600px] lg:min-h-[750px] flex flex-col justify-start border border-white/40 shadow-[0_20px_50px_rgba(255,107,74,0.25),inset_0_1px_3px_rgba(255,255,255,0.6)] will-change-transform"
          >
            {/* Background image covering card */}
            <img src="/assets/images/orangeb1.jpg" alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[2.5rem] z-0" />

            {/* Gloss reflection shine sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/25 to-white/0 pointer-events-none transform -skew-y-12 scale-150 opacity-40 translate-y-[-30%] z-10" />

            <div className="relative z-30">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-nanum font-black text-gray-950 tracking-[-0.04em] leading-[1.05] max-w-md">
                  Content Creation Room
                </h2>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/90 text-[#ff7759] text-[10px] font-mono font-bold uppercase tracking-wider shadow-md shrink-0 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff7759] animate-pulse"></span>
                  Live Studio
                </div>
              </div>

              <p className="text-sm sm:text-base text-gray-900/80 max-w-sm leading-relaxed font-normal">
                Run a private interactive studio for your fans. Teach, build, or create live in a gorgeous distraction-free environment.
              </p>

              <div className="relative mt-8 ml-4 flex items-center justify-end flex-row-reverse -space-x-3 space-x-reverse">
                <div className="z-10 w-10 h-10 rounded-full border-2 border-white bg-white/70 backdrop-blur-md flex items-center justify-center text-[10px] font-mono font-bold text-gray-800 shadow-md">
                  +88
                </div>

                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-md transition-transform hover:-translate-y-1 hover:scale-110 hover:z-50" style={{ zIndex: 5 - i }}>
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="viewer" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto mb-20 relative w-full h-[300px] rounded-[2.5rem] bg-white/40 border border-white/30 backdrop-blur-lg shadow-[0_15px_35px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.4)] z-10 flex items-center">
              <div className="pl-8 z-30 relative">
                <div className="text-base lg:text-lg font-mono font-black tracking-[0.2em] text-emerald-950/85 uppercase mb-5">
                  ROOM HIGHLIGHTS
                </div>
                <div className="space-y-4">
                  {['Live Teaching', 'Video, Audio & Chat', 'Distraction-Free'].map((text, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-950 border border-white/20 flex items-center justify-center shadow-md shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-base sm:text-lg lg:text-xl font-extrabold text-gray-900 tracking-tight">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Image src="/media/images/cameraman2.png" alt="Content Creation Room" width={600} height={800} className="absolute bottom-0 -right-8 sm:right-0 lg:right-0 h-[120%] sm:h-[160%] lg:h-[230%] w-auto object-contain pointer-events-none drop-shadow-[0_25px_25px_rgba(0,0,0,0.25)] z-20" />
            </div>

            <div className="absolute bottom-10 left-[4rem] z-20 flex items-end gap-1 h-12">
              {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 0.9, 0.5, 0.7, 0.4].map((h, i) => (
                <div key={i} className="w-1.5 bg-black/60 rounded-full animate-bounce" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>

            <Link href="/rooms" className="absolute bottom-10 right-12 z-40 px-8 py-4 bg-black hover:bg-gray-950 text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 border border-white/10">
              Enter Now
              <svg className="w-4 h-4 text-[#ff7759]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
            </Link>
          </div>

          <div
            ref={tradingCardRef}
            className="relative overflow-visible rounded-[2.5rem] bg-[#00b48c] p-8 sm:p-12 min-h-[600px] lg:min-h-[750px] flex flex-col justify-start border border-white/40 shadow-[0_20px_50px_rgba(0,180,140,0.25),inset_0_1px_3px_rgba(255,255,255,0.6)] will-change-transform"
          >
            {/* Background image covering card */}
            <img src="/assets/images/greenb1.jpg" alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[2.5rem] z-0" />

            {/* Constrained gloss reflection shine sweep (maintains card overflow-visible for the pop-out image!) */}
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none z-10">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/25 to-white/0 transform -skew-y-12 scale-150 opacity-40 translate-y-[-30%]" />
            </div>

            <div className="relative z-30">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-nanum font-black text-gray-950 tracking-[-0.04em] leading-[1.05] max-w-md">
                  Trading Room
                </h2>
                {/* <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/90 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider shadow-md shrink-0 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Active Floor
                </div> */}
              </div>

              <p className="text-sm sm:text-base text-gray-400/80 max-w-sm leading-relaxed font-normal mb-8">
                Host your private trading floor. Share live charts, strategies, and portfolios with members in real time.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 max-w-md">
                <div className="px-4 py-2 rounded-xl bg-black/90 border border-white/10 shadow-lg flex items-center gap-2.5 transition-transform hover:scale-105 font-mono text-xs"><span className="text-gray-400 font-bold">BTC</span><span className="text-emerald-400 font-bold">+4.20%</span></div>
                <div className="px-4 py-2 rounded-xl bg-black/90 border border-white/10 shadow-lg flex items-center gap-2.5 transition-transform hover:scale-105 font-mono text-xs"><span className="text-gray-400 font-bold">ETH</span><span className="text-emerald-400 font-bold">+2.80%</span></div>
                <div className="px-4 py-2 rounded-xl bg-black/90 border border-white/10 shadow-lg flex items-center gap-2.5 transition-transform hover:scale-105 font-mono text-xs"><span className="text-gray-400 font-bold">SOL</span><span className="text-emerald-400 font-bold">+8.10%</span></div>
                <div className="px-4 py-2 rounded-xl bg-black/90 border border-white/10 shadow-lg flex items-center gap-2.5 transition-transform hover:scale-105 font-mono text-xs"><span className="text-gray-400 font-bold">NVDA</span><span className="text-[#ff7759] font-bold">-0.40%</span></div>
              </div>
            </div>

            <div className="mt-auto relative w-full h-[320px] rounded-[2.5rem] bg-white/40 border border-white/30 backdrop-blur-lg shadow-[0_15px_35px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.4)] z-10 flex flex-col justify-center overflow-hidden">
              <div className="pl-8 z-30 relative">
                <div className="text-base lg:text-lg font-mono font-black tracking-[0.2em] text-emerald-950/85 uppercase mb-5">
                  TRADING UTILITIES
                </div>
                <div className="space-y-4">
                  {['Live Chart Sharing', 'Strategy Breakdown', 'Membership Control'].map((text, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-950 border border-white/20 flex items-center justify-center shadow-md shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-base sm:text-lg lg:text-xl font-extrabold text-gray-900 tracking-tight">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-32 opacity-30 pointer-events-none"><svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none"><path d="M0 80 Q 50 20, 100 70 T 200 30 T 300 60 T 400 10" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-700" /></svg></div>
            </div>

            <Image ref={tradingImageRef} src="/media/images/gustavo1.png" alt="Trader" width={700} height={900} className="absolute bottom-[89px] md:bottom-0 right-0 md:right-0 lg:right-0 h-[84%] md:h-[110%] lg:h-[108%] w-auto object-contain pointer-events-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] z-20 will-change-transform" />

            <Link href="/rooms" className="absolute bottom-10 right-10 z-40 px-8 py-4 bg-black hover:bg-gray-950 text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 border border-white/10">
              Join Floor
              <svg className="w-4 h-4 text-[#ff7759]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}