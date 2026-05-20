"use client"

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const MEGA_MENUS = {
  'Peer Stories': {
    title: 'Peer Stories',
    subtitle: 'Learn from the best in the industry.',
    products: [
      { icon: 'P', iconBg: 'from-green-400 to-blue-400', name: 'Featured Stories', desc: 'Top creator spotlights.', href: '/peer-stories/featured' },
      { icon: 'S', iconBg: 'from-orange-400 to-pink-400', name: 'Community Wins', desc: 'Real creator results.', href: '/peer-stories/community' },
    ],
    platform: { label: 'RESOURCES', links: [{ name: 'Guides', href: '/peer-stories/guides' }, { name: 'Tutorials', href: '/peer-stories/tutorials' }] },
    cta: { headline: 'Inspiration awaits', link: 'Read more', href: '/peer-stories' },
  },
  'Knowledge Hub': {
    title: 'Knowledge Hub',
    subtitle: 'Everything you need to grow.',
    products: [
      { icon: 'K', iconBg: 'from-violet-400 to-pink-400', name: 'Documentation', desc: 'Deep-dive platform guides.', href: '/knowledge-hub/docs' },
      { icon: 'L', iconBg: 'from-cyan-400 to-green-400', name: 'Learning Paths', desc: 'Step-by-step journeys.', href: '/knowledge-hub/learning' },
    ],
    platform: { label: 'PLATFORM', links: [{ name: 'Integrations', href: '/knowledge-hub/integrations' }, { name: 'Compliance', href: '/knowledge-hub/compliance' }] },
    cta: { headline: 'Seeing is believing', link: 'Get a demo', href: '/knowledge-hub' },
  },
  'Company': {
    title: 'Company',
    subtitle: 'The people behind RoomX.',
    products: [
      { icon: 'A', iconBg: 'from-orange-400 to-red-400', name: 'About Us', desc: 'Our mission and story.', href: '/company/about' },
      { icon: 'C', iconBg: 'from-blue-400 to-indigo-400', name: 'Careers', desc: 'Join our growing team.', href: '/company/careers' },
    ],
    platform: { label: 'CONNECT', links: [{ name: 'Blog', href: '/company/blog' }, { name: 'Contact', href: '/company/contact' }] },
    cta: { headline: 'Build with us', link: 'Learn more', href: '/company' },
  },
}

