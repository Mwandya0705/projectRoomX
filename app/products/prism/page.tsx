'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, FastForward, Maximize, Layers } from 'lucide-react'

export default function PrismPage() {
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
            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block">
              FLAGSHIP ENGINE
            </span>
            <h1 className="text-[72px] lg:text-[88px] font-bold text-[#0d2a21] leading-[0.9] tracking-tighter mb-8 font-nanum">
              Meet Prism. <br/>Precision Rooms.
            </h1>
            <p className="text-xl text-[#0d2a21]/70 leading-relaxed max-w-xl font-satoshi">
              Prism is the core infrastructure of RoomX. It’s designed specifically for 
              high-frequency trading rooms, real-time strategy sharing, and premium 
              educational summits. Low latency, crystal clarity, and absolute control.
            </p>
            <div className="mt-10 flex gap-4">
               <button className="px-8 py-4 bg-[#0d2a21] text-white rounded-full font-bold shadow-lg hover:bg-[#184638] transition-all">
                 Live Demo
               </button>
               <button className="px-8 py-4 border border-[#0d2a21]/20 rounded-full font-bold hover:bg-white transition-all">
                 Technical Specs
               </button>
            </div>
          </div>
          <div className="relative aspect-square rounded-[4rem] overflow-hidden bg-gradient-to-br from-[#10b981] to-[#3b82f6] p-12 shadow-2xl">
             <div className="w-full h-full bg-white/20 backdrop-blur-2xl rounded-[3rem] border border-white/40 flex items-center justify-center text-white/40 font-bold italic">
                Prism_Hero_Video_Prop
             </div>
             {/* Abstract elements */}
             <div className="absolute top-10 right-10 w-32 h-32 bg-white/30 rounded-full blur-3xl" />
             <div className="absolute bottom-10 left-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Technical Capabilities */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-emerald-600" />}
            title="Subscriber Vault"
            desc="Advanced RLS and token-based access ensuring only paid members can see your stream."
          />
          <FeatureCard 
            icon={<FastForward className="w-6 h-6 text-blue-600" />}
            title="Ultra-Low Latency"
            desc="Experience sub-second delay for the most critical market updates and live interactions."
          />
          <FeatureCard 
            icon={<Maximize className="w-6 h-6 text-purple-600" />}
            title="4K Screen Capture"
            desc="Crystal clear sharing for trading charts, complex code bases, and high-res design work."
          />
          <FeatureCard 
            icon={<Layers className="w-6 h-6 text-orange-600" />}
            title="Multi-Room Hub"
            desc="Run multiple concurrent sessions under one brand with seamless switching for users."
          />
        </div>

        {/* Comparison Section */}
        <div className="bg-white/50 backdrop-blur-xl rounded-[4rem] p-16 lg:p-24 border border-white/80 shadow-sm mb-32">
          <h2 className="text-[52px] font-bold text-[#0d2a21] mb-12 font-nanum text-center">Why experts choose Prism</h2>
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold italic">✓</div>
                <p className="text-lg text-[#0d2a21]/80 leading-relaxed font-satoshi">
                  Built-in monetization logic that connects directly to your Stripe payouts. No middleman fees.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold italic">✓</div>
                <p className="text-lg text-[#0d2a21]/80 leading-relaxed font-satoshi">
                  Custom branding for every room. It doesn't look like RoomX—it looks like YOUR brand.
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold italic">✓</div>
                <p className="text-lg text-[#0d2a21]/80 leading-relaxed font-satoshi">
                  AI-driven session summaries and key moment highlights generated automatically.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold italic">✓</div>
                <p className="text-lg text-[#0d2a21]/80 leading-relaxed font-satoshi">
                  Full mobile support. Your users can trade or learn on the go with our responsive web engine.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white/20 p-8 rounded-[2rem] border border-white/40 hover:bg-white/40 transition-all group">
      <div className="mb-6">{icon}</div>
      <h4 className="text-xl font-bold text-[#0d2a21] mb-3">{title}</h4>
      <p className="text-[#0d2a21]/60 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}
