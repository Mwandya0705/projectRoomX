'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, ShieldCheck, Briefcase, Rocket } from 'lucide-react'

export default function TeamSolutionsPage() {
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
             Solutions <br/><span className="text-[#10b981]">By Team.</span>
          </h1>
          <p className="text-xl text-[#0d2a21]/70 leading-relaxed font-satoshi">
            Whether you're an engineering lead, a growth strategist, or a community director, 
            RoomX provides the specialized infrastructure your team needs to host 
            high-intent private sessions.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-32">
           <TeamCard 
             icon={<Rocket className="w-8 h-8 text-emerald-600" />}
             title="Product & Engineering"
             desc="Host secure tech summits, 4K design reviews, and alpha-testing walkthroughs with token-based access control."
           />
           <TeamCard 
             icon={<Briefcase className="w-8 h-8 text-blue-600" />}
             title="Marketing & Growth"
             desc="Fill your funnels with high-intent leads using Adroom analytics and automated AI creative generators."
           />
           <TeamCard 
             icon={<Users className="w-8 h-8 text-purple-600" />}
             title="Community & Engagement"
             desc="Move your base from noisy public channels to focused private rooms with built-in moderation and deep chat tools."
           />
           <TeamCard 
             icon={<ShieldCheck className="w-8 h-8 text-orange-600" />}
             title="Security & Compliance"
             desc="Enterprise-grade RLS and data sovereignty ensuring your team's sensitive intellectual property stays protected."
           />
        </div>

        {/* Visual Showcase */}
        <div className="aspect-video rounded-[4rem] bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-gray-400 font-bold italic shadow-sm">
           Team_Solution_Workflow_Prop
        </div>

      </div>
    </div>
  )
}

function TeamCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white/40 backdrop-blur-md p-12 rounded-[3.5rem] border border-white/60 hover:bg-white transition-all shadow-sm">
       <div className="mb-8">{icon}</div>
       <h3 className="text-3xl font-bold text-[#0d2a21] mb-4 font-nanum">{title}</h3>
       <p className="text-[#0d2a21]/60 leading-relaxed font-satoshi text-lg">{desc}</p>
    </div>
  )
}