export default function NavigationClient() {
  const { user } = useUser()
  const [mounted, setMounted] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const megaWrapRef = useRef<HTMLDivElement | null>(null)
  const colRefs = useRef<(HTMLDivElement | null)[]>([])
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const isOpenRef = useRef(false)
  const { contextSafe } = useGSAP()

  const animateOpen = contextSafe(() => {
    const wrap = megaWrapRef.current
    const overlay = overlayRef.current
    if (!wrap || !overlay) return
    gsap.killTweensOf([wrap, overlay, ...colRefs.current])
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    isOpenRef.current = true
    tl.to(overlay, { opacity: 1, pointerEvents: 'auto', duration: 0.4 }, 0)
      .fromTo(wrap, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.6 }, 0)
      .fromTo(colRefs.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.04 }, 0.15)
  })

  const animateClose = contextSafe(() => {
    const wrap = megaWrapRef.current
    const overlay = overlayRef.current
    if (!wrap || !overlay) return
    const tl = gsap.timeline({ defaults: { ease: 'power4.inOut' }, onComplete: () => { setActiveMenu(null); isOpenRef.current = false } })
    tl.to(wrap, { height: 0, opacity: 0, duration: 0.35 }).to(overlay, { opacity: 0, pointerEvents: 'none', duration: 0.3 }, 0)
  })

  const handleEnter = (label: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    if (activeMenu === label) return
    setActiveMenu(label)
    if (!isOpenRef.current) animateOpen()
  }

  const handleLeave = () => { closeTimerRef.current = setTimeout(() => animateClose(), 200) }
  useEffect(() => { setMounted(true) }, [])
  const menu = activeMenu ? MEGA_MENUS[activeMenu as keyof typeof MEGA_MENUS] : null

  return (
    <>
      <div ref={overlayRef} className="fixed inset-0 bg-black/20 backdrop-blur-sm pointer-events-none opacity-0 z-[40]" />
      <div className="fixed top-3 px-3 left-0 w-full z-[50]">
        <header className="bg-[#f5f6f2] rounded-2xl shadow-sm border-b border-gray-200 overflow-hidden" onMouseLeave={handleLeave}>
          {/* Top Bar */}
          <div className="flex items-center justify-between h-20 px-6 lg:px-[clamp(2rem,8vw,9rem)]">
            <Link href="/" className="text-[clamp(1.5rem,2.5vw,2.25rem)] font-bold text-gray-900 tracking-tighter shrink-0">RoomX</Link>
            
            <div className="flex items-center gap-[clamp(1rem,3vw,2.5rem)] h-full">
              <nav className="hidden md:flex items-center gap-[clamp(1rem,2vw,2rem)] h-full">
                {Object.keys(MEGA_MENUS).map((label) => (
                  <button key={label} onMouseEnter={() => handleEnter(label)} className={`text-sm font-semibold h-full border-b-2 transition-all pb-1 whitespace-nowrap ${activeMenu === label ? 'border-emerald-800 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
                    {label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-4 shrink-0">
                {mounted && (
                  <>
                    <SignedOut>
                      <SignInButton mode="modal"><button className="text-sm font-medium hover:text-emerald-800 transition-colors">Sign In</button></SignInButton>
                      <SignUpButton mode="modal">
                        <button className="px-[clamp(1rem,2vw,1.5rem)] py-2 bg-emerald-800 text-white rounded-full text-xs lg:text-sm font-bold whitespace-nowrap hover:bg-emerald-900 transition-all shadow-sm">Get a demo</button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <SignUpButton mode="modal">
                        <button className="px-5 py-2 bg-emerald-800 text-white rounded-full text-sm font-bold whitespace-nowrap hover:bg-emerald-900 transition-all shadow-sm">Get a demo</button>
                      </SignUpButton>
                      <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-10 h-10' } }} />
                    </SignedIn>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Flexible Mega Menu */}
          <div ref={megaWrapRef} className="overflow-hidden h-0 bg-[#f5f6f2]" onMouseEnter={() => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current) }}>
            {menu && (
              <div className="flex w-full border-t border-gray-100 items-stretch">
                {/* Column 0: Info (Dynamic Offset) */}
                <div ref={el => { colRefs.current[0] = el }} className="w-[28%] py-12 lg:py-16 pr-4" style={{ paddingLeft: 'clamp(1.5rem, 10vw, 15rem)' }}>
                  <h2 className="font-bold text-gray-900 tracking-tight leading-tight text-[clamp(1.1rem,2vw,1.5rem)]">{menu.title}</h2>
                  <p className="mt-3 text-[clamp(0.85rem,1.1vw,1rem)] text-gray-500 leading-relaxed max-w-[200px]">{menu.subtitle}</p>
                </div>

                {/* Column 1: Products (Shrinking Gap) */}
                <div ref={el => { colRefs.current[1] = el }} className="w-[26%] p-8 lg:p-16 flex flex-col gap-6 lg:gap-8 border-l border-gray-100">
                  {menu.products.map((p) => (
                    <Link key={p.name} href={p.href} className="flex items-start gap-3 lg:gap-5 group">
                      <span className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${p.iconBg} flex items-center justify-center text-white font-bold text-lg lg:text-xl shrink-0`}>{p.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm lg:text-base font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">{p.name}</p>
                        <p className="text-[11px] lg:text-sm text-gray-500 mt-1 line-clamp-1 lg:line-clamp-2">{p.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Column 2: Resources */}
                <div ref={el => { colRefs.current[2] = el }} className="w-[22%] p-8 lg:p-16 border-l border-gray-100/50">
                  <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4 lg:mb-6">{menu.platform.label}</p>
                  <div className="flex flex-col gap-3 lg:gap-4">
                    {menu.platform.links.map((link) => (
                      <Link key={link.name} href={link.href} className="text-sm lg:text-base text-gray-700 hover:text-emerald-700 transition-colors font-medium">{link.name}</Link>
                    ))}
                  </div>
                </div>

                {/* Column 3: CTA */}
                <div ref={el => { colRefs.current[3] = el }} className="w-[24%] bg-[#eceae5] pl-8 lg:pl-12 py-12 lg:py-16 flex flex-col justify-start border-l border-gray-100" style={{ paddingRight: 0 }}>
                  <h3 className="text-lg lg:text-2xl font-bold text-gray-900 leading-snug mb-4 lg:mb-6 pr-4">{menu.cta.headline}</h3>
                  <Link href={menu.cta.href} className="inline-block self-start text-sm lg:text-base font-bold text-gray-900 border-b-2 border-gray-900 pb-1 hover:text-emerald-700 hover:border-emerald-700 transition-all">
                    {menu.cta.link}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>
      </div>
    </>
  )
}