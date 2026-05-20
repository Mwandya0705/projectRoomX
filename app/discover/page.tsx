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
        <div className="max-w-4xl mb-24">
          <h1 className="text-[72px] lg:text-[92px] font-bold text-[#0d2a21] leading-none tracking-tighter mb-8 font-nanum">
             The Infrastructure <br/><span className="text-[#10b981]">of Influence.</span>
          </h1>
          <p className="text-xl text-[#0d2a21]/70 leading-relaxed font-satoshi max-w-2xl">
            Discover the engines that drive the next generation of private communities. 
            RoomX is built to handle the complexities of real-time expertise, 
            so you can focus on building your legacy.
          </p>
        </div>

        {/* Discover Grid */}
        <div className="grid lg:grid-cols-2 gap-20 mb-32">
           <div className="space-y-20">
              <DiscoverSection 
                icon={<Cpu className="w-8 h-8 text-emerald-600" />}
                title="Prism: The Live Engine"
                desc="A proprietary streaming protocol optimized for ultra-low latency. Whether it's 4K chart analysis or high-res design summits, Prism ensures not a single pixel or second is lost."
              />
              <DiscoverSection 
                icon={<Zap className="w-8 h-8 text-blue-600" />}
                title="Adroom: The Growth Intelligence"
                desc="Beyond static ads. Adroom uses AI to analyze your live sessions and generate high-intent social clips that drive traffic directly to your next room."
              />
           </div>
           <div className="aspect-[4/5] rounded-[4rem] bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-gray-400 font-bold italic shadow-sm relative overflow-hidden">
              Platform_Preview_Video_Prop
              <div className="absolute inset-0 bg-gradient-to-t from-[#f5f6f2] to-transparent opacity-40"></div>
           </div>
        </div>

        {/* The Workflow */}
        <div className="bg-[#0d2a21] rounded-[4rem] p-16 lg:p-24 text-white">
           <h2 className="text-5xl lg:text-[72px] font-bold mb-16 font-nanum tracking-tight text-center">How it flows</h2>
           <div className="grid md:grid-cols-3 gap-12">
              <Step number="01" title="Build your Room" desc="Configure your brand, set your subscription tiers, and prepare your workspace." />
              <Step number="02" title="Go Live" desc="Launch Prism and interact with your high-intent community in real-time." />
              <Step number="03" title="Scale with Adroom" desc="Turn your highlights into viral campaigns and scale your subscriber base." />
           </div>
        </div>

        {/* Final CTA */}
        <div className="mt-32 text-center">
           <h2 className="text-4xl font-bold text-[#0d2a21] mb-8 font-nanum">Ready to see it in action?</h2>
           <Link href="/book-a-demo">
             <button className="px-12 py-5 bg-[#10b981] hover:bg-[#059669] text-[#0d2a21] rounded-full text-lg font-bold transition-all shadow-xl">
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
       <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
       <h3 className="text-4xl font-bold text-[#0d2a21] mb-6 font-nanum leading-tight">{title}</h3>
       <p className="text-[#0d2a21]/60 leading-relaxed font-satoshi text-lg">{desc}</p>
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
