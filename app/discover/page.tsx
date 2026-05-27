'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Cpu, Monitor, Zap, Heart } from 'lucide-react'

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-[#f5f6f2] font-sans pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-20">
        
        {/* Navigation */}
        <div className="mb-12 ">
          <Link href="/" className="inline-flex items-center gap-2 text-[#0d2a21]/60 hover:text-[#0d2a21] transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[14px] font-bold">Back to Home</span>
          </Link>
        </div>

        {/* Hero */}
        <div className="max-w-4xl mb-16 sm:mb-24">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[92px] font-bold text-[#0d2a21] leading-none tracking-tighter mb-8 font-nanum">
             The Infrastructure <br/><span className="text-[#10b981]">of Influence.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#0d2a21]/70 leading-relaxed font-satoshi max-w-2xl">
            Discover the engines that drive the next generation of private communities. 
            RoomX is built to handle the complexities of real-time expertise, 
            so you can focus on building your legacy.
          </p>
        </div>

        {/* Discover Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 mb-16 sm:mb-28">
           <div className="order-2 lg:order-1 space-y-10 sm:space-y-16">
              <DiscoverSection
                icon={<Cpu className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />}
                title="Prism: The Live Engine"
                desc="A proprietary streaming protocol optimized for ultra-low latency. Whether it's 4K chart analysis or high-res design summits, Prism ensures not a single pixel or second is lost."
              />
              <DiscoverSection
                icon={<Zap className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />}
                title="Adroom: The Growth Intelligence"
                desc="Beyond static ads. Adroom uses AI to analyze your live sessions and generate high-intent social clips that drive traffic directly to your next room."
              />
           </div>
           <div className="order-1 lg:order-2 aspect-[4/5] max-h-[360px] sm:max-h-none rounded-2xl sm:rounded-[4rem] bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-gray-400 font-bold italic text-sm shadow-sm relative overflow-hidden">
              Platform Preview
              <div className="absolute inset-0 bg-gradient-to-t from-[#f5f6f2] to-transparent opacity-40" />
           </div>
        </div>

        {/* The Workflow */}
        <div className="bg-[#0d2a21] rounded-2xl sm:rounded-[3rem] lg:rounded-[4rem] p-6 sm:p-12 lg:p-20 text-white">
           <h2 className="text-2xl sm:text-4xl lg:text-[60px] font-bold mb-8 sm:mb-14 font-nanum tracking-tight text-center">How it flows</h2>
           <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
              <Step number="01" title="Build your Room" desc="Configure your brand, set your subscription tiers, and prepare your workspace." />
              <Step number="02" title="Go Live" desc="Launch Prism and interact with your high-intent community in real-time." />
              <Step number="03" title="Scale with Adroom" desc="Turn your highlights into viral campaigns and scale your subscriber base." />
           </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 sm:mt-24 text-center px-4">
           <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0d2a21] mb-6 sm:mb-8 font-nanum">Ready to see it in action?</h2>
           <Link href="/book-a-demo">
             <button className="px-8 sm:px-12 py-3.5 sm:py-5 bg-[#10b981] hover:bg-[#059669] text-[#0d2a21] rounded-full text-base sm:text-lg font-bold transition-all shadow-xl">
               Book a Personal Demo
             </button>
           </Link>
        </div>

      </div>
    </div>
  )
}

function DiscoverSection({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group">
       <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center mb-5 sm:mb-7 shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
       <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0d2a21] mb-3 sm:mb-5 font-nanum leading-tight">{title}</h3>
       <p className="text-[#0d2a21]/60 leading-relaxed text-sm sm:text-base lg:text-lg">{desc}</p>
    </div>
  )
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="relative pt-12 border-t border-white/10">
       <span className="absolute top-0 left-0 text-[14px] font-black text-[#10b981] mt-4">{number}</span>
       <h4 className="text-2xl font-bold mb-4">{title}</h4>
       <p className="text-white/60 leading-relaxed text-sm">{desc}</p>
    </div>
  )
}
