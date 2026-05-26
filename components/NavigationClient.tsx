"use client"

import { useRef, useState, useEffect } from 'react'
import { Link } from 'next-view-transitions'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
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
    cta: { headline: 'Seeing is believing', link: 'Get a demo', href: '/book-a-demo' },
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
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)

  const hideOnRoutes = ['/room/', '/dashboard/studio']
  const shouldHide = hideOnRoutes.some(route => pathname?.startsWith(route))
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createClient()

  const megaWrapRef = useRef<HTMLDivElement | null>(null)
  const colRefs = useRef<(HTMLDivElement | null)[]>([])
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const mobileDrawerRef = useRef<HTMLDivElement | null>(null)
  const isOpenRef = useRef(false)
  const { contextSafe } = useGSAP()

  useEffect(() => {
    if (shouldHide) return
    setMounted(true)
    const getUserData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
        const { data: dbUserData } = await supabase.from('users').select('image_url, name').eq('id', authUser.id).single()
        if (dbUserData) {
          setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, avatar_url: dbUserData.image_url || prev.user_metadata.avatar_url, full_name: dbUserData.name || prev.user_metadata.full_name } } : null)
        }
      }
    }
    getUserData()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        const { data: dbUserData } = await supabase.from('users').select('image_url, name').eq('id', session.user.id).single()
        if (dbUserData) {
          setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, avatar_url: dbUserData.image_url || prev.user_metadata.avatar_url, full_name: dbUserData.name || prev.user_metadata.full_name } } : null)
        }
      } else { setUser(null) }
    })
    return () => subscription.unsubscribe()
  }, [shouldHide])

  if (shouldHide) return null

  const animateOpen = contextSafe(() => {
    const wrap = megaWrapRef.current
    const overlay = overlayRef.current
    if (!wrap || !overlay) return
    const validCols = colRefs.current.filter(Boolean)
    gsap.killTweensOf([wrap, overlay, ...validCols])
    
    // Ensure visibility is restored before starting open transitions
    gsap.set(wrap, { visibility: 'visible' })

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    isOpenRef.current = true
    tl.to(overlay, { opacity: 1, pointerEvents: 'auto', duration: 0.4 }, 0)
      .fromTo(wrap, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.55 }, 0)
      .fromTo(validCols, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.04 }, 0.12)
  })

  const animateClose = contextSafe(() => {
    const wrap = megaWrapRef.current
    const overlay = overlayRef.current
    if (!wrap || !overlay) return
    const tl = gsap.timeline({ 
      defaults: { ease: 'power4.inOut' }, 
      onComplete: () => { 
        setActiveMenu(null)
        isOpenRef.current = false
        // Completely hide container after closing to eliminate border and shadow lines
        gsap.set(wrap, { visibility: 'hidden' })
      } 
    })
    tl.to(wrap, { height: 0, opacity: 0, duration: 0.3 }).to(overlay, { opacity: 0, pointerEvents: 'none', duration: 0.25 }, 0)
  })

  const handleEnter = (label: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    if (activeMenu === label) return
    setActiveMenu(label)
    if (!isOpenRef.current) animateOpen()
  }

  const handleLeave = () => { closeTimerRef.current = setTimeout(() => animateClose(), 150) }
  const menu = activeMenu ? MEGA_MENUS[activeMenu as keyof typeof MEGA_MENUS] : null

  const openMobileMenu = () => {
    setMobileOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeMobileMenu = () => {
    setMobileOpen(false)
    setMobileExpanded(null)
    document.body.style.overflow = ''
  }

  return (
    <>
      <div ref={overlayRef} className="fixed inset-0 bg-black/10 backdrop-blur-sm pointer-events-none opacity-0 z-[40]" />
      
      {/* Spacious Floating Capsule Layout */}
      <div 
        className="fixed top-3 sm:top-6 px-4 left-0 w-full z-[50] flex justify-center"
        onMouseLeave={handleLeave}
      >
        <div className="w-full max-w-[1320px] relative">
          
          {/* Header Navigation Bar */}
          <header 
            className="w-full bg-[#f5f6f2]/85 backdrop-blur-md rounded-full shadow-md border border-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between h-14 sm:h-20 px-4 sm:px-6 lg:px-10">
              
              {/* Left: Brand logo */}
              <Link 
                href="/" 
                className="text-xl sm:text-3xl font-nanum font-bold tracking-[-0.02em] shrink-0 hover:opacity-90 transition-opacity"
              >
                <span className="text-gray-900">Room</span><span className="text-emerald-500">X</span>
              </Link>

              {/* Center: Main horizontal menu (desktop only) */}
              <div className="flex items-center gap-4 lg:gap-6 xl:gap-10 h-full">
                <nav className="hidden lg:flex items-center gap-2 xl:gap-4 font-sans">
                  {Object.keys(MEGA_MENUS).map((label) => (
                    <button 
                      key={label} 
                      onMouseEnter={() => handleEnter(label)} 
                      className={`text-[11px] xl:text-[13px] font-bold tracking-widest uppercase py-2 px-3 xl:px-4 rounded-full transition-all duration-200 whitespace-nowrap ${
                        activeMenu === label 
                          ? 'bg-emerald-800/10 text-emerald-900' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </nav>

                {/* Right: Authenticated state actions */}
                <div className="flex items-center gap-3 sm:gap-5 shrink-0 font-sans">
                  {mounted && (
                    <>
                      {!user ? (
                        <>
                          <Link href="/sign-in" className="hidden sm:block">
                            <button className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-emerald-800 transition-colors">
                              Sign In
                            </button>
                          </Link>
                          <Link href="/dashboard" className="hidden sm:block">
                            <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-800 text-white rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-sm active:scale-95">
                              Dashboard
                            </button>
                          </Link>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 sm:gap-4 relative">
                          <Link href="/dashboard" className="hidden sm:block">
                            <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/40 hover:bg-white/70 backdrop-blur-sm border border-emerald-800/10 text-emerald-800 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95">
                              Dashboard
                            </button>
                          </Link>
                          <div 
                            className="relative"
                            onMouseLeave={() => setShowUserMenu(false)}
                          >
                            <button 
                              onClick={() => setShowUserMenu(!showUserMenu)} 
                              className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-white font-bold overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform"
                            >
                              {user.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                              ) : (
                                user.email?.charAt(0).toUpperCase()
                              )}
                            </button>
                            {showUserMenu && (
                              <div className="absolute right-0 top-full pt-3 z-[60]">
                                <div className="w-52 bg-white rounded-[16px] shadow-xl border border-black/5 py-2.5">
                                  <div className="px-4 py-2 border-b border-gray-100 mb-2">
                                    <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest truncate">Account</p>
                                    <p className="text-xs font-bold text-gray-800 truncate">{user.email}</p>
                                  </div>
                                  <Link href="/profile" className="block px-4 py-2.5 text-xs font-bold text-gray-800 hover:bg-[#f5f6f2] transition-colors">Profile Settings</Link>
                                  <Link href="/dashboard" className="block px-4 py-2.5 text-xs font-bold text-gray-800 hover:bg-[#f5f6f2] transition-colors">Creator Dashboard</Link>
                                  <button onClick={() => { supabase.auth.signOut().then(() => window.location.reload()) }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors mt-2">Sign Out</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Mobile hamburger — hidden on lg+ */}
                <button
                  onClick={openMobileMenu}
                  className="lg:hidden flex flex-col gap-[5px] justify-center items-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                  aria-label="Open menu"
                >
                  <span className="w-5 h-[2px] bg-gray-800 rounded-full block" />
                  <span className="w-4 h-[2px] bg-gray-800 rounded-full block" />
                  <span className="w-5 h-[2px] bg-gray-800 rounded-full block" />
                </button>
              </div>
            </div>
          </header>

          {/* ===== MOBILE DRAWER ===== */}
          <div
            ref={mobileDrawerRef}
            className={`fixed inset-0 z-[200] flex flex-col bg-[#f5f6f2] overflow-y-auto transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              mobileOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <Link href="/" onClick={closeMobileMenu} className="text-3xl font-nanum font-bold tracking-[-0.02em]">
                <span className="text-gray-900">Room</span><span className="text-emerald-500">X</span>
              </Link>
              <button
                onClick={closeMobileMenu}
                className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition-all"
                aria-label="Close menu"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Drawer Nav Items */}
            <div className="flex flex-col px-6 pt-6 pb-4 gap-1">
              {Object.entries(MEGA_MENUS).map(([label, menu]) => (
                <div key={label}>
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === label ? null : label)}
                    className="flex items-center justify-between w-full py-4 text-left"
                  >
                    <span className="text-[15px] font-bold tracking-widest uppercase text-gray-900">{label}</span>
                    <svg
                      width="18" height="18" viewBox="0 0 24 24" fill="none"
                      className={`transition-transform duration-300 ${mobileExpanded === label ? 'rotate-180' : ''}`}
                    >
                      <path d="M6 9l6 6 6-6" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {mobileExpanded === label && (
                    <div className="pl-2 pb-4 flex flex-col gap-4">
                      {/* Section subtitle */}
                      <p className="text-sm text-gray-500 leading-relaxed">{menu.subtitle}</p>

                      {/* Products */}
                      {menu.products.map((p) => (
                        <Link
                          key={p.name}
                          href={p.href}
                          onClick={closeMobileMenu}
                          className="flex items-center gap-4 p-3 rounded-2xl bg-white/70 hover:bg-emerald-50 border border-gray-100 transition-all"
                        >
                          <span className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.iconBg} flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm`}>
                            {p.icon}
                          </span>
                          <div>
                            <p className="text-sm font-extrabold text-gray-900">{p.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                          </div>
                        </Link>
                      ))}

                      {/* Platform links */}
                      <div className="pt-2 border-t border-gray-100 flex gap-6">
                        {menu.platform.links.map((link) => (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={closeMobileMenu}
                            className="text-sm font-bold text-gray-700 hover:text-emerald-700 transition-colors"
                          >
                            {link.name}
                          </Link>
                        ))}
                      </div>

                      {/* CTA */}
                      <Link
                        href={menu.cta.href}
                        onClick={closeMobileMenu}
                        className="inline-flex items-center gap-2 mt-1 text-sm font-bold uppercase tracking-widest text-gray-900 border-b-2 border-gray-900 pb-0.5 hover:text-emerald-700 hover:border-emerald-700 transition-all w-fit"
                      >
                        {menu.cta.link}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    </div>
                  )}

                  <div className="h-px bg-gray-100" />
                </div>
              ))}
            </div>

            {/* Drawer Auth Footer */}
            <div className="mt-auto px-6 py-8 border-t border-gray-100 flex flex-col gap-3">
              {mounted && (
                !user ? (
                  <>
                    <Link href="/dashboard" onClick={closeMobileMenu}>
                      <button className="w-full py-4 bg-emerald-800 text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-md active:scale-95">
                        Dashboard
                      </button>
                    </Link>
                    <Link href="/sign-in" onClick={closeMobileMenu}>
                      <button className="w-full py-4 bg-gray-100 text-gray-900 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95">
                        Sign In
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2 p-3 bg-white/60 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-white font-bold overflow-hidden border-2 border-white shadow-sm shrink-0">
                        {user.user_metadata?.avatar_url ? (
                          <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.email?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{user.user_metadata?.full_name || 'Your Account'}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/dashboard" onClick={closeMobileMenu}>
                      <button className="w-full py-4 bg-emerald-800 text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-md active:scale-95">
                        Dashboard
                      </button>
                    </Link>
                    <Link href="/profile" onClick={closeMobileMenu}>
                      <button className="w-full py-4 bg-gray-100 text-gray-900 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95">
                        Profile Settings
                      </button>
                    </Link>
                    <button
                      onClick={() => { supabase.auth.signOut().then(() => { closeMobileMenu(); window.location.reload() }) }}
                      className="w-full py-4 text-red-600 text-sm font-bold uppercase tracking-widest hover:bg-red-50 rounded-full transition-all active:scale-95"
                    >
                      Sign Out
                    </button>
                  </>
                )
              )}
            </div>
          </div>

          {/* Centered Narrow Dropdown (max-w-[1020px]): Decoupled layout, rearranged into an ultra-aesthetic 3-column layout */}
          <div 
            ref={megaWrapRef} 
            className="absolute top-[88px] left-1/2 -translate-x-1/2 w-full max-w-[1020px] overflow-hidden h-0 bg-white/98 backdrop-blur-xl rounded-[28px] border border-gray-200/50 shadow-2xl z-50" 
            style={{ visibility: 'hidden', opacity: 0 }}
            onMouseEnter={() => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current) }}
          >
            {menu && (
              <div className="flex w-full items-stretch">
                
                {/* Column 1: Context introduction + Resources link stack (Left, w-[38%]) */}
                <div 
                  ref={el => { colRefs.current[0] = el }} 
                  className="w-[38%] py-16 pl-12 pr-8 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="font-nanum font-normal text-gray-900 leading-tight text-4xl lg:text-5xl tracking-tight">
                      {menu.title}
                    </h2>
                    <p className="mt-5 text-base sm:text-lg text-gray-700 leading-relaxed max-w-[280px]">
                      {menu.subtitle}
                    </p>
                  </div>
                  
                  <div className="mt-10 pt-8 border-t border-gray-100">
                    <p className="text-xs font-mono font-bold text-gray-700 tracking-[0.25em] uppercase mb-4">
                      {menu.platform.label}
                    </p>
                    <div className="flex flex-wrap gap-x-8 gap-y-3">
                      {menu.platform.links.map((link) => (
                        <Link 
                          key={link.name} 
                          href={link.href} 
                          className="text-base text-gray-800 hover:text-emerald-700 transition-colors font-bold"
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Core products selection (Center, w-[38%]) */}
                <div 
                  ref={el => { colRefs.current[1] = el }} 
                  className="w-[38%] py-16 px-12 flex flex-col gap-6 border-l border-gray-100 animate-fade-in"
                >
                  <p className="text-xs font-mono font-bold text-black tracking-[0.25em] uppercase mb-2">
                    EXPLORE PLATFORM
                  </p>
                  <div className="flex flex-col gap-5">
                    {menu.products.map((p) => (
                      <Link key={p.name} href={p.href} className="flex items-start gap-5 p-3 rounded-[16px] hover:bg-gray-50/80 transition-all group">
                        <span className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.iconBg} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm`}>
                          {p.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="text-base sm:text-lg font-extrabold text-gray-950 group-hover:text-emerald-700 transition-colors truncate">
                            {p.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-700 mt-1 line-clamp-2 leading-relaxed">
                            {p.desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Column 3: Soft neutral stone accent card CTA block (Right, w-[24%]) */}
                <div 
                  ref={el => { colRefs.current[2] = el }} 
                  className="w-[24%] bg-[#eeece7] pl-10 pr-8 py-16 flex flex-col justify-between border-l border-gray-150"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-800 tracking-[0.25em] uppercase block mb-4">
                      FEATURED
                    </span>
                    <h3 className="font-nanum text-3xl text-gray-950 leading-snug font-normal">
                      {menu.cta.headline}
                    </h3>
                  </div>
                  <Link 
                    href={menu.cta.href} 
                    className="inline-block text-sm sm:text-base font-bold uppercase tracking-widest text-gray-900 border-b-2 border-gray-900 pb-1 hover:text-emerald-700 hover:border-emerald-700 transition-all mt-8"
                  >
                    {menu.cta.link}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}