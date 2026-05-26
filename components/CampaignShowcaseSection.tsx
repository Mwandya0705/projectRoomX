'use client'

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

/* ------------------ DATA ------------------ */

const companies = [
  { name: 'LiveKit', logo: '/assets/logos/livekit.svg', color: '#FF6352' },
  { name: 'Stripe', logo: '/assets/logos/stripe.svg', color: '#635BFF' },
  { name: 'Supabase', logo: '/assets/logos/supabase.svg', color: '#3ECF8E' },
  { name: 'Vercel', logo: '/assets/logos/vercel.svg', color: '#FFFFFF' },
  { name: 'Clerk', logo: '/assets/logos/clerk.svg', color: '#6C47FF' },
  { name: 'TradingView', logo: '/assets/logos/tradingview.svg', color: '#131722' },
  { name: 'Discord', logo: '/assets/logos/discord.svg', color: '#5865F2' },
  { name: 'Twitch', logo: '/assets/logos/twitch.svg', color: '#9146FF' },
  { name: 'YouTube', logo: '/assets/logos/youtube.svg', color: '#FF0000' },
  { name: 'Patreon', logo: '/assets/logos/patreon.svg', color: '#FF424D' },
  { name: 'Zoom', logo: '/assets/logos/zoom.svg', color: '#2D8CFF' },
  { name: 'WebRTC', logo: '/assets/logos/webrtc.svg', color: '#444444' },
  { name: 'Agora', logo: '/assets/logos/agora.svg', color: '#009FF5' },
  { name: 'Twilio', logo: '/assets/logos/twilio.svg', color: '#F22F46' },
]

const cards = [
  {
    name: 'Supabase Database',
    category: 'BACKEND INFRA',
    image: '/assets/images/supabase1.webp',
  },
  {
    name: 'Agora Audio & Video',
    category: 'WEBRTC NETWORK',
    image: '/assets/images/agora4.jpg',
  },
  {
    name: 'Stripe Subscriptions',
    category: 'MONETIZATION',
    image: '/assets/images/stripe2.png',
  },
  {
    name: 'Vercel Deployment',
    category: 'PRODUCTION HOSTING',
    image: '/assets/images/vercel3.jpg',
  },
  {
    name: 'Clerk Identification',
    category: 'USER SECURITY',
    image: '/assets/images/clerk3.jpg',
  },
  {
    name: 'Cloud Media Delivery',
    category: 'CDN CONTENT',
    image: '/assets/images/cloud1.webp',
  },
  {
    name: 'LiveKit Streaming SFU',
    category: 'REALTIME RTC',
    image: '/assets/images/livekit.webp',
  },
]

/* ------------------ CHILD BADGE COMPONENT ------------------ */

function CompanyBadge({ company }: { company: typeof companies[0] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3.5 px-6 py-3 rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer"
      style={{
        borderColor: hovered ? `${company.color}50` : 'rgba(255, 255, 255, 0.15)',
        boxShadow: hovered ? `0 0 25px ${company.color}30` : 'none',
        backgroundColor: hovered ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)'
      }}
    >
      <img 
        src={company.logo} 
        className="h-6 transition-all duration-300" 
        style={{
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          filter: hovered ? 'grayscale(0%)' : 'grayscale(15%) opacity(90%)'
        }}
        alt={company.name} 
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
      <span 
        className="text-[12px] font-bold tracking-wider uppercase transition-colors duration-300"
        style={{
          color: hovered ? (company.name === 'Vercel' ? '#FFFFFF' : company.color) : 'rgba(255, 255, 255, 0.85)'
        }}
      >
        {company.name}
      </span>
    </div>
  )
}

/* ------------------ MAIN COMPONENT ------------------ */

export default function CampaignShowcaseSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const cardsTlRef = useRef<gsap.core.Timeline | null>(null)
  const companiesTlRef = useRef<gsap.core.Timeline | null>(null)

  useGSAP(() => {
    const companiesTl = gsap.timeline({ repeat: -1, ease: 'none' })
    companiesTl.to('.company-track', { xPercent: -50, duration: 40, force3D: true })

    const cardsTl = gsap.timeline({ repeat: -1, ease: 'none' })
    cardsTl.to('.card-track', { xPercent: -50, duration: 25, force3D: true })

    companiesTlRef.current = companiesTl
    cardsTlRef.current = cardsTl

    // Play continuously to prevent main-thread scroll-trigger layout thrashing
    companiesTl.play()
    cardsTl.play()
  }, [])

  return (
    <section 
      ref={sectionRef} 
      className="py-16 lg:py-32 overflow-hidden border-t border-white/5 relative bg-[#17171c]"
      style={{
        backgroundImage: 'url("/assets/images/campb6.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >

      {/* Premium Header Section */}
      <div className="max-w-[1320px] mx-auto px-8 sm:px-10 mb-20 relative z-10 font-sans">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#ff7759] mb-4 block font-bold">
          Platform Ecosystem
        </span>
        <div className="grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <h2 className="font-nanum font-normal text-white text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08]">
              Designed to integrate seamlessly with your creative stack.
            </h2>
          </div>
          <div className="md:col-span-4">
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Connect your private interactive spaces with the ultimate services for WebRTC casting, global payments, real-time databases, and instant user verification.
            </p>
          </div>
        </div>
      </div>

      {/* Integration Companies Marquee - Decoupled high-visibility real-color badges */}
      <div className="mb-20 relative z-10 overflow-hidden">
        <div 
          className="company-track flex w-max items-center transform-gpu"
          style={{ backfaceVisibility: 'hidden', willChange: 'transform' }}
        >
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex items-center gap-10 pr-10">
              {companies.map((company, i) => (
                <CompanyBadge key={i} company={company} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Integration Card Previews Showcase */}
      <div className="relative z-10 overflow-hidden">
        <div 
          className="card-track flex w-max transform-gpu"
          style={{ backfaceVisibility: 'hidden', willChange: 'transform' }}
          onMouseEnter={() => cardsTlRef.current?.pause()}
          onMouseLeave={() => cardsTlRef.current?.play()}
        >
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex gap-4 sm:gap-8 pr-4 sm:pr-8">
              {cards.map((card, i) => (
                <div
                  key={i}
                  style={{ backfaceVisibility: 'hidden', willChange: 'transform' } as any}
                  className="relative w-[280px] h-[220px] sm:w-[380px] sm:h-[300px] md:w-[460px] md:h-[360px] rounded-[22px] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden bg-[#1e1e24] group cursor-pointer transition-all duration-500 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,60,51,0.3)] hover:scale-[1.01] transform-gpu shrink-0"
                >
                  {/* Gloss reflection shine sweep */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none transform -skew-y-12 scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />

                  {/* Dynamic Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5 z-20 pointer-events-none" />

                  {/* Card Main Image */}
                  <img
                    src={card.image}
                    alt={card.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-750 ease-out z-0"
                  />

                  {/* Hover overlay panel using design1.md typography */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between gap-4 z-30 transition-transform duration-300 group-hover:translate-y-[-2px]">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#ff7759] font-bold block mb-1">
                        {card.category}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white tracking-wide block">
                        {card.name}
                      </span>
                    </div>
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center text-white text-xs shrink-0 transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white">
                      →
                    </span>
                  </div>

                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}