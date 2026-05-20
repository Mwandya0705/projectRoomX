'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { useGSAP } from '@gsap/react'
import { MousePointer2 } from 'lucide-react'
import { useTransitionRouter } from 'next-view-transitions'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

export default function RollingCardsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const solutionsTlRef = useRef<gsap.core.Timeline | null>(null)
  const router = useTransitionRouter()

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    const cards = gsap.utils.toArray<HTMLElement>('.roll-card')

    cards.forEach((card, i) => {
      const defaultContent = card.querySelector<HTMLElement>('.default-content')
      const hoverContent = card.querySelector<HTMLElement>('.hover-content')

      if (!defaultContent || !hoverContent) return

      const dir = i % 2 === 0 ? 1 : -1

      gsap.set(card, {
        transformPerspective: 1200,
        transformOrigin: 'center center',
      })

      gsap.set(hoverContent, {
        y: card.offsetHeight,
      })

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
            markers: false,
          },
        }
      )

      const hoverTl = gsap.timeline({ paused: true })
      hoverTl
        .to(defaultContent, {
          y: -card.offsetHeight,
          duration: 0.45,
          ease: 'power2.inOut',
        })
        .to(hoverContent, {
          y: 0,
          duration: 0.45,
          ease: 'power2.inOut',
        }, 0)
        .to(card, {
          backgroundColor: 'rgba(5, 46, 22, 0.7)',
          duration: 0.45,
        }, 0)

      card.addEventListener('mouseenter', () => hoverTl.play())
      card.addEventListener('mouseleave', () => hoverTl.reverse())

      if (i === 2) {
        const spiralSvg = document.querySelector('#spiral-svg')
        const spiralPath = document.querySelector('#spiral-path')
        const spiralArrow = document.querySelector('#spiral-arrowhead')
        // Mobile spiral elements
        const spiralSvgSm = document.querySelector('#spiral-svg-sm')
        const spiralPathSm = document.querySelector('#spiral-path-sm')
        const spiralArrowSm = document.querySelector('#spiral-arrowhead-sm')
        const solutionsBtn = document.querySelector('#solutions-btn')

        if (solutionsBtn) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: 'top 55%',
              end: 'top 0%',
              scrub: 1,
              markers: false,
            }
          })
          // Desktop spiral (lg)
          if (spiralSvg && spiralPath && spiralArrow) {
            tl.to(spiralSvg, { opacity: 1, duration: 0.2 }, 0)
              .to(spiralPath, { strokeDashoffset: 0, duration: 1, ease: 'power1.inOut' }, 0)
              .to(spiralArrow, { opacity: 1, duration: 0.1 }, 0.8)
          }
          // Mobile spiral (< lg)
          if (spiralSvgSm && spiralPathSm && spiralArrowSm) {
            tl.to(spiralSvgSm, { opacity: 1, duration: 0.2 }, 0)
              .to(spiralPathSm, { strokeDashoffset: 0, duration: 1, ease: 'power1.inOut' }, 0)
              .to(spiralArrowSm, { opacity: 1, duration: 0.1 }, 0.8)
          }
          tl.to(solutionsBtn, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }, 0.5)

          const iconWrapper = solutionsBtn.querySelector('div')
          const textWrapper = solutionsBtn.querySelector('span')

          if (iconWrapper && textWrapper) {
            const iconW = (iconWrapper as HTMLElement).offsetWidth
            const textW = (textWrapper as HTMLElement).offsetWidth
            const gap = 8

            const btnTl = gsap.timeline({ paused: true })
            btnTl
              .to(iconWrapper, { x: textW + gap, duration: 0.4, ease: 'power3.out' })
              .to(textWrapper, { x: -(iconW + gap), duration: 0.4, ease: 'power3.out' }, 0)
              .to(solutionsBtn, { paddingLeft: 12, paddingRight: 12, duration: 0.4, ease: 'power3.out' }, 0)

            solutionsTlRef.current = btnTl

            solutionsBtn.addEventListener('mouseenter', () => btnTl.play())
            solutionsBtn.addEventListener('mouseleave', () => btnTl.reverse())
          }
        }
      }
    })
  }, { scope: sectionRef })

  const handleSolutionsNavigate = () => {
    // 🛡️ STABILITY LOCK: Reset GSAP state before transition to prevent glitch
    if (solutionsTlRef.current) {
      solutionsTlRef.current.pause(0)
    }
    router.push('/book-a-demo')
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[40vh] bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: 'url("/assets/images/green19.jpg")' }}
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-32 flex flex-col gap-40">
        <Card
          align="self-start"
          offset="ml-9 lg:-ml-24"
          title="Maximize Your Earnings"
          text="Stop giving away your best insights for free on platforms that don’t pay you what you’re worth. Our ecosystem helps you convert expertise into premium revenue."
          hoverTitle="Unlock Potential"
          hoverText="Experience diversified income through subscriptions, downloads, and exclusive room access while the platform handles growth."
        />

        <Card
          align="self-end"
          offset="mr-9 lg:-mr-24"
          title="Impactful Live Connection"
          text="Bring your community to life with interactive live sessions that allow participation, discussion, and real growth."
          hoverTitle="Maximize Efficiency"
          hoverText="Transform followers into a thriving community through immersive workshops and live collaboration."
        />

        <div className="relative flex flex-col items-start w-full">
          <Card
            id="card-3"
            align="self-start"
            offset="ml-9 lg:-ml-24"
            showPlus
            title="Your Vision, Managed"
            text="Manage scheduling, video libraries, and audience engagement from one centralized dashboard."
            hoverTitle="Drive Innovation"
            hoverText="Scale influence using automation tools designed to grow with your audience."
          />

          {/* Desktop spiral — lg screens only */}
          <svg id="spiral-svg" className="hidden lg:block absolute top-[422px] left-[294px] opacity-0" width="350" height="250" viewBox="0 0 350 250" fill="none">
            <path id="spiral-path" d="M10,40 C80,40 120,80 140,120 C160,160 120,200 100,180 C80,160 120,100 200,100 C280,100 320,150 330,220" stroke="#052e16" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset="1000" />
            <path id="spiral-arrowhead" d="M315,205 L330,220 L345,205" stroke="#052e16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-0" />
          </svg>

          {/* Mobile spiral — smaller than lg — adjust top/left to position it */}
          <svg id="spiral-svg-sm" className="block lg:hidden absolute top-[21rem] left-[17rem] opacity-0" width="200" height="140" viewBox="0 0 200 140" fill="none">
            <path id="spiral-path-sm" d="M5,25 C45,25 70,50 80,70 C90,90 70,115 55,105 C40,90 70,55 115,55 C160,55 185,88 190,130" stroke="#052e16" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="600" strokeDashoffset="600" />
            <path id="spiral-arrowhead-sm" d="M178,118 L190,130 L202,118" stroke="#052e16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-0" />
          </svg>

          {/* Solutions Button with Stability Lock */}
          <div
            id="solutions-btn"
            onClick={handleSolutionsNavigate}
            style={{ viewTransitionName: 'none' } as any}
            className="absolute top-[19.5rem] left-[9rem] -translate-x-1/2 lg:translate-x-0 lg:top-[650px] lg:left-[570px] sm:top-[470px] sm:left-[530px] flex items-center gap-2 bg-[#052e16] text-white pl-2 pr-5 py-2 rounded-full shadow-2xl opacity-0 cursor-pointer z-20 hover:bg-black select-none whitespace-nowrap"
          >
            <div className="w-14 h-14 bg-gradient-to-t from-blue-900 via-[#2dd4bf] to-[#2dd4bf] rounded-full flex items-center justify-center shadow-inner ">
              <MousePointer2 className="w-1/2 h-1/2 fill-current" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Solutions</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-80 pb-80 text-center">
        <h2 className="flex flex-col items-center text-center font-normal text-gray-900 tracking-[-0.05em] font-montserrat leading-[1.1] text-[clamp(1.8rem,7vw,5rem)]">
          <span className="flex items-center gap-4 whitespace-nowrap">
            Powering
            <span className="inline-block w-[2.1em] h-[1.4em] mx-1 align-middle rounded-lg overflow-hidden bg-gray-200 relative -top-[0.05em]">
              <img src="/assets/images/mobile_ad.png" alt="Mobile Ad performance" className="w-full h-full object-cover" />
            </span>
            ad performance for
          </span>
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

