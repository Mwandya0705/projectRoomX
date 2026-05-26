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
      let mm = gsap.matchMedia()

      mm.add("(min-width: 768px)", () => {
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
          x: '-180%',
          ease: 'none',
        }).to(
          lineRightRef.current,
          {
            x: '180%',
            ease: 'none',
          },
          '<'
        )
      })

      mm.add("(max-width: 767px)", () => { /* Scroll animation disabled on mobile */ })
    },
    { scope: heroRef }
  )



  return (
    <div className="bg-[#f5f6f2] overflow-x-clip">
      {/* ================= SECTION 1: HERO ================= */}
      <section
        ref={heroRef}
        className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-8 lg:px-12 xl:px-16 overflow-hidden pb-12 pt-20 md:pt-48 xl:pt-40 [@media(max-height:800px)]:pt-40"
      >
        <h1 className="flex flex-col items-center text-center font-extrabold lg:font-light text-gray-900 tracking-[-0.04em] font-nanum leading-[1.1] md:leading-[1.05] text-[clamp(2rem,7vw,2.8rem)] md:text-[clamp(2.4rem,6.5vw,4.5rem)] lg:text-[clamp(2.8rem,5.5vw,5rem)] xl:text-[clamp(3.5rem,5.2vw,5.8rem)] px-4 short-screen-hero-h1 portrait-hero-h1">
          <span ref={lineLeftRef} className="block will-change-transform whitespace-normal xl:whitespace-nowrap flex flex-wrap justify-center items-center text-center max-w-full gap-y-1 short-screen-hero-span portrait-hero-span">
            Welcome{' '}
            <span className="inline-block w-[1.1em] h-[1.1em] mx-1.5 align-middle rounded-[12px] overflow-hidden bg-gray-200 relative -top-[0.05em] shadow-sm shrink-0">
              <img src="/media/images/afro.jpg" alt="" className="w-full h-full object-cover" />
            </span>
            to the AI era
          </span>

          <span ref={lineRightRef} className="block will-change-transform mt-3 whitespace-normal xl:whitespace-nowrap flex flex-wrap justify-center items-center text-center max-w-full gap-y-1 short-screen-hero-span portrait-hero-span">
            Content creation rooms & live trading{' '}
            <span
              className="inline-block w-[1.6em] h-[1.1em] mx-1.5 align-middle rounded-[12px] overflow-hidden relative -top-[0.05em] shadow-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #f472b6 100%)' }}
            >
              <img src="/media/images/trader.jpg" alt="" className="w-full h-full object-cover" />
            </span>
          </span>
        </h1>

        <p className="mt-10 text-center text-gray-700/90 max-w-2xl text-[14px] sm:text-[14px] md:text-[14px] lg:text-[22px] leading-relaxed px-4 font-sans tracking-wide font-medium">
          A complete, AI-powered solution helping creators improve engagement and streamline their live workflows.
        </p>

        <div className="mt-10">
          {!user ? (
            <Link href="/book-a-demo" className="inline-block px-5 py-2.5 sm:px-8 sm:py-3.5 rounded-full bg-emerald-950 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider hover:bg-[#003c33] transition-all shadow-md hover:scale-105 active:scale-95">
               Get a demo
            </Link>
          ) : (
            <Link href="/dashboard/studio" className="inline-block px-5 py-2.5 sm:px-8 sm:py-3.5 rounded-full bg-emerald-950 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider hover:bg-[#003c33] transition-all shadow-md hover:scale-105 active:scale-95">
              Go to AI Studio
            </Link>
          )}
        </div>
      </section>

      {/* ================= SECTION 2: CARDS ================= */}
      <section
        className="relative overflow-visible pt-0 pb-24 -mt-1 lg:-mt-1 z-10 contain-inline"
      >
        <div className="grid gap-6 xl:grid-cols-2 w-full max-w-[1850px] mx-auto px-4 lg:px-10">

          <div
            className="relative overflow-hidden rounded-[2.5rem] bg-[#0c0c0e] pt-6 pb-6 px-4 sm:px-10 lg:px-12 min-h-[600px] xl:min-h-[750px] flex flex-col justify-start border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_40px_rgba(239,68,68,0.08),inset_0_1px_2px_rgba(255,255,255,0.05)] will-change-transform group/card"
          >
            {/* Background image covering card */}
            <img src="/assets/images/creatorsbg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[2.5rem] z-0 opacity-85 transition-transform duration-700 group-hover/card:scale-102" />

            {/* Gloss reflection shine sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none transform -skew-y-12 scale-150 opacity-20 translate-y-[-30%] z-10" />

            {/* Top-Right Absolute Live Studio Badge */}
            <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-40 flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-zinc-950/85 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.2)] backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              Live Studio
            </div>

            <div className="relative z-30">
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-nanum font-black text-white tracking-[-0.04em] leading-[1.05] max-w-md drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  Creators <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-200">Room</span>
                </h2>
              </div>

              <p className="text-xs sm:text-base text-zinc-300 max-w-sm leading-relaxed font-normal font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                Run a private interactive studio for your fans. Teach, build, or create live in a gorgeous distraction-free environment.
              </p>

              <div className="relative mt-6 sm:mt-8 ml-4 flex items-center justify-end flex-row-reverse -space-x-3 space-x-reverse">
                <div className="z-10 w-10 h-10 rounded-full border-2 border-red-500/20 bg-red-950/80 backdrop-blur-md flex items-center justify-center text-[10px] font-mono font-bold text-red-200 shadow-md">
                  +88
                </div>

                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative w-10 h-10 rounded-full border-2 border-zinc-900 overflow-hidden shadow-md transition-transform hover:-translate-y-1 hover:scale-110 hover:z-50 hover:border-red-500" style={{ zIndex: 5 - i }}>
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="viewer" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Room Highlights horizontal status grid */}
            <div className="mt-auto mb-16 sm:mb-24 relative w-full rounded-[2rem] bg-zinc-950/45 border border-white/10 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)] z-10 p-4 sm:p-6 overflow-hidden">
              <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] text-red-400 uppercase mb-4">
                STUDIO CAPABILITIES
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {['Live Teaching', 'Video, Audio & Chat', 'Distraction-Free'].map((text, idx) => (
                  <div key={idx} className="flex items-center gap-2 sm:gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5 sm:p-3 hover:bg-white/[0.05] transition-all duration-300">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shadow-md shrink-0">
                      <svg className="w-2.5 h-2.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[10px] sm:text-xs lg:text-sm font-extrabold text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden sm:flex absolute bottom-10 left-[2rem] lg:left-[4rem] z-20 items-end gap-1.5 h-12">
              {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 0.9, 0.5, 0.7, 0.4, 0.8, 0.5, 0.9, 0.6].map((h, i) => (
                <div key={i} className="w-1 bg-gradient-to-t from-red-600 via-rose-500 to-amber-400 rounded-full animate-bounce" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.08}s` }}></div>
              ))}
            </div>

            <Link href="/rooms" className="absolute bottom-4 sm:bottom-10 right-4 sm:right-12 z-40 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-[0_4px_20px_rgba(239,68,68,0.25),0_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 duration-300">
              Enter Now
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
            </Link>
          </div>

          <div
            className="relative overflow-hidden rounded-[2.5rem] bg-[#0a1215] pt-6 pb-6 px-4 sm:px-10 lg:px-12 min-h-[600px] xl:min-h-[750px] flex flex-col justify-start border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_40px_rgba(16,185,129,0.08),inset_0_1px_2px_rgba(255,255,255,0.05)] will-change-transform group/card"
          >
            {/* Background image covering card */}
            <img src="/assets/images/tradersbg1.jpg" alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[2.5rem] z-0 opacity-80 transition-transform duration-700 group-hover/card:scale-102" />

            {/* Gloss reflection shine sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none transform -skew-y-12 scale-150 opacity-20 translate-y-[-30%] z-10" />

            {/* Top-Right Absolute Live Floor Badge */}
            <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-40 flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-zinc-950/85 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Floor
            </div>

            <div className="relative z-30">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-nanum font-black text-white tracking-[-0.04em] leading-[1.05] max-w-md drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  Trading <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200">Room</span>
                </h2>
              </div>

              <p className="text-xs sm:text-base text-zinc-300 max-w-sm leading-relaxed font-normal font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                Host your private trading floor. Share live charts, strategies, and portfolios with members in real time.
              </p>

              <div className="mt-6 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3 max-w-md">
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-zinc-950/95 border border-white/5 shadow-md flex items-center gap-2 transition-all hover:scale-105 font-mono text-[10px] sm:text-xs"><span className="text-gray-400 font-bold">BTC</span><span className="text-emerald-400 font-bold">+4.20%</span></div>
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-zinc-950/95 border border-white/5 shadow-md flex items-center gap-2 transition-all hover:scale-105 font-mono text-[10px] sm:text-xs"><span className="text-gray-400 font-bold">ETH</span><span className="text-emerald-400 font-bold">+2.80%</span></div>
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-zinc-950/95 border border-white/5 shadow-md flex items-center gap-2 transition-all hover:scale-105 font-mono text-[10px] sm:text-xs"><span className="text-gray-400 font-bold">SOL</span><span className="text-emerald-400 font-bold">+8.10%</span></div>
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-zinc-950/95 border border-white/5 shadow-md flex items-center gap-2 transition-all hover:scale-105 font-mono text-[10px] sm:text-xs"><span className="text-gray-400 font-bold">NVDA</span><span className="text-[#ff7759] font-bold">-0.40%</span></div>
              </div>
            </div>

            {/* Trading Utilities horizontal status grid */}
            <div className="mt-auto mb-16 sm:mb-24 relative w-full rounded-[2rem] bg-zinc-950/45 border border-white/10 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)] z-10 p-4 sm:p-6 overflow-hidden">
              <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] text-emerald-400 uppercase mb-4">
                TRADING UTILITIES
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {['Live Chart Sharing', 'Strategy Breakdown', 'Membership Control'].map((text, idx) => (
                  <div key={idx} className="flex items-center gap-2 sm:gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5 sm:p-3 hover:bg-white/[0.05] transition-all duration-300">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-md shrink-0">
                      <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[10px] sm:text-xs lg:text-sm font-extrabold text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{text}</span>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 w-full h-12 opacity-15 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <path d="M0 80 Q 50 20, 100 70 T 200 30 T 300 60 T 400 10" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-400" />
                </svg>
              </div>
            </div>

            <div className="hidden sm:flex absolute bottom-10 left-[2rem] lg:left-[4rem] z-20 items-end gap-1.5 h-12">
              {[0.6, 0.4, 0.8, 0.5, 0.9, 0.7, 0.5, 0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.8, 0.6].map((h, i) => (
                <div key={i} className="w-1 bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 rounded-full animate-bounce" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>

            <Link href="/rooms" className="absolute bottom-4 sm:bottom-10 right-4 sm:right-12 z-40 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-[0_4px_20px_rgba(16,185,129,0.25),0_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 duration-300">
              Join Floor
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}