'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

export default function RollingCardsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    const cards = gsap.utils.toArray<HTMLElement>('.roll-card')

    cards.forEach((card, i) => {
      const defaultContent =
        card.querySelector<HTMLElement>('.default-content')
      const hoverContent =
        card.querySelector<HTMLElement>('.hover-content')

      if (!defaultContent || !hoverContent) return

      const dir = i % 2 === 0 ? 1 : -1 // alternate direction

      /* ---------------- INITIAL STATES ---------------- */

      gsap.set(card, {
        transformPerspective: 1200,
        transformOrigin: 'center center',
      })

      gsap.set(hoverContent, {
        y: card.offsetHeight,
      })

      /* ---------------- SCROLL ROLLING MOTION ---------------- */

      gsap.fromTo(
        card,
        {
          scale: 0.9,
          x: dir * -150,
          y: 120,
          rotation: dir * -60,
          rotationY: dir * 15,
        },
        {
          scale: 1,
          x: 0,
          y: 0,

          // ⭐ TRUE CLOCKWISE ROLL
          rotation: dir * 20,

          rotationY: 0,
          ease: 'none',

          motionPath: {
            path: [
              { x: dir * 200, y: 180 },
              { x: dir * 90, y: 60 },
              { x: 0, y: 0 },
            ],
            curviness: 2.2,
            autoRotate: false,
            relative: true,
          },

          scrollTrigger: {
            trigger: card,
            start: 'top 95%',
            end: 'top -90%',
            scrub: true,
            invalidateOnRefresh: true,
             markers: false, // Enable markers for debugging
          },
        }
      )

      /* ---------------- HOVER ANIMATION ---------------- */

      const hoverTl = gsap.timeline({ paused: true })

      hoverTl
        .to(defaultContent, {
          y: -card.offsetHeight,
          duration: 0.45,
          ease: 'power2.inOut',
        })
        .to(
          hoverContent,
          {
            y: 0,
            duration: 0.45,
            ease: 'power2.inOut',
          },
          0
        )
        .to(
          card,
          {
            backgroundColor: '#052e16',
            duration: 0.45,
          },
          0
        )

      card.addEventListener('mouseenter', () => hoverTl.play())
      card.addEventListener('mouseleave', () => hoverTl.reverse())

      /* ---------------- THIRD CARD EXTRA ANIMATION (SPIRAL) ---------------- */
      if (i === 2) {
        const spiralSvg = document.querySelector('#spiral-svg')
        const spiralPath = document.querySelector('#spiral-path')
        const spiralArrow = document.querySelector('#spiral-arrowhead')
        const solutionsBtn = document.querySelector('#solutions-btn')

        if (spiralSvg && spiralPath && spiralArrow && solutionsBtn) {
          gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: 'top 55%',
              end: 'top 0%',
              scrub: 1,
              markers: false,
            }
          })
            .to(spiralSvg, { opacity: 1, duration: 0.2 })
            .to(spiralPath, { strokeDashoffset: 0, duration: 1, ease: 'power1.inOut' }, 0)
            .to(spiralArrow, { opacity: 1, duration: 0.1 }, 0.8)
            .to(solutionsBtn, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }, 0.5)
        }
      }
    })
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[40vh]  bg-gradient-to-b from-[#f5f6f2] via-[#aab38e] to-[#f5f6f2]"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 flex flex-col gap-40">

        {/* CARD 1 */}
        <Card
          align="self-start"
          offset="-ml-16 lg:-ml-24"
          title="Maximize Your Earnings"
          text="Stop giving away your best insights for free on platforms that don’t pay you what you’re worth. Our ecosystem helps you convert expertise into premium revenue."
          hoverTitle="Unlock Potential"
          hoverText="Experience diversified income through subscriptions, downloads, and exclusive room access while the platform handles growth."
        />

        {/* CARD 2 */}
        <Card
          align="ml-auto"
          offset="-mr-26 lg:-mr-24"
          title="Impactful Live Connection"
          text="Bring your community to life with interactive live sessions that allow participation, discussion, and real growth."
          hoverTitle="Maximize Efficiency"
          hoverText="Transform followers into a thriving community through immersive workshops and live collaboration."
        />

        {/* CARD 3 */}
       <div className="relative">
        <Card
          id="card-3"
          align="self-center"
          offset="-ml-24"
          showPlus
          title="Your Vision, Managed"
          text="Manage scheduling, video libraries, and audience engagement from one centralized dashboard."
          hoverTitle="Drive Innovation"
          hoverText="Scale influence using automation tools designed to grow with your audience."
        />

  {/* Spiral SVG */}
  <svg
    id="spiral-svg"
    className="absolute top-[422px] left-[340px] opacity-0"
    width="350"
    height="250"
    viewBox="0 0 350 250"
    fill="none"
  >
    <path
      id="spiral-path"
      d="M10,40 C80,40 120,80 140,120 C160,160 120,200 100,180 C80,160 120,100 200,100 C280,100 320,150 330,220"
      stroke="#052e16"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="1000"
      strokeDashoffset="1000"
    />
    <path
      id="spiral-arrowhead"
      d="M315,205 L330,220 L345,205"
      stroke="#052e16"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-0"
    />
  </svg>

  {/* Solutions Button Positioned Exactly Near Arrowhead */}
  <button
    id="solutions-btn"
    className="absolute top-[670px] left-[570px] flex items-center gap-5 bg-[#052e16] text-white px-10 py-3 rounded-full shadow-2xl opacity-0"
  >
    <div className="w-12 h-12 bg-[#2dd4bf] rounded-full flex items-center justify-center shadow-inner">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#052e16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v7" />
        <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" />
        <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.82-2.82L7 15" />
      </svg>
    </div>
    <span className="text-2xl font-bold tracking-tight">Solutions</span>
  </button>
</div>

      </div>

      {/* BOTTOM SECTION */}
   <div className="max-w-5xl mx-auto px-6 pt-80 pb-80 text-center">
  <h2 className="flex flex-col items-center text-center font-normal text-gray-900 tracking-[-0.05em] font-montserrat leading-[1.1] text-[clamp(1.8rem,7vw,5rem)]">
    
    {/* First line: all in one row */}
    <span className="flex items-center gap-4 whitespace-nowrap">
      Powering
      <span className="inline-block w-[2.1em] h-[1.4em] mx-1 align-middle rounded-lg overflow-hidden bg-gray-200 relative -top-[0.05em]">
        <img src="/assets/images/mobile_ad.png" alt="Mobile Ad performance" className="w-full h-full object-cover" />
      </span>
      ad performance for
    </span>

    {/* Second line */}
    <span className="flex items-center gap-4 mt-2 whitespace-nowrap">
      global brands
      <span className="inline-block w-[2.1em] h-[1.4em] mx-1 align-middle rounded-lg overflow-hidden bg-gray-200 relative -top-[0.05em]">
        <img src="/assets/images/product_creative.png" alt="Product creative" className="w-full h-full object-cover" />
      </span>
    </span>

  </h2>
</div>
    </section>
  )
}