function Card({ id, align, offset, showPlus, title, text, hoverTitle, hoverText }: any) {
  return (
    <div
      id={id}
      className={`roll-card block w-[18rem] h-[18rem] lg:w-[27rem] lg:h-[27rem] bg-gradient-to-t from-[#052e16] via-[#14469d]/40 to-[#EADBC8]/40 backdrop-blur-md border border-t border-r border-white/90 rounded-3xl p-6 lg:p-8 shadow-2xl overflow-hidden relative cursor-pointer font-satoshi ${align} ${offset}`}
    >
      <div className="relative h-full flex flex-col font-nanum">
        <div className="default-content font-satoshi">
          <h3 className="text-3xl sm:text-4xl lg:text-6xl tracking-tighter text-gray-900 font-satoshi leading-[0.9] mb-4">{title}</h3>
          <p className="text-normal text-base sm:text-lg lg:text-2xl tracking-tighter text-gray-900/90 mt-3 leading-[1.2] font-satoshi">{text}</p>
        </div>
        <div className="hover-content absolute inset-0 py-6 px-3 lg:py-8 lg:px-4 font-satoshi">
          <h3 className="text-3xl sm:text-4xl lg:text-6xl font-normal tracking-tighter text-white font-satoshi leading-[0.9] mb-4">{hoverTitle}</h3>
          <p className="text-normal text-base sm:text-lg lg:text-2xl tracking-tighter text-white/90 mt-3 leading-[1.2] font-satoshi">{hoverText}</p>
        </div>
        {showPlus && (
          <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 text-gray-900">
            <svg width="40" height="40" className="sm:w-[60px] sm:h-[60px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}