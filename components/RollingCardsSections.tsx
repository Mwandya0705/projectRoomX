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

    const mm = gsap.matchMedia(sectionRef)

    // ── DESKTOP GSAP ANIMATION (screens >= 1024px) ──
    mm.add("(min-width: 1024px)", () => {
      const cards = gsap.utils.toArray<HTMLElement>('.roll-card-desktop')

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

        const onMouseEnter = () => hoverTl.play()
        const onMouseLeave = () => hoverTl.reverse()

        card.addEventListener('mouseenter', onMouseEnter)
        card.addEventListener('mouseleave', onMouseLeave)

        if (i === 2) {
          const spiralSvg = document.querySelector('#spiral-svg')
          const spiralPath = document.querySelector('#spiral-path')
          const spiralArrow = document.querySelector('#spiral-arrowhead')
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
            if (spiralSvg && spiralPath && spiralArrow) {
              tl.to(spiralSvg, { opacity: 1, duration: 0.2 }, 0)
                .to(spiralPath, { strokeDashoffset: 0, duration: 1, ease: 'power1.inOut' }, 0)
                .to(spiralArrow, { opacity: 1, duration: 0.1 }, 0.8)
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

              const onBtnEnter = () => btnTl.play()
              const onBtnLeave = () => btnTl.reverse()

              solutionsBtn.addEventListener('mouseenter', onBtnEnter)
              solutionsBtn.addEventListener('mouseleave', onBtnLeave)
            }
          }
        }
      })
    })

    // ── MOBILE/TABLET GSAP ANIMATION (screens < 1024px) ──
    mm.add("(max-width: 1023px)", () => {
      const mobileCards = gsap.utils.toArray<HTMLElement>('.mobile-deck-card')
      const pinContainer = document.querySelector('.mobile-pin-container')
      const mobileCta = document.querySelector('.mobile-cta-btn')

      if (!mobileCards.length || !pinContainer) return

      // Set initial states for mobile stacking effect
      gsap.set(mobileCards[0], {
        y: 0,
        scale: 1,
        z: 0,
        rotation: 0,
        opacity: 1,
        transformOrigin: "center center",
      })

      gsap.set(mobileCards.slice(1), {
        y: 500,
        scale: 0.85,
        rotation: (i) => (i % 2 === 0 ? 8 : -8),
        opacity: 0,
        transformOrigin: "center center",
      })

      if (mobileCta) {
        gsap.set(mobileCta, {
          y: 40,
          scale: 0.8,
          opacity: 0,
        })
      }

      // Create scroll timeline pinning the section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinContainer,
          start: "top top",
          end: "+=220%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      })

      // Slide up Card 1 (second benefit)
      tl.to(mobileCards[0], {
        scale: 0.92,
        y: -20,
        rotation: -3,
        opacity: 0.5,
        duration: 1,
        ease: "power2.out",
      }, 0)
      .to(mobileCards[1], {
        y: 0,
        scale: 1,
        rotation: 2,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      }, 0)

      // Slide up Card 2 (third benefit)
      tl.to(mobileCards[0], {
        scale: 0.85,
        y: -40,
        opacity: 0, // fully hide card 0 behind stack
        duration: 1,
        ease: "power2.out",
      }, 1)
      .to(mobileCards[1], {
        scale: 0.92,
        y: -20,
        rotation: 3,
        opacity: 0.5,
        duration: 1,
        ease: "power2.out",
      }, 1)
      .to(mobileCards[2], {
        y: 0,
        scale: 1,
        rotation: -1,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      }, 1)

      // Animate Solutions Button in
      if (mobileCta) {
        tl.to(mobileCta, {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.5)",
        }, 1.8)
      }
    })

    return () => mm.revert()
  }, { scope: sectionRef })

  const handleSolutionsNavigate = () => {
    if (solutionsTlRef.current) {
      solutionsTlRef.current.pause(0)
    }
    router.push('/book-a-demo')
  }

  return (
    <section
      ref={sectionRef}
      id="rolling-section"
      className="relative bg-cover bg-center bg-no-repeat bg-fixed overflow-x-clip"
      style={{ backgroundImage: 'url("/assets/images/green19.jpg")' }}
    >
      {/* ── DESKTOP EXPERIENCE (screens >= 1024px) ── */}
      <div className="hidden lg:flex relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-32 flex-col gap-40">
        <Card
          align="self-start"
          offset="ml-4 sm:ml-9 lg:-ml-24"
          title="Maximize Your Earnings"
          text="Stop giving away your best insights for free on platforms that don’t pay you what you’re worth. Our ecosystem helps you convert expertise into premium revenue."
          hoverTitle="Unlock Potential"
          hoverText="Experience diversified income through subscriptions, downloads, and exclusive room access while the platform handles growth."
        />

        <Card
          align="self-end"
          offset="mr-4 sm:mr-9 lg:-mr-24"
          title="Impactful Live Connection"
          text="Bring your community to life with interactive live sessions that allow participation, discussion, and real growth."
          hoverTitle="Maximize Efficiency"
          hoverText="Transform followers into a thriving community through immersive workshops and live collaboration."
        />

        <div className="relative flex flex-col items-start w-full">
          <Card
            id="card-3"
            align="self-start"
            offset="ml-4 sm:ml-9 lg:-ml-24"
            showPlus
            title="Your Vision, Managed"
            text="Manage scheduling, video libraries, and audience engagement from one centralized dashboard."
            hoverTitle="Drive Innovation"
            hoverText="Scale influence using automation tools designed to grow with your audience."
          />

          {/* Desktop spiral */}
          <svg id="spiral-svg" className="hidden lg:block absolute top-[422px] left-[294px] opacity-0" width="350" height="250" viewBox="0 0 350 250" fill="none">
            <path id="spiral-path" d="M10,40 C80,40 120,80 140,120 C160,160 120,200 100,180 C80,160 120,100 200,100 C280,100 320,150 330,220" stroke="#052e16" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset="1000" />
            <path id="spiral-arrowhead" d="M315,205 L330,220 L345,205" stroke="#052e16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-0" />
          </svg>

          {/* Desktop Solutions Button */}
          <div
            id="solutions-btn"
            onClick={handleSolutionsNavigate}
            style={{ viewTransitionName: 'none' } as any}
            className="absolute top-[650px] left-[570px] flex items-center gap-2 bg-[#052e16] text-white pl-2 pr-5 py-2 rounded-full shadow-2xl opacity-0 cursor-pointer z-20 hover:bg-black select-none whitespace-nowrap"
          >
            <div className="w-14 h-14 bg-gradient-to-t from-blue-900 via-[#2dd4bf] to-[#2dd4bf] rounded-full flex items-center justify-center shadow-inner ">
              <MousePointer2 className="w-1/2 h-1/2 fill-current" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Solutions</span>
          </div>
        </div>
      </div>

      {/* ── MOBILE/TABLET EXPERIENCE (screens < 1024px) ── */}
      <div className="block lg:hidden w-full relative z-20">
        <div className="mobile-pin-container relative w-full h-[100dvh] flex flex-col justify-start items-center overflow-hidden py-8 px-4">
          
          {/* Subtle elegant dark overlay for readability */}
          <div className="absolute inset-0 bg-black/40 z-0" />

          {/* Header */}
          <div className="relative z-10 text-center max-w-sm mt-4 mb-2">
            <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/20">
              The RoomX Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 sm:mt-3 tracking-tight drop-shadow-md font-montserrat">
              Designed to Empower You
            </h2>
          </div>

          {/* Cards Stack */}
          <div className="relative z-10 flex-1 w-full max-w-[310px] sm:max-w-[360px] flex justify-center items-center my-4 min-h-[300px]">
            <MobileCard
              index={1}
              title="Maximize Your Earnings"
              text="Stop giving away your best insights for free on platforms that don’t pay you what you’re worth. Our ecosystem helps you convert expertise into premium revenue."
              hoverTitle="Unlock Potential"
              hoverText="Experience diversified income through subscriptions, downloads, and exclusive room access while the platform handles growth."
              icon="💰"
              gradient="bg-gradient-to-br from-[#063e1e]/95 via-[#0e502a]/95 to-[#166534]/95"
              glowColor="rgba(16, 185, 129, 0.12)"
            />

            <MobileCard
              index={2}
              title="Impactful Live Connection"
              text="Bring your community to life with interactive live sessions that allow participation, discussion, and real growth."
              hoverTitle="Maximize Efficiency"
              hoverText="Transform followers into a thriving community through immersive workshops and live collaboration."
              icon="⚡"
              gradient="bg-gradient-to-br from-[#0a1e3f]/95 via-[#102d59]/95 to-[#193e73]/95"
              glowColor="rgba(59, 130, 246, 0.12)"
            />

            <MobileCard
              index={3}
              title="Your Vision, Managed"
              text="Manage scheduling, video libraries, and audience engagement from one centralized dashboard."
              hoverTitle="Drive Innovation"
              hoverText="Scale influence using automation tools designed to grow with your audience."
              icon="⚙️"
              gradient="bg-gradient-to-br from-[#27272a]/95 via-[#3f3f46]/95 to-[#52525b]/95"
              glowColor="rgba(245, 158, 11, 0.12)"
            />
          </div>

          {/* Mobile CTA */}
          <div className="mobile-cta-btn relative z-10 w-full flex justify-center pb-2">
            <button
              onClick={handleSolutionsNavigate}
              className="flex items-center gap-3 bg-white text-[#052e16] pl-3 pr-6 py-2 rounded-full shadow-2xl cursor-pointer hover:bg-emerald-50 select-none whitespace-nowrap active:scale-95 transition-transform border border-emerald-500/20 font-bold"
            >
              <div className="w-9 h-9 bg-gradient-to-t from-blue-900 via-[#2dd4bf] to-[#2dd4bf] rounded-full flex items-center justify-center text-white shadow-inner shrink-0">
                <MousePointer2 className="w-4.5 h-4.5 fill-current rotate-90" />
              </div>
              <span className="text-sm sm:text-base font-extrabold tracking-tight">Explore Solutions</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── DESKTOP BRANDING FOOTER (hidden on mobile/tablet) ── */}
      <div className="hidden lg:block max-w-5xl mx-auto px-6 pt-80 pb-80 text-center">
        <h2 className="flex flex-col items-center text-center font-normal text-gray-900 tracking-[-0.05em] font-montserrat leading-[1.1] text-[clamp(1.8rem,7vw,5rem)] px-4">
          <span className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 md:whitespace-nowrap">
            Powering
            <span className="inline-block w-[2.1em] h-[1.4em] mx-1 align-middle rounded-lg overflow-hidden bg-gray-200 relative -top-[0.05em] shrink-0">
              <img src="/assets/images/mobile_ad.png" alt="Mobile Ad performance" className="w-full h-full object-cover" />
            </span>
            ad performance for
          </span>
          <span className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 mt-2 md:whitespace-nowrap">
            global brands
            <span className="inline-block w-[2.1em] h-[1.4em] mx-1 align-middle rounded-lg overflow-hidden bg-gray-200 relative -top-[0.05em] shrink-0">
              <img src="/assets/images/product_creative.png" alt="Product creative" className="w-full h-full object-cover" />
            </span>
          </span>
        </h2>
      </div>
    </section>
  )
}

