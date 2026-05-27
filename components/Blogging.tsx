'use client'

import { useTransitionRouter } from 'next-view-transitions'
import { CheckCircle2, MousePointer2 } from 'lucide-react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { useRef, useCallback } from 'react'

/* ------------------ DATA ------------------ */

export const blogPosts = [
  {
    id: 1,
    tag: "Creator Economy",
    title: "How Content Creators Can Monetize Their Expertise with Podcasts, Live Chat, and Subscribers",
    image: "/assets/videos/blog2.mp4",
    author: {
      name: "RoomX Team",
      role: "Product Team",
      avatar: "/assets/avatars/avatar_product.png",
    },
    date: "16 April, 2026",
    href: "/knowledge-hub/monetization"
  },
  {
    id: 2,
    tag: "Education",
    title: "Learn by Watching Live: Why Real-Time Trading Rooms Beat Recorded Courses",
    image: "/assets/videos/blog1.mp4",
    author: {
      name: "RoomX Team",
      role: "Content Team",
      avatar: "/assets/avatars/avatar_content.png",
    },
    date: "1 April, 2026",
    href: "/knowledge-hub/trading-rooms"
  }, 
  {
    id: 3,
    tag: "Meetings & Communities",
    title: "From Discord Chaos to Focused Private Rooms that can use AI to Summarise and Highlight Key Moments",
    image: "/assets/videos/blog3.mp4",
    author: {
      name: "RoomX Team",
      role: "Community Team",
      avatar: "/assets/avatars/avatar_community.png",
    },
    date: "10 April, 2026",
    href: "/knowledge-hub/focused-rooms"
  }
];

/* ------------------ COMPONENTS ------------------ */

const FeatureListItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-4 font-sans">
    <CheckCircle2 className="w-6 h-6 text-[#0d2a21] fill-[#0d2a21]/5 mt-1 shrink-0" />
    <span className="text-lg sm:text-xl lg:text-2xl font-medium text-[#0d2a21]/80 leading-relaxed">{text}</span>
  </div>
)

const AnimatedButton = ({ text, href }: { text: string; href: string }) => {
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

  const handleNavigate = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.pause(0) 
    }
    router.push(href)
  }, [href, router])

  return (
    <div
      ref={btnRef}
      onClick={handleNavigate}
      style={{ viewTransitionName: 'none' } as any}
      className="flex items-center gap-2 sm:gap-3 bg-[#0d2a21] text-white px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full w-fit group font-sans cursor-pointer shadow-xl hover:bg-[#184638] select-none transition-colors"
    >
      <div className="icon-wrapper w-7 h-7 sm:w-8 sm:h-8 bg-[#a8f9e0] rounded-full text-[#0d2a21] flex items-center justify-center shrink-0">
        <MousePointer2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
      </div>
      <span className="text-wrapper text-sm sm:text-base font-bold whitespace-nowrap pr-3 sm:pr-4">{text}</span>
    </div>
  )
}

