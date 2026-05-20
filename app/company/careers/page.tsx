'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Rocket, Zap, Heart, Coffee } from 'lucide-react'

export default function CareersPage() {
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
          <h1 className="text-[72px] lg:text-[92px] font-bold text-[#0d2a21] leading-[0.9] tracking-tighter mb-8 font-nanum">
             Build the next era of <br/><span className="text-[#3b82f6]">Monetization.</span>
          </h1>
          <p className="text-[22px] text-[#0d2a21]/70 leading-relaxed font-satoshi">
            We’re looking for designers, engineers, and strategists who believe that 
            expertise should be rewarded, and that the tools we build can change 
            the way the world shares knowledge. Join us at RoomX.
          </p>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          <ValueCard icon={<Zap className="text-yellow-500" />} title="High-Velocity" desc="We move fast, ship daily, and iterate constantly." />
          <ValueCard icon={<Rocket className="text-blue-500" />} title="Audacious Goals" desc="We’re not just building a tool; we’re building a new economy." />
          <ValueCard icon={<Heart className="text-red-500" />} title="Creator Obsessed" desc="Every decision we make starts with the creator’s success." />
          <ValueCard icon={<Coffee className="text-orange-500" />} title="Deep Craft" desc="We care about the details—from code quality to pixel-perfect UI." />
        </div>

        {/* Open Roles */}
        <div className="mb-24">
           <h2 className="text-[52px] font-bold text-[#0d2a21] mb-12 font-nanum">Open Roles</h2>
           <div className="space-y-4">
              <JobRow title="Senior Fullstack Engineer" team="Product" location="Remote / London" />
              <JobRow title="Creative UI Designer" team="Design" location="Remote / London" />
              <JobRow title="Growth Operations Manager" team="Marketing" location="Remote / New York" />
              <JobRow title="Frontend Performance Engineer" team="Infrastructure" location="Remote" />
           </div>
        </div>

        {/* Culture Section */}
        <div className="bg-white/40 backdrop-blur-md rounded-[4rem] p-16 lg:p-24 border border-white/60 flex flex-col items-center text-center">
           <h2 className="text-4xl lg:text-6xl font-bold text-[#0d2a21] mb-8 font-nanum tracking-tight">Work where the future happens</h2>
           <p className="text-xl text-[#0d2a21]/70 mb-12 max-w-2xl font-satoshi">
             RoomX is a globally distributed team. We offer competitive salaries, equity 
             packages, and the freedom to work from wherever you are most inspired.
           </p>
           <div className="aspect-video w-full max-w-4xl rounded-[3rem] bg-gray-200 flex items-center justify-center text-gray-400 font-bold italic">
              Culture_Video_Prop
           </div>
        </div>

      </div>
    </div>
  )
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white/30 p-8 rounded-[2rem] border border-white/50">
       <div className="w-10 h-10 mb-6 flex items-center justify-center bg-white rounded-xl shadow-sm">{icon}</div>
       <h4 className="text-lg font-bold text-[#0d2a21] mb-2">{title}</h4>
       <p className="text-sm text-[#0d2a21]/60 leading-relaxed">{desc}</p>
    </div>
  )
}

function JobRow({ title, team, location }: { title: string; team: string; location: string }) {
  return (
    <div className="group flex items-center justify-between p-8 bg-white/20 hover:bg-white/50 rounded-[2rem] border border-white/40 transition-all cursor-pointer">
       <div>
          <h3 className="text-xl font-bold text-[#0d2a21]">{title}</h3>
          <p className="text-sm text-[#0d2a21]/60 mt-1">{team} • {location}</p>
       </div>
       <div className="w-12 h-12 rounded-full border border-[#0d2a21]/10 flex items-center justify-center group-hover:bg-[#0d2a21] group-hover:text-white transition-all">
          →
       </div>
    </div>
  )
}