// ── DESKTOP-SPECIFIC CARD COMPONENT ──
function Card({ id, align, offset, showPlus, title, text, hoverTitle, hoverText }: any) {
  return (
    <div
      id={id}
      className={`roll-card-desktop block w-[calc(100vw-3rem)] h-[calc(100vw-3rem)] sm:w-[18rem] sm:h-[18rem] lg:w-[27rem] lg:h-[27rem] max-w-[18rem] lg:max-w-none bg-gradient-to-t from-[#052e16] via-[#14469d]/40 to-[#EADBC8]/40 backdrop-blur-md border border-t border-r border-white/90 rounded-3xl p-6 lg:p-8 shadow-2xl overflow-hidden relative cursor-pointer font-satoshi ${align} ${offset}`}
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

// ── MOBILE-SPECIFIC CARD COMPONENT ──
interface MobileCardProps {
  index: number
  title: string
  text: string
  hoverTitle: string
  hoverText: string
  icon: string
  gradient: string
  glowColor: string
}

function MobileCard({ index, title, text, hoverTitle, hoverText, icon, gradient, glowColor }: MobileCardProps) {
  return (
    <div
      className="mobile-deck-card absolute w-full max-w-[310px] sm:max-w-[360px] h-[360px] sm:h-[420px] bg-cover backdrop-blur-xl border border-white/20 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col justify-between text-white select-none"
      style={{
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 30px ${glowColor}`,
      }}
    >
      <div className={gradient + " absolute inset-0 rounded-3xl -z-10 opacity-95"} />
      
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/40 font-mono text-[10px] sm:text-xs font-bold tracking-widest">
              0{index} / REVENUE
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/90 border border-white/15 backdrop-blur-md text-base shadow-inner">
              {icon}
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-2 leading-snug font-satoshi">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light font-satoshi">
            {text}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl p-3 sm:p-4 flex flex-col gap-1 shadow-inner border border-white/5">
          <span className="text-[10px] sm:text-xs uppercase font-extrabold text-white/95 tracking-wider flex items-center gap-1.5 font-satoshi">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {hoverTitle}
          </span>
          <p className="text-[11px] sm:text-xs text-white/70 leading-relaxed font-light font-satoshi">
            {hoverText}
          </p>
        </div>
      </div>
    </div>
  )
}