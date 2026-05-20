'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, TrendingUp, Award } from 'lucide-react'

const STORIES = [
  {
    name: "Caleb's Trading Room",
    stat: "$240k MRR",
    tag: "High-Freq Trading",
    desc: "How Caleb scaled a Discord signal room into a multi-million dollar private trading hub.",
    img: "Story_Caleb_Prop"
  },
  {
    name: "Design Summit Live",
    stat: "1,200+ Paid Members",
    tag: "Creative Education",
    desc: "A case study on running global workshops with zero lag using Prism's 4K capture.",
    img: "Story_Design_Prop"
  },
  {
    name: "The Pulse Crypto",
    stat: "85% Conversion Rate",
    tag: "Crypto Community",
    desc: "Moving from public streams to high-value private access increased revenue by 4x.",
    img: "Story_Pulse_Prop"
  }
]

export default function PeerStoriesPage() {
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
        <div className="max-w-3xl mb-24">
          <h1 className="text-[72px] lg:text-[88px] font-bold text-[#0d2a21] leading-none tracking-tighter mb-8 font-nanum">
             Real Experts. <br/>Real Results.
          </h1>
          <p className="text-xl text-[#0d2a21]/70 leading-relaxed font-satoshi">
            Peer Stories is where our community shares their journeys. From scaling private 
            trading rooms to building global education brands, these are the creators 
            redefining the monetization era on RoomX.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-24">
          {STORIES.map((story) => (
            <div key={story.name} className="group cursor-pointer">
              <div className="aspect-[4/5] rounded-[3rem] bg-gray-200 overflow-hidden mb-6 relative">
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold italic group-hover:scale-110 transition-transform duration-500">
                    {story.img}
                 </div>
                 <div className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/40">
                   <Play className="w-6 h-6 text-white fill-white" />
                 </div>
              </div>
              <span className="px-3 py-1 bg-[#0d2a21]/5 text-[#0d2a21] rounded-full text-[11px] font-bold uppercase tracking-wider mb-4 inline-block">
                {story.tag}
              </span>
              <h3 className="text-2xl font-bold text-[#0d2a21] mb-2">{story.name}</h3>
              <p className="text-[#0d2a21]/60 text-sm leading-relaxed mb-4">{story.desc}</p>
              <div className="flex items-center gap-2 text-[#10b981] font-bold">
                 <TrendingUp className="w-4 h-4" />
                 <span>{story.stat}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Creator Spotlight */}
        <div className="bg-[#10b981] rounded-[4rem] p-16 lg:p-24 text-[#0d2a21] grid lg:grid-cols-2 gap-16 items-center">
           <div>
              <Award className="w-12 h-12 mb-8" />
              <h2 className="text-[52px] font-bold leading-none mb-8 font-nanum tracking-tight">Become the next success story</h2>
              <p className="text-lg text-[#0d2a21]/80 mb-10 leading-relaxed max-w-md">
                Starting your room is just the beginning. Our Growth team is here to help you 
                optimize your funnels and maximize subscriber retention.
              </p>
              <Link href="/company/contact">
                <button className="px-10 py-4 bg-[#0d2a21] text-white rounded-full font-bold shadow-xl hover:bg-[#184638] transition-all">
                  Apply for Spotlight
                </button>
              </Link>
           </div>
           <div className="aspect-square bg-[#0a8a61] rounded-[3rem] flex items-center justify-center text-[#10b981]/50 font-bold italic">
              Spotlight_Feature_Prop
           </div>
        </div>

      </div>
    </div>
  )
}
