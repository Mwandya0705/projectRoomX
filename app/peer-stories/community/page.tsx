'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Users2, MessageCircle, Heart, Share2 } from 'lucide-react'

export default function CommunityStoriesPage() {
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
             <Users2 className="w-6 h-6 text-blue-500" />
             <span className="text-xs font-black text-[#0d2a21]/40 uppercase tracking-[0.2em]">Community Wins</span>
          </div>
          <h1 className="text-[72px] lg:text-[88px] font-bold text-[#0d2a21] leading-none tracking-tighter mb-8 font-nanum">
             Stronger <br/><span className="text-[#3b82f6]">Together.</span>
          </h1>
          <p className="text-xl text-[#0d2a21]/70 leading-relaxed font-satoshi">
            RoomX isn't just about the creator—it's about the connection. Explore how 
            private rooms are fostering deep networking, collaborative learning, and 
            high-trust environments that traditional social media can't touch.
          </p>
        </div>

        {/* Community Highlights */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
           <HighlightCard 
             icon={<MessageCircle className="w-6 h-6 text-blue-600" />}
             title="The Signal Effect"
             desc="How a group of 500 traders reduced collective risk by 30% through real-time chart collaboration in RoomX private sessions."
             img="Community_Stats_1_Prop"
           />
           <HighlightCard 
             icon={<Heart className="w-6 h-6 text-red-500" />}
             title="Mentorship at Scale"
             desc="Why top-tier design mentors are swapping 1-on-1 calls for focused, high-engagement rooms of 20-50 subscribers."
             img="Community_Stats_2_Prop"
           />
        </div>

        {/* Share Section */}
        <div className="bg-[#0d2a21] rounded-[4rem] p-16 lg:p-24 text-center text-white">
           <Share2 className="w-12 h-12 text-[#3b82f6] mb-8 mx-auto" />
           <h2 className="text-4xl lg:text-6xl font-bold mb-8 font-nanum tracking-tight">Share your journey</h2>
           <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto font-satoshi">
             Has your community reached a new milestone on RoomX? We want to hear about it. 
             Join the conversation and inspire the next era of creators.
           </p>
           <button className="px-12 py-5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-full text-lg font-bold transition-all shadow-xl">
             Submit Story
           </button>
        </div>

      </div>
    </div>
  )
}

function HighlightCard({ icon, title, desc, img }: { icon: React.ReactNode; title: string; desc: string; img: string }) {
  return (
    <div className="bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 overflow-hidden flex flex-col">
       <div className="p-10 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-8">{icon}</div>
          <h3 className="text-2xl font-bold text-[#0d2a21] mb-4">{title}</h3>
          <p className="text-[#0d2a21]/60 leading-relaxed font-satoshi">{desc}</p>
       </div>
       <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400 font-bold italic border-t border-white/40">
          {img}
       </div>
    </div>
  )
}
