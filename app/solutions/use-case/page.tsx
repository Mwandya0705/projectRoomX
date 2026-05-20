'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, LineChart, GraduationCap, Link2, Ghost } from 'lucide-react'

export default function UseCaseSolutionsPage() {
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
             Solutions <br/><span className="text-[#3b82f6]">By Use Case.</span>
          </h1>
          <p className="text-xl text-[#0d2a21]/70 leading-relaxed font-satoshi">
            From algorithmic trading rooms to global creative masterclasses, RoomX provides 
            the exact environment needed for every specialized use case. Explore how 
            leaders are using our engines.
          </p>
        </div>

        {/* Use Cases */}
        <div className="space-y-8 mb-24">
           <UseCaseRow 
             icon={<LineChart className="w-8 h-8 text-emerald-600" />}
             title="Financial Signal Rooms"
             desc="Ultra-low latency streaming for chart analysis, live triggers, and trade execution walkthroughs."
             tag="HIGH PERFORMANCE"
           />
           <UseCaseRow 
             icon={<GraduationCap className="w-8 h-8 text-blue-600" />}
             title="Premium Masterclasses"
             desc="Interactive teaching high-fidelity screen sharing, real-time Q&A, and automated session recording."
             tag="EDUCATION"
           />
           <UseCaseRow 
             icon={<Link2 className="w-8 h-8 text-purple-600" />}
             title="Exclusive Networking"
             desc="Private lounge-style rooms for high-net-worth networking, policy discussions, and strategic pivots."
             tag="COMMUNITY"
           />
           <UseCaseRow 
             icon={<Ghost className="w-8 h-8 text-orange-600" />}
             title="Alpha Groups"
             desc="Confidential research hubs for crypto explorers and early-stage investors sharing unpublicized alpha."
             tag="INVESTMENT"
           />
        </div>

        {/* Final CTA */}
        <div className="bg-[#0d2a21] rounded-[3.5rem] p-16 lg:p-24 text-center">
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8 font-nanum tracking-tight">Have a unique use case?</h2>
            <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto font-satoshi">
              Our infrastructure is flexible. Talk to our solutions team about building a 
              custom experience tailored to your specific community needs.
            </p>
            <Link href="/company/contact">
              <button className="px-12 py-5 bg-[#10b981] hover:bg-[#059669] text-[#0d2a21] rounded-full text-lg font-bold transition-all shadow-xl">
                Consult with an Expert
              </button>
            </Link>
        </div>

      </div>
    </div>
  )
}

function UseCaseRow({ icon, title, desc, tag }: { icon: React.ReactNode; title: string; desc: string; tag: string }) {
  return (
    <div className="group bg-white/40 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/60 hover:bg-white transition-all flex flex-col lg:flex-row gap-10 lg:items-center">
       <div className="w-16 h-16 rounded-[1.5rem] bg-white flex items-center justify-center shrink-0 shadow-sm">{icon}</div>
       <div className="flex-1">
          <span className="text-[10px] font-black text-[#0d2a21]/30 uppercase tracking-[0.2em]">{tag}</span>
          <h3 className="text-3xl font-bold text-[#0d2a21] mt-2 mb-3 font-nanum">{title}</h3>
          <p className="text-[#0d2a21]/60 leading-relaxed font-satoshi text-lg max-w-3xl">{desc}</p>
       </div>
       <div className="w-12 h-12 rounded-full border border-[#0d2a21]/10 flex items-center justify-center group-hover:bg-[#0d2a21] group-hover:text-white transition-all">
          →
       </div>
    </div>
  )
}
