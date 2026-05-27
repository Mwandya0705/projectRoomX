'use client'

import Image from 'next/image'
import { Link } from 'next-view-transitions'
import { useRef, useState } from 'react'
import { useTransitionRouter } from 'next-view-transitions'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { MousePointer2 } from 'lucide-react'

export default function FooterDetails() {
  return (
    <footer className="w-full">
      {/* ================= CTA STRIP ================= */}
      <div className="relative py-20 text-center bg-gradient-to-r from-purple-300 via-teal-200 to-emerald-300 border-b border-black/5">
        <div className="max-w-[1850px] mx-auto px-4 lg:px-12 flex flex-col items-center justify-center gap-8">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-nanum font-normal text-gray-950 tracking-[-0.03em] leading-tight">
            Enter a new era of <span className="font-bold">Monetizing</span>
          </h2>

          <div className="shrink-0">
            <AnimatedDemoButton text="Book a demo" href="/book-a-demo" />
          </div>
        </div>
      </div>

      {/* ================= MAIN FOOTER ================= */}
      <div className="bg-[#062b2a] text-white py-20 border-t border-white/5 relative overflow-hidden">
        {/* Subtle background glow for Cohere flavor */}
        <div className="absolute top-0 right-1/4 w-[450px] h-[450px] rounded-full bg-white/[0.02] blur-[120px] pointer-events-none" />

        <div className="max-w-[1850px] mx-auto px-4 lg:px-12 flex flex-col lg:flex-row lg:justify-between gap-16 relative z-10">
          
          {/* Brand & Partners Block (Left) */}
          <div className="flex flex-col justify-between space-y-10 lg:max-w-md">
            <div>
              {/* Bold RoomX branding */}
              <Link 
                href="/" 
                className="text-4xl font-nanum font-bold tracking-[-0.02em] hover:opacity-90 transition-opacity"
              >
                <span className="text-white">Room</span><span className="text-emerald-500">X</span>
              </Link>
              <p className="text-base sm:text-lg text-white/70 mt-5 leading-relaxed max-w-[360px]">
                Interactive private spaces for creators, traders, and communities to run premium live studios.
              </p>
            </div>

            {/* Compact Monochrome Partners */}
            <div className="flex items-center gap-8 border-t border-white/10 pt-8">
              <div className="flex items-center gap-3">
                <Image src="/assets/logos/meta.svg" alt="Meta Partner" width={36} height={28} className="opacity-60 hover:opacity-100 transition-opacity filter brightness-200" />
                <span className="text-xs sm:text-sm font-mono font-bold text-white/50 tracking-wider">META PARTNER</span>
              </div>
              <div className="flex items-center gap-3">
                <Image src="/assets/logos/google.svg" alt="Google Partner" width={20} height={28} className="opacity-60 hover:opacity-100 transition-opacity filter brightness-200" />
                <span className="text-xs sm:text-sm font-mono font-bold text-white/50 tracking-wider">GOOGLE PARTNER</span>
              </div>
            </div>
          </div>

          {/* Links Grid Columns (Right) */}
          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-0 lg:gap-10 lg:min-w-[65%]">
            <FooterColumn title="Products" links={['Prism', 'Adroom', 'Integrations', 'Compliance']} hrefs={['/products/prism', '/products/adroom', '/knowledge-hub/integrations', '/knowledge-hub/compliance']} />
            <FooterColumn title="Solutions" links={['By team', 'By use case', 'By industry']} hrefs={['/solutions/team', '/solutions/use-case', '/solutions/industry']} />
            <FooterColumn title="Peer Stories" links={['Featured', 'Community', 'Tutorials']} hrefs={['/peer-stories/featured', '/peer-stories/community', '/peer-stories/tutorials']} />
            <FooterColumn title="Knowledge Hub" links={['Blog', 'Resources', 'Docs', 'FAQ']} hrefs={['/company/blog', '/knowledge-hub/learning', '/knowledge-hub/docs', '/knowledge-hub/docs']} />
            <FooterColumn title="Company" links={['About', 'Careers', 'Contact']} hrefs={['/company/about', '/company/careers', '/company/contact']} />
          </div>

        </div>

        {/* Bottom copyright rule */}
        <div className="max-w-[1850px] mx-auto px-4 lg:px-12 mt-20 pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <p className="text-sm font-mono text-white/40 tracking-wider">
            © {new Date().getFullYear()} ROOMX INC. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 text-sm font-mono text-white/40 tracking-wider">
            <Link href="/privacy" className="hover:text-white transition-colors duration-200">PRIVACY POLICY</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors duration-200">TERMS OF SERVICE</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}

function AnimatedDemoButton({ text, href }: { text: string; href: string }) {
  const btnRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const router = useTransitionRouter()

  useGSAP(() => {
    const btn = btnRef.current
    if (!btn) return

    const iconWrapper = btn.querySelector('.icon-wrapper') as HTMLElement
    const textWrapper = btn.querySelector('.text-wrapper') as HTMLElement

    if (iconWrapper && textWrapper) {
      const iconWidth = iconWrapper.offsetWidth
      const textWidth = textWrapper.offsetWidth
      const gap = 12

      const tl = gsap.timeline({ paused: true })
      tl.to(iconWrapper, { x: textWidth + gap, duration: 0.4, ease: 'power3.out' })
        .to(textWrapper, { x: -(iconWidth + gap), duration: 0.4, ease: 'power3.out' }, 0)
        .to(btn, { paddingLeft: 12, paddingRight: 12, duration: 0.4, ease: 'power3.out' }, 0)

      timelineRef.current = tl

      const onEnter = () => tl.play()
      const onLeave = () => tl.reverse()
      
      btn.addEventListener('mouseenter', onEnter)
      btn.addEventListener('mouseleave', onLeave)

      return () => {
        btn.removeEventListener('mouseenter', onEnter)
        btn.removeEventListener('mouseleave', onLeave)
      }
    }
  }, { scope: btnRef })

  const handleNavigate = () => {
    if (timelineRef.current) {
      timelineRef.current.pause(0) 
    }
    router.push(href)
  }

  return (
    <div
      ref={btnRef}
      onClick={handleNavigate}
      style={{ viewTransitionName: 'none' } as any}
      className="flex items-center gap-2 sm:gap-3 bg-gray-950 text-white px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full w-fit group font-sans cursor-pointer shadow-xl hover:bg-black select-none border border-white/10"
    >
      <div className="icon-wrapper w-7 h-7 sm:w-8 sm:h-8 bg-emerald-400 rounded-full text-[#062b2a] flex items-center justify-center shrink-0">
        <MousePointer2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
      </div>
      <span className="text-wrapper text-sm sm:text-base font-bold whitespace-nowrap pr-3 sm:pr-4">{text}</span>
    </div>
  )
}

function FooterColumn({ title, links, hrefs }: { title: string; links: string[]; hrefs: string[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex flex-col border-b border-white/5 lg:border-none py-3 lg:py-0 transition-colors duration-200">
      {/* Unified Header / Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 lg:py-0 lg:pointer-events-none outline-none border-none bg-transparent text-left cursor-pointer group"
      >
        <h4 className="font-mono font-bold text-xs lg:text-sm uppercase tracking-[0.25em] lg:mb-6 text-white/90 group-hover:text-white transition-colors m-0">
          {title}
        </h4>
        <div className={`p-1.5 rounded-lg bg-white/5 lg:hidden transition-all duration-300 ${isOpen ? 'bg-white/10 rotate-180' : 'group-hover:bg-white/10'}`}>
          <svg 
            className="w-3.5 h-3.5 text-white/70"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {/* Links List */}
      <div 
        className={`overflow-hidden transition-all duration-350 ease-in-out lg:!max-h-none lg:!opacity-100 lg:!mt-0 ${
          isOpen ? 'max-h-[300px] opacity-100 mt-4 mb-4' : 'max-h-0 opacity-0 mt-0 mb-0'
        }`}
      >
        <ul className="space-y-3.5 lg:space-y-4 text-white/60 m-0 p-0 list-none">
          {links.map((link: string, idx: number) => (
            <li key={link}>
              <Link 
                href={hrefs[idx] || '#'} 
                className="text-sm lg:text-base font-normal hover:text-white transition-colors duration-200 block py-1 lg:py-0"
              >
                {link}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}