/* ---------------- CARD COMPONENT ---------------- */

function Card({
  id,
  align,
  offset,
  showPlus,
  title,
  text,
  hoverTitle,
  hoverText,
}: {
  id?: string
  align: string
  offset?: string
  showPlus?: boolean
  title: string
  text: string
  hoverTitle: string
  hoverText: string
}) {
  return (
    <div
      id={id}
      // bg-gradient-to-br from-teal-600 via-emerald-200 to-emerald-300 
      className={`roll-card w-[30rem] h-[28rem] bg-gradient-to-t from-emerald-950 via-emerald-700 to-[#EADBC8] rounded-3xl p-8 shadow-xl overflow-hidden relative cursor-pointer ${align} ${offset}`}
    >
      <div className="relative h-full flex flex-col">
        <div className="default-content">
          <h3 className="text-3xl md:text-6xl font-bold tracking-wide text-gray-900">{title}</h3>
          <p className="text-base text-lg md:text-2xl tracking-normal text-gray-900 mt-3 text-justify">
            {text}
          </p>
        </div>

        <div className="hover-content absolute inset-0 px-2">
          <h3 className="text-3xl md:text-6xl font-bold tracking-wide text-white">
            {hoverTitle}
          </h3>
          <p className="text-base text-lg md:text-2xl tracking-normal text-white mt-3 text-justify">
            {hoverText}
          </p>
        </div>

        {showPlus && (
          <div className="absolute bottom-10 right-10 text-gray-900">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}