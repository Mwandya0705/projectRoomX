'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Landmark, Cpu, Palette, Globe2 } from 'lucide-react'

export default function IndustrySolutionsPage() {
  return (
    <div className="min-h-screen bg-[#f5f6f2] font-sans pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-20">
        
        {/* Navigation */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-[#0d2a21]/60 hover:text-[#0d2a21] transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[14px] font-bold">Back to Platform</span>
          </Link>
        </div>

        {/* Hero */}
        <div className="max-w-4xl mb-24">
          <h1 className="text-[72px] lg:text-[88px] font-bold text-[#0d2a21] leading-none tracking-tighter mb-8 font-nanum">
             Solutions <br/><span className="text-[#3b82f6]">By Industry.</span>
          </h1>
          <p className="text-xl text-[#0d2a21]/70 leading-relaxed font-satoshi">
            Strategic impact depends on industry alignment. RoomX is built with the 
            compliance, performance, and creative tools required for the world's 
            most demanding sectors.
          </p>
        </div>

        {/* Industry Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-32">
           <IndustryBox 
             icon={<Landmark className="w-12 h-12 text-emerald-600" />}
             title="Finance & Fintech"
             desc="Powering the next generation of private trading desks and financial advisory rooms with sub-second latency."
           />
           <IndustryBox 
             icon={<Cpu className="w-12 h-12 text-blue-600" />}
             title="Technology & SaaS"
             desc="Scaling product launches, alpha testing phases, and developer summits with secure, high-engagement rooms."
           />
           <IndustryBox 
             icon={<Palette className="w-12 h-12 text-purple-600" />}
             title="Creative & Media"
             desc="A home for design agencies, film workshops, and creative educators to share high-fidelity work and build premium communities."
           />
           <IndustryBox 
             icon={<Globe2 className="w-12 h-12 text-orange-600" />}
             title="Global Education"
             desc="Empowering independent educators to launch cross-border masterclasses with integrated global payments."
           />
        </div>

        {/* Industry Image Prop */}
        <div className="aspect-[21/9] rounded-[4rem] bg-gray-200 flex items-center justify-center text-gray-400 font-bold italic shadow-inner">
           Industry_Vertical_Showcase_Prop
        </div>

      </div>
    </div>
  )
}

function IndustryBox({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group bg-white/40 backdrop-blur-md p-16 rounded-[4rem] border border-white/60 hover:bg-white transition-all text-center flex flex-col items-center">
       <div className="mb-10 p-6 bg-white rounded-[2.5rem] shadow-sm transform group-hover:scale-110 transition-transform">{icon}</div>
       <h3 className="text-4xl font-bold text-[#0d2a21] mb-6 font-nanum">{title}</h3>
       <p className="text-[#0d2a21]/60 leading-relaxed font-satoshi text-lg">{desc}</p>
    </div>
  )
}
