'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Puzzle, Zap, ChevronRight, Box } from 'lucide-react'

const INTEGRATIONS = [
  { name: "Stripe", desc: "Automated billing and global payment processing.", icon: "💳" },
  { name: "Slack", desc: "Sync room notifications and member updates.", icon: "💬" },
  { name: "Discord", desc: "Bridge your existing community to private rooms.", icon: "👾" },
  { name: "Zapier", desc: "Connect RoomX to 5,000+ other apps.", icon: "⚡" },
  { name: "HubSpot", desc: "Track subscriber growth in your CRM.", icon: "📊" },
  { name: "PostHog", desc: "Deep analytics for member engagement.", icon: "🦔" }
]

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#f5f6f2] font-sans pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-20">
        
        {/* Navigation */}
        <div className="mb-12">
          <Link href="/knowledge-hub" className="inline-flex items-center gap-2 text-[#0d2a21]/60 hover:text-[#0d2a21] transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[14px] font-bold">Back to Hub</span>
          </Link>
        </div>

        {/* Hero */}
        <div className="max-w-4xl mb-24">
          <div className="flex items-center gap-3 mb-6">
             <Puzzle className="w-6 h-6 text-indigo-500" />
             <span className="text-xs font-black text-[#0d2a21]/40 uppercase tracking-[0.2em]">Ecosystem</span>
          </div>
          <h1 className="text-[72px] lg:text-[88px] font-bold text-[#0d2a21] leading-none tracking-tighter mb-8 font-nanum">
             Seamless <br/><span className="text-[#6366f1]">Integrations.</span>
          </h1>
          <p className="text-xl text-[#0d2a21]/70 leading-relaxed font-satoshi">
            RoomX doesn't live in a silo. We've built deep integrations with the tools you 
            already use, ensuring that your private rooms are connected to your 
            existing workflows, payments, and marketing stacks.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
           {INTEGRATIONS.map((integ) => (
             <div key={integ.name} className="group bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 hover:bg-white transition-all flex items-start gap-6 cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">{integ.icon}</div>
                <div>
                   <h3 className="text-xl font-bold text-[#0d2a21] mb-1">{integ.name}</h3>
                   <p className="text-[#0d2a21]/50 text-sm leading-relaxed">{integ.desc}</p>
                </div>
             </div>
           ))}
        </div>

        {/* API Docs CTA */}
        <div className="bg-[#0d2a21] rounded-[4rem] p-16 lg:p-20 text-white flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-8">
               <Box className="w-16 h-16 text-[#10b981]" />
               <div>
                  <h2 className="text-4xl font-bold font-nanum">Building something custom?</h2>
                  <p className="text-white/60 text-lg font-satoshi mt-2">Explore our robust API and developer SDKs.</p>
               </div>
            </div>
            <button className="flex items-center gap-2 px-10 py-5 bg-[#10b981] text-[#0d2a21] rounded-full font-bold hover:bg-[#059669] transition-all group shrink-0">
               <span>View API Documentation</span>
               <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

      </div>
    </div>
  )
}
