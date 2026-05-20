'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, Zap, Globe, Shield } from 'lucide-react'

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-[#f5f6f2] font-sans pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-20">
        
        {/* Navigation */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-[#0d2a21]/60 hover:text-[#0d2a21] transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[14px] font-bold">Back to Home</span>
          </Link>
        </div>

        {/* Hero */}
        <div className="max-w-4xl mb-24">
          <h1 className="text-[72px] lg:text-[92px] font-bold text-[#0d2a21] leading-none tracking-tighter mb-8 font-nanum">
             The People Behind <br/><span className="text-[#3b82f6]">RoomX.</span>
          </h1>
          <p className="text-[22px] text-[#0d2a21]/70 leading-relaxed font-satoshi">
            We are a group of engineers, designers, and strategists obsessed with the 
            creator economy. Our mission is to move the world beyond algorithmic 
            chaos and toward high-value, high-trust private interactions.
          </p>
        </div>

        {/* Culture Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-32">
           <CultureCard 
             icon={<Heart className="w-8 h-8 text-red-500" />}
             title="Creator First"
             desc="We don't build for platforms; we build for the individuals who breathe life into them. Every feature is a response to a real creator's need."
           />
           <CultureCard 
             icon={<Zap className="w-8 h-8 text-yellow-500" />}
             title="Radical Iteration"
             desc="The monetization era moves fast. We ship daily, listen to feedback instantly, and are never afraid to pivot for the better."
           />
           <CultureCard 
             icon={<Globe className="w-8 h-8 text-blue-500" />}
             title="Global Access"
             desc="Expertise knows no borders. Our infrastructure is built to support creators in 135+ countries from day one."
           />
           <CultureCard 
             icon={<Shield className="w-8 h-8 text-emerald-500" />}
             title="Absolute Privacy"
             desc="Trust is our foundation. We believe private rooms should stay private, with enterprise-grade security for every single user."
           />
        </div>

        {/* Leadership Section Placeholder */}
        <div className="mb-32">
           <h2 className="text-[52px] font-bold text-[#0d2a21] mb-12 font-nanum tracking-tight">Our Leadership</h2>
           <div className="grid md:grid-cols-3 gap-12">
              <TeamMember name="Founder_Prop_1" role="CEO & Vision" />
              <TeamMember name="Founder_Prop_2" role="Product & Design" />
              <TeamMember name="Founder_Prop_3" role="Engineering Lead" />
           </div>
        </div>

        {/* CTA */}
        <div className="bg-[#0d2a21] rounded-[4rem] p-16 lg:p-24 text-white text-center">
           <h2 className="text-4xl lg:text-6xl font-bold mb-8 font-nanum tracking-tight">Come build with us</h2>
           <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto font-satoshi">
             We're always looking for talented individuals who are passionate about 
             redefining how we connect and share value online.
           </p>
           <Link href="/company/careers">
             <button className="px-12 py-5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-full text-lg font-bold transition-all shadow-xl">
               View Open Roles
             </button>
           </Link>
        </div>

      </div>
    </div>
  )
}

function CultureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white/40 backdrop-blur-md p-12 rounded-[3.5rem] border border-white/60 hover:bg-white transition-all shadow-sm">
       <div className="mb-8">{icon}</div>
       <h3 className="text-3xl font-bold text-[#0d2a21] mb-4 font-nanum">{title}</h3>
       <p className="text-[#0d2a21]/60 leading-relaxed font-satoshi text-lg">{desc}</p>
    </div>
  )
}

function TeamMember({ name, role }: { name: string; role: string }) {
  return (
    <div className="group cursor-pointer">
       <div className="aspect-square rounded-[3rem] bg-gray-200 mb-6 flex items-center justify-center text-gray-400 font-bold italic group-hover:scale-105 transition-transform duration-500">
          {name}
       </div>
       <h4 className="text-2xl font-bold text-[#0d2a21]">{name === 'Founder_Prop_1' ? 'Vision' : 'Craft'}</h4>
       <p className="text-[#0d2a21]/50 font-medium uppercase tracking-widest text-xs mt-1">{role}</p>
    </div>
  )
}
