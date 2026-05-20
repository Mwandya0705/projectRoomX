'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, Play, ChevronRight } from 'lucide-react'

export default function FeaturedStoriesPage() {
  return (
    <div className="min-h-screen bg-[#f5f6f2] font-sans pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-20">
        
        {/* Navigation */}
        <div className="mb-12">
          <Link href="/peer-stories" className="inline-flex items-center gap-2 text-[#0d2a21]/60 hover:text-[#0d2a21] transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[14px] font-bold">Back to Stories</span>
          </Link>
        </div>

        {/* Hero */}
        <div className="max-w-4xl mb-24">
          <div className="flex items-center gap-3 mb-6">
             <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
             <span className="text-xs font-black text-[#0d2a21]/40 uppercase tracking-[0.2em]">Featured Spotlight</span>
          </div>
          <h1 className="text-[72px] lg:text-[88px] font-bold text-[#0d2a21] leading-none tracking-tighter mb-8 font-nanum">
             Top Tier <br/><span className="text-[#10b981]">Success.</span>
          </h1>
          <p className="text-xl text-[#0d2a21]/70 leading-relaxed font-satoshi">
            These are the creators pushing the boundaries of what's possible on RoomX. 
            From innovative monetization strategies to groundbreaking community engagement, 
            learn from those at the top of their game.
          </p>
        </div>

        {/* Featured Video Section */}
        <div className="bg-[#0d2a21] rounded-[4rem] p-12 lg:p-20 overflow-hidden relative mb-24">
           <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                 <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8 font-nanum tracking-tight leading-[1.1]">The Rise of the Real-Time Signal Room</h2>
                 <p className="text-lg text-white/60 mb-10 leading-relaxed max-w-md font-satoshi">
                   In this feature, we follow Marcus, one of the first creators to leverage 
                   Prism's low-latency streaming to build a 7-figure trading empire.
                 </p>
                 <button className="flex items-center gap-3 bg-[#10b981] text-[#0d2a21] px-8 py-4 rounded-full font-bold group">
                    <Play className="w-4 h-4 fill-current group-hover:scale-125 transition-transform" />
                    <span>Watch Story</span>
                 </button>
              </div>
              <div className="aspect-video rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/20 font-bold italic">
                 Featured_Story_Video_Prop
              </div>
           </div>
        </div>

        {/* Other Featured Cards */}
        <div className="grid md:grid-cols-2 gap-8">
           <FeaturedCard title="Education Reimagined" creator="Sarah J." img="Story_Featured_2_Prop" />
           <FeaturedCard title="Tech Summits on the Move" creator="Leo Chen" img="Story_Featured_3_Prop" />
        </div>

      </div>
    </div>
  )
}

function FeaturedCard({ title, creator, img }: { title: string; creator: string; img: string }) {
  return (
    <div className="group bg-white/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/60 hover:bg-white transition-all cursor-pointer flex justify-between items-center">
       <div className="flex gap-6 items-center">
          <div className="w-24 h-24 rounded-3xl bg-gray-200 shrink-0 flex items-center justify-center text-[10px] text-gray-400 font-bold italic">
             {img}
          </div>
          <div>
             <h3 className="text-2xl font-bold text-[#0d2a21] mb-1">{title}</h3>
             <p className="text-[#0d2a21]/50 font-medium">By {creator}</p>
          </div>
       </div>
       <ChevronRight className="w-8 h-8 text-[#0d2a21]/20 group-hover:text-[#10b981] group-hover:translate-x-2 transition-all" />
    </div>
  )
}
