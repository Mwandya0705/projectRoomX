'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart3, MousePointerClick, Zap, Target } from 'lucide-react'

export default function AdroomPage() {
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
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          <div>
            <span className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block">
              PERFORMANCE ENGINE
            </span>
            <h1 className="text-[72px] lg:text-[88px] font-bold text-[#0d2a21] leading-[0.9] tracking-tighter mb-8 font-nanum">
              Adroom. <br/>Precision Reach.
            </h1>
            <p className="text-xl text-[#0d2a21]/70 leading-relaxed max-w-xl font-satoshi">
              Adroom is the intelligence layer for your room. It combines real-time 
              campaign analytics with audience targeting, ensuring your private rooms 
              are filled with high-intent subscribers from day one.
            </p>
            <div className="mt-10 flex gap-4">
               <button className="px-8 py-4 bg-[#0d2a21] text-white rounded-full font-bold shadow-lg hover:bg-[#184638] transition-all">
                 Learn More
               </button>
            </div>
          </div>
          <div className="relative aspect-square rounded-[4rem] overflow-hidden bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] p-12 shadow-2xl">
             <div className="w-full h-full bg-white/20 backdrop-blur-2xl rounded-[3rem] border border-white/40 flex items-center justify-center text-white/40 font-bold italic">
                Adroom_Hero_Mockup_Prop
             </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-32">
          <div className="bg-white/40 backdrop-blur-md p-12 rounded-[3.5rem] border border-white/60">
             <BarChart3 className="w-10 h-10 text-blue-600 mb-8" />
             <h3 className="text-3xl font-bold text-[#0d2a21] mb-4 font-nanum">Real-Time Funnel Tracking</h3>
             <p className="text-[#0d2a21]/60 leading-relaxed">
               Monitor every click, conversion, and drop-off in real-time. Adroom connects 
               directly to your live room entry points to provide a full conversion dashboard.
             </p>
          </div>
          <div className="bg-white/40 backdrop-blur-md p-12 rounded-[3.5rem] border border-white/60">
             <Target className="w-10 h-10 text-purple-600 mb-8" />
             <h3 className="text-3xl font-bold text-[#0d2a21] mb-4 font-nanum">Intent-Based Targeting</h3>
             <p className="text-[#0d2a21]/60 leading-relaxed">
               Analyze member behavior and segment your audience based on their engagement 
               level within the room. Targeted reach has never been this granular.
             </p>
          </div>
        </div>

        {/* AI Creative Section */}
        <div className="bg-[#0d2a21] rounded-[4rem] p-16 lg:p-24 text-white flex flex-col items-center text-center">
           <Zap className="w-12 h-12 text-[#10b981] mb-12 shadow-[0_0_30px_#10b981]" />
           <h2 className="text-[48px] lg:text-[68px] font-bold leading-none mb-8 font-nanum tracking-tight">AI Creative Engine</h2>
           <p className="text-xl text-white/70 mb-12 max-w-2xl font-satoshi">
             Adroom integrates directly with your content sessions to generate high-performing 
             meta-ads and social clips automatically. Turn your best room moments into 
             your next viral campaign in seconds.
           </p>
           <button className="px-10 py-4 bg-[#10b981] text-[#0d2a21] rounded-full font-bold shadow-xl hover:bg-[#059669] transition-all">
             Try AI Creative
           </button>
        </div>

      </div>
    </div>
  )
}
