'use client'

import React from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  Video, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  DollarSign, 
  Users, 
  Lock 
} from 'lucide-react'

export default function BookDemoPage() {
  return (
    <div className="min-h-screen bg-[#f5f6f2] font-satoshi pt-32 pb-40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-20">
        
        {/* Navigation */}
        <div className="mb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-[#0d2a21]/60 hover:text-[#0d2a21] transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[14px] font-bold">Back to Home</span>
          </Link>
        </div>

        {/* Hero: The Monetization Concept */}
        <div className="relative mb-32">
           <div className="absolute -top-40 -left-20 w-[600px] h-[600px] bg-[#10b981]/5 blur-[120px] rounded-full -z-10" />
           
           <div className="max-w-3xl mb-16">
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[92px] font-bold text-[#0d2a21] leading-[0.9] tracking-tighter mb-8 font-nanum">
                 The Monetization <br/><span className="text-[#10b981]">Pipeline.</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#0d2a21]/60 leading-relaxed font-medium max-w-2xl">
                 RoomX isn't just a platform—it's an economic engine. We've optimized every friction point between your expertise and your revenue.
              </p>
           </div>

           {/* Aesthetic Pipeline Visual */}
           <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0d2a21]/10 to-transparent hidden md:block -z-10" />
              
              <StepCard 
                icon={<Lock className="w-6 h-6" />}
                title="1. Private Sanctuary"
                desc="Create token-gated rooms for your high-value community. Your expertise, protected."
                color="bg-[#0d2a21]"
              />
              <StepCard 
                icon={<Users className="w-6 h-6" />}
                title="2. Trusted Access"
                desc="Members pay for priority entry. Frictionless stripe-powered subscriptions."
                color="bg-[#10b981]"
                active
              />
              <StepCard 
                icon={<DollarSign className="w-6 h-6" />}
                title="3. Compounding Rev"
                desc="Automated payouts and analytics. Watch your creator era scale in real-time."
                color="bg-[#0d2a21]"
              />
           </div>
        </div>

        {/* Call to Action */}
        <div className="bg-[#0d2a21] rounded-[2rem] sm:rounded-[4rem] p-8 sm:p-12 lg:p-24 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10b981]/10 blur-[100px] rounded-full" />
           
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="max-w-xl">
                 <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold font-nanum mb-6 leading-tight">Ready to build your <br/>Sanctuary?</h2>
                 <p className="text-white/40 text-base sm:text-lg font-medium leading-relaxed">
                    Schedule a 1-on-1 Sanctuary Walkthrough with our strategists to configure 
                    your monetization pipeline today.
                 </p>
              </div>
              
              <Link href="/dashboard/scheduling" className="w-full sm:w-auto">
                 <button className="w-full sm:w-auto px-6 py-4 sm:px-12 sm:py-7 bg-white text-[#0d2a21] rounded-[1.5rem] sm:rounded-[2.5rem] font-bold text-base sm:text-xl hover:scale-105 hover:bg-[#10b981] transition-all flex items-center justify-center gap-3 sm:gap-4 group shadow-xl">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Schedule Now</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
                  </button>
              </Link>
           </div>
        </div>

        {/* Benefits Grid */}
        <div className="mt-32 grid md:grid-cols-3 gap-16">
           <div className="space-y-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Zap className="w-5 h-5 text-yellow-500" /></div>
              <h4 className="text-xl font-bold text-[#0d2a21]">Instant Setup</h4>
              <p className="text-sm text-[#0d2a21]/50 leading-relaxed">Go live with your first sanctuary in under 5 minutes.</p>
           </div>
           <div className="space-y-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><ShieldCheck className="w-5 h-5 text-emerald-500" /></div>
              <h4 className="text-xl font-bold text-[#0d2a21]">Secure Payouts</h4>
              <p className="text-sm text-[#0d2a21]/50 leading-relaxed">Enterprise-grade security for all member transactions.</p>
           </div>
           <div className="space-y-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Sparkles className="w-5 h-5 text-purple-500" /></div>
              <h4 className="text-xl font-bold text-[#0d2a21]">AI Optimization</h4>
              <p className="text-sm text-[#0d2a21]/50 leading-relaxed">Our engines help you price your rooms for maximum value.</p>
           </div>
        </div>

      </div>
    </div>
  )
}

function StepCard({ icon, title, desc, color, active = false }: any) {
  return (
    <div className={`p-8 rounded-[3rem] border transition-all ${active ? 'bg-white border-[#10b981]/20 shadow-xl scale-105 z-10' : 'bg-white/50 border-white/60 hover:bg-white transition-all'}`}>
       <div className={`w-14 h-14 ${color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
          {icon}
       </div>
       <h3 className="text-2xl font-bold text-[#0d2a21] mb-3 font-nanum">{title}</h3>
       <p className="text-sm text-[#0d2a21]/50 leading-relaxed font-medium">{desc}</p>
    </div>
  )
}
