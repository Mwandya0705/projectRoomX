'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Target, Globe } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f5f6f2] font-sans pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-20">
        
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-[#0d2a21]/60 hover:text-[#0d2a21] transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[14px] font-bold">Back to Home</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="max-w-4xl mb-24">
          <h1 className="text-[72px] lg:text-[92px] font-bold text-[#0d2a21] tracking-tight leading-none mb-8 font-nanum">
            The Mission Behind <span className="text-[#10b981]">RoomX</span>
          </h1>
          <p className="text-[22px] text-[#0d2a21]/70 leading-relaxed font-satoshi">
            We exist to empower creators, traders, and experts to reclaim their value. 
            RoomX is the infrastructure for the next generation of private communities, 
            where expertise is prioritized, access is exclusive, and monetization is seamless.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid md:grid-cols-3 gap-12 mb-24">
          <div className="bg-white/40 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/60 shadow-sm">
            <div className="w-12 h-12 bg-[#10b981]/10 rounded-full flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-[#10b981]" />
            </div>
            <h3 className="text-2xl font-bold text-[#0d2a21] mb-4">Focused Expertise</h3>
            <p className="text-[#0d2a21]/60 leading-relaxed">
              Unlike broad social platforms, RoomX is built for depth. We provide the tools 
              to turn casual followers into a committed premium community.
            </p>
          </div>

          <div className="bg-white/40 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/60 shadow-sm">
            <div className="w-12 h-12 bg-[#3b82f6]/10 rounded-full flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <h3 className="text-2xl font-bold text-[#0d2a21] mb-4">Creator Sovereignty</h3>
            <p className="text-[#0d2a21]/60 leading-relaxed">
              You own your audience, your data, and your revenue. No opaque algorithms 
              deciding your reach—just direct, high-value connection.
            </p>
          </div>

          <div className="bg-white/40 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/60 shadow-sm">
            <div className="w-12 h-12 bg-[#f59e0b]/10 rounded-full flex items-center justify-center mb-6">
              <Globe className="w-6 h-6 text-[#f59e0b]" />
            </div>
            <h3 className="text-2xl font-bold text-[#0d2a21] mb-4">Global Infrastructure</h3>
            <p className="text-[#0d2a21]/60 leading-relaxed">
              Real-time streaming, secure payments, and interactive engagement across 
              borders. Everything you need to scale your room globally.
            </p>
          </div>
        </div>

        {/* Section: The Story */}
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-24">
          <div>
            <h2 className="text-5xl font-bold text-[#0d2a21] mb-8 font-nanum tracking-tight">How it started</h2>
            <div className="space-y-6 text-[18px] text-[#0d2a21]/70 leading-relaxed">
              <p>
                RoomX began when we saw creators struggling to find a home. Discord was too chaotic, 
                Zoom was too clinical, and Patreon lacked the real-time engagement that traders 
                and high-level educators actually needed.
              </p>
              <p>
                We built Prism and Adroom to solve these problems—creating a space that is as 
                beautiful as it is functional. A space where a live room feels like a 
                premium lounge, not just another video call.
              </p>
            </div>
          </div>
          <div className="aspect-[4/3] rounded-[3rem] overflow-hidden bg-gray-200 relative">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold italic">
               AboutImage_Hero_Prop
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#0d2a21] rounded-[3.5rem] p-16 lg:p-24 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-6xl font-bold mb-8 font-nanum tracking-tight">Ready to build your era?</h2>
            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
              Join thousands of creators who have swapped algorithmic chaos for 
              focused, profitable private rooms.
            </p>
            <Link href="/sign-up">
              <button className="px-12 py-5 bg-[#10b981] hover:bg-[#059669] text-[#0d2a21] rounded-full text-lg font-bold transition-all shadow-xl">
                Get Started with RoomX
              </button>
            </Link>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             AboutCTA_Video_Prop
          </div>
        </div>

      </div>
    </div>
  )
}