export const BlogCard = ({ post }: { post: typeof blogPosts[0] }) => {
  return (
    <a
      href={post.href || '#'}
      className="flex flex-col rounded-[20px] font-sans overflow-hidden bg-[#e9e9e1] border border-[#d8d8ce]/60 hover:shadow-2xl transition-all duration-300 group cursor-pointer no-underline"
    >
      <div className="aspect-[16/10] overflow-hidden relative bg-black/5">
        {post.image.endsWith('.mp4') ? (
          /* autoPlay + muted + playsInline = works in every browser without user interaction
             and without requiring the visitor to be signed in */
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          >
            <source src={post.image} type="video/mp4" />
          </video>
        ) : (
          <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        )}
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="px-4 py-1.5 bg-[#ff7759]/10 border border-[#ff7759]/25 text-[#ff7759] rounded-full text-xs font-bold uppercase tracking-wider font-mono">
            {post.tag}
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl lg:text-3xl font-nanum font-bold text-[#0d2a21] leading-snug mb-8 group-hover:text-[#184638] transition-colors line-clamp-2">
          {post.title}
        </h3>

        <div className="mt-auto">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-white/50 border border-[#d8d8ce]/30">
              <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
            </div>
            <div className="font-sans flex flex-col">
              <span className="text-sm sm:text-base font-bold text-[#0d2a21]">{post.author.name}</span>
              <span className="text-xs sm:text-[13px] text-[#0d2a21]/60">{post.author.role}</span>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-[#0d2a21]/50 font-medium font-sans">{post.date}</div>
        </div>
      </div>
    </a>
  )
}

export default function Blogging() {
  return (
    <div className="bg-[#f5f6f2] font-sans overflow-hidden">
      {/* SECTION 1: AI Engine Showcase */}
      <section className="w-full max-w-[1550px] mx-auto px-6 sm:px-10 lg:px-12 pt-10 sm:pt-16 lg:pt-56 pb-12 lg:pb-20 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Visual Overlapping Compositions */}
        <div className="relative order-2 lg:order-1 max-w-[550px] lg:max-w-none mx-auto w-full px-4 sm:px-8 lg:px-0">
          <div className="relative rounded-[28px] overflow-hidden aspect-[4/5] p-8 shadow-2xl bg-black">
            {/* Background image robob3.jpg staying behind */}
            <img 
              src="/assets/images/campb7.jpg" 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" 
            />
            
            <img 
              src="/assets/images/robo33.png" 
              alt="AI Engine Showcase" 
              className="relative w-full h-full object-cover object-top z-20" 
            />
          </div>
          {/* Overlay 1 (left side card) */}
          <div className="absolute -top-4 -left-3 sm:-top-8 sm:-left-6 w-[120px] h-[165px] sm:w-[170px] sm:h-[240px] lg:w-[200px] lg:h-[280px] rounded-[14px] sm:rounded-[18px] overflow-hidden shadow-2xl border-2 sm:border-4 border-yellow-300 bg-white z-30">
            <img src="/assets/images/think.jpg" alt="Thought process" className="w-full h-full object-cover" />
          </div>
          {/* Overlay 2 (right side card) */}
          <div className="absolute -bottom-4 -right-3 sm:-bottom-8 sm:-right-6 w-[120px] h-[165px] sm:w-[170px] sm:h-[240px] lg:w-[200px] lg:h-[280px] rounded-[14px] sm:rounded-[18px] overflow-hidden shadow-2xl border-2 sm:border-4 border-white bg-white z-30">
             <img src="/assets/images/cyber11.jpg" alt="Cyber design" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Content Block */}
        <div className="order-1 lg:order-2 flex flex-col gap-8 sm:gap-10">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-nanum font-normal text-[#0d2a21] leading-[1.05] tracking-[-0.03em]">
            Meet the AI engine behind your best Experience to date
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-[#0d2a21]/70 max-w-[650px]">
            RoomX combines insightful performance analytics with inspired creative execution.
          </p>
          <div className="flex flex-col gap-5 mt-2">
            <FeatureListItem text="Understands your campaign goals and context" />
            <FeatureListItem text="Trained on more than 3 billion data points" />
            <FeatureListItem text="Produces engaging, on-brand creative in seconds" />
          </div>
          <div className="mt-4">
            <AnimatedButton text="Discover the platform" href="/rooms" />
          </div>
        </div>
      </section>

      {/* SECTION 2: Blog Listings Grid */}
      <section className="w-full max-w-[1550px] mx-auto px-4 lg:px-12 py-20 sm:py-28 border-t border-[#d8d8ce]/60">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-8 mb-16 sm:mb-20">
          <h2 className="text-5xl sm:text-6xl lg:text-8xl font-nanum font-normal text-[#0d2a21] leading-none tracking-tight">
            Go further
          </h2>
          <AnimatedButton text="Visit the blog" href="/knowledge-hub" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}
