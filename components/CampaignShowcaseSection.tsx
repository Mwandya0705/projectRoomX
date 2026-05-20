'use client'

import { useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

/* ------------------ DATA ------------------ */

const companies = [
  { name: 'LiveKit', logo: '/assets/logos/livekit.svg', color: '#FF6352' },
  { name: 'Stripe', logo: '/assets/logos/stripe.svg', color: '#635BFF' },
  { name: 'Supabase', logo: '/assets/logos/supabase.svg', color: '#3ECF8E' },
  { name: 'Vercel', logo: '/assets/logos/vercel.svg', color: '#000000' },
  { name: 'Clerk', logo: '/assets/logos/clerk.svg', color: '#6C47FF' },
  { name: 'TradingView', logo: '/assets/logos/tradingview.svg', color: '#131722' },
  { name: 'Discord', logo: '/assets/logos/discord.svg', color: '#5865F2' },
  { name: 'Twitch', logo: '/assets/logos/twitch.svg', color: '#9146FF' },
  { name: 'YouTube', logo: '/assets/logos/youtube.svg', color: '#FF0000' },
  { name: 'Patreon', logo: '/assets/logos/patreon.svg', color: '#FF424D' },
  { name: 'Zoom', logo: '/assets/logos/zoom.svg', color: '#2D8CFF' },
  { name: 'WebRTC', logo: '/assets/logos/webrtc.svg', color: '#333333' },
  { name: 'Agora', logo: '/assets/logos/agora.svg', color: '#009FF5' },
  { name: 'Twilio', logo: '/assets/logos/twilio.svg', color: '#F22F46' },
]

const cards = [
  {
    stat: 'Backend',
    label: 'Postgres & Auth',
    title: 'Supabase',
    description: 'The open source Firebase alternative with realtime DB and seamless storage for media assets.',
    color: 'bg-[#3ECF8E]',
    textColor: 'text-gray-900',
    statColor: 'text-gray-900',
    image: '/assets/images/brand_supabase.png'
  },
  {
    stat: 'Video',
    label: 'RTC APIs',
    title: 'Agora',
    description: 'Leading real-time engagement platform providing low-latency video and voice streaming globally.',
    color: 'bg-[#009FF5]',
    textColor: 'text-white',
    statColor: 'text-white',
    image: '/assets/images/product_creative.png'
  },
  {
    stat: 'Pay',
    label: 'Creator Economy',
    title: 'Stripe',
    description: 'The financial backbone for creator monetization, managing subscriptions and global payouts.',
    color: 'bg-[#635BFF]',
    textColor: 'text-white',
    statColor: 'text-white',
    image: '/assets/images/brand_skincare.png'
  },
  {
    stat: 'Edge',
    label: 'Next.js Hosting',
    title: 'Vercel',
    description: 'The high-performance platform for frontend deployment with serverless and edge functions.',
    color: 'bg-black',
    textColor: 'text-white',
    statColor: 'text-white',
    image: '/assets/images/brand_tech.png'
  },
  {
    stat: 'Auth',
    label: 'User Management',
    title: 'Clerk',
    description: 'Seamless authentication suite designed for fast-growing SaaS and social applications.',
    color: 'bg-[#6C47FF]',
    textColor: 'text-white',
    statColor: 'text-white',
    image: '/assets/images/brand_fashion.png'
  },
  {
    stat: 'Media',
    label: 'Transformation',
    title: 'Cloudinary',
    description: 'Automated image and video management for optimal delivery across all devices.',
    color: 'bg-[#3448C5]',
    textColor: 'text-white',
    statColor: 'text-white',
    image: '/assets/images/mobile_ad.png'
  },
]

const imageFeatures = [
  {
    title: 'Weekly budget allocation',
    subtitle: 'Smarter spend insights',
    position: 'bottom-right',
  },
  {
    title: 'AI-powered optimisation',
    subtitle: 'Real-time decisions',
    position: 'top-left',
  },
]

const blogPosts = [
  {
    tag: 'Marketing Strategy',
    title: 'Multichannel vs Omnichannel: Choosing the Right Approach',
    author: 'Kristen Pecka',
    role: 'Head of Stellar Marketing',
    date: '10 January, 2026',
    image: '/media/images/blog1.png',
  },
  {
    tag: 'AI',
    title: 'Marketing Use Cases for Generative AI: What Works Now',
    author: 'Swetha Venkiteswaran',
    role: 'Content Writer @ Pixis',
    date: '9 January, 2026',
    image: '/media/images/blog2.png',
  },
  {
    tag: 'AI',
    title: 'Instagram AI Marketing Trends Reshaping Social Commerce',
    author: 'Swetha Venkiteswaran',
    role: 'Content Writer @ Pixis',
    date: '26 December, 2025',
    image: '/media/images/blog3.png',
  },
]

/* ------------------ COMPONENT ------------------ */

export default function CampaignShowcaseSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const companiesTl = gsap.timeline({ repeat: -1, paused: true, ease: 'none' })
    companiesTl.to('.company-track', { xPercent: -50, duration: 30 })

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 85%',
      end: 'bottom 15%',
      onEnter: () => companiesTl.play(),
      onEnterBack: () => companiesTl.play(),
      onLeave: () => companiesTl.pause(),
      onLeaveBack: () => companiesTl.pause(),
    })

    const cardsTl = gsap.timeline({ repeat: -1, paused: true, ease: 'none' })
    cardsTl.to('.card-track', { xPercent: -50, duration: 22 })

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => cardsTl.play(),
      onEnterBack: () => cardsTl.play(),
      onLeave: () => cardsTl.pause(),
      onLeaveBack: () => cardsTl.pause(),
    })
  }, [])

  return (
    <section ref={sectionRef} className="bg-[#f5f6f2] py-32 overflow-visible">
      {/* ================= Companies Slider ================= */}
      <div className="mb-16 overflow-visible">
        <div className="company-track flex items-center gap-24 rotate-[-4deg] px-32">
          {[...companies, ...companies].map((company, i) => (
            <div key={i} className="flex-shrink-0 flex items-center gap-4 hover:opacity-100 transition-all duration-300 cursor-default">
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-md border border-gray-100">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-10 w-auto object-contain max-w-[140px]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-2xl font-bold tracking-tight" style={{ color: company.color }}>{company.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= Cards Slider ================= */}
      <div className="mb-40 overflow-visible">
        <div className="card-track flex gap-12 rotate-[-4deg] px-32">
          {[...cards, ...cards].map((card, i) => (
            <div
              key={i}
              className={`flex-shrink-0 w-[500px] h-[320px] rounded-[2.5rem] shadow-2xl p-10 flex relative overflow-hidden transition-transform duration-500 hover:scale-[1.02] ${card.color} ${card.textColor}`}
            >
              {/* Left Side: BIG STAT */}
              <div className={`w-[35%] flex flex-col justify-center border-r border-current opacity-20 pr-6 mr-6 ${card.statColor}`}>
                <span className="text-7xl font-bold tracking-tighter leading-none">{card.stat}</span>
                <span className="text-sm font-medium mt-2 leading-tight uppercase tracking-wider">{card.label}</span>
              </div>

              {/* Right Side: CONTENT */}
              <div className="w-[65%] flex flex-col justify-start pt-2">
                <h4 className="text-3xl font-bold tracking-tight mb-3 leading-tight">{card.title}</h4>
                <p className="text-lg leading-snug opacity-90 font-medium line-clamp-4">
                  {card.description}
                </p>
              </div>

              {/* Bottom Right: IMAGE PREVIEW (Using Sample Image) */}
              <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-3xl overflow-hidden shadow-2xl rotate-[-8deg] border-4 border-white/30 bg-gray-100">
                <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= Feature Section ================= */}
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center mb-40">
        <div className="relative h-[420px]">
          <Image
            src="/media/images/model1.png"
            alt="Campaign visual"
            fill
            className="object-cover rounded-3xl"
          />

          {imageFeatures.map((feature, i) => (
            <div
              key={i}
              className={`absolute bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl w-56
                ${feature.position === 'bottom-right'
                  ? '-bottom-8 -right-8'
                  : '-top-6 -left-6'}
              `}
            >
              <p className="text-sm font-semibold">{feature.title}</p>
              <p className="text-xs text-gray-500 mt-1">{feature.subtitle}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-4xl font-semibold mb-6">
            Meet the AI engine behind your best campaigns to date
          </h2>
          <p className="text-gray-600 mb-8 max-w-md">
            Pixis combines insightful performance analytics with inspired creative execution.
          </p>
          <ul className="space-y-4 font-medium">
            <li>✔ Understands campaign goals and context</li>
            <li>✔ Trained on billions of data points</li>
            <li>✔ Produces on-brand creative in seconds</li>
          </ul>
        </div>
      </div>

      {/* ================= Go Further Section ================= */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-3xl font-semibold">Go further</h3>
          <button className="flex items-center gap-2 bg-emerald-900 text-white px-4 py-2 rounded-full text-sm">
            Visit the blog
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts.map((post, i) => (
            <div key={i} className="bg-[#eceee3] rounded-3xl overflow-hidden">
              <div className="relative h-56">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                <span className="inline-block text-xs bg-emerald-900 text-white px-3 py-1 rounded-full mb-4">
                  {post.tag}
                </span>

                <h4 className="text-lg font-semibold mb-4">
                  {post.title}
                </h4>

                <div className="text-sm text-gray-600">
                  <p className="font-medium">{post.author}</p>
                  <p className="text-xs">{post.role}</p>
                </div>

                <p className="text-xs text-gray-500 mt-4">{post.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}