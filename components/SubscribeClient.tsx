'use client'

import React, { useState } from 'react'
import { 
  ShieldCheck, 
  Zap, 
  Users, 
  ArrowRight, 
  Lock, 
  CheckCircle2
} from 'lucide-react'
import NavigationClient from '@/components/NavigationClient'

interface SubscribeClientProps {
  room: {
    id: string
    title: string
    description: string
    price: string
    creator: string
  }
  user: any
}

export default function SubscribeClient({ room, user }: SubscribeClientProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    // 🎭 Payment Orchestration
    // This would typically redirect to your Payment API (ClickPesa/Stripe)
    try {
      // Simulate redirection to checkout
      window.location.href = `/api/payments/initialize?roomId=${room.id}&userId=${user.id}`
    } catch (error) {
      console.error('Payment initialization failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f2] font-sans">
      <NavigationClient />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-20 items-center">
          
          {/* Left: Value Proposition */}
          <div className="space-y-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#0d2a21]/5 rounded-full text-[#0d2a21]/40 text-[10px] font-black uppercase tracking-[0.2em]">
              <Lock className="w-3 h-3" />
              Private Sanctuary Access
            </div>

            <h1 className="text-[62px] lg:text-[82px] font-bold text-[#0d2a21] leading-[0.9] tracking-tighter font-nanum">
              Secure your <br/><span className="text-[#10b981]">Access Pass.</span>
            </h1>

            <p className="text-[#0d2a21]/60 text-xl max-w-xl leading-relaxed">
              You're entering {room.creator}'s private sanctuary. To maintain the quality and exclusivity of the content, this room requires an active subscription pass.
            </p>

            <div className="space-y-6">
              <BenefitItem icon={<Zap className="w-5 h-5 text-yellow-500" />} text="Real-time 4K Low Latency Streaming" />
              <BenefitItem icon={<Users className="w-5 h-5 text-blue-500" />} text="Direct Collaboration with Creator" />
              <BenefitItem icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} text="Exclusive Materials & Resources" />
            </div>
          </div>

          {/* Right: The Aesthetic Checkout Card */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#10b981]/20 to-blue-500/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative bg-[#0d2a21] rounded-[4rem] p-12 lg:p-16 text-white shadow-2xl overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/10 blur-[100px] rounded-full" />
              
              <div className="relative z-10 space-y-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold font-nanum tracking-tight">{room.title}</h2>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">by {room.creator}</p>
                  </div>
                  <ShieldCheck className="w-10 h-10 text-[#10b981]" />
                </div>

                <div className="h-[1px] bg-white/10 w-full" />

                <div className="space-y-2">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Monthly Access Fee</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black font-nanum tracking-tighter">TZS {room.price}</span>
                    <span className="text-white/30 font-bold uppercase tracking-widest text-[10px]">/ month</span>
                  </div>
                </div>

                <div className="space-y-6">
                   <button 
                     onClick={handleSubscribe}
                     disabled={loading}
                     className="w-full py-3.5 sm:py-4.5 bg-[#10b981] text-[#0d2a21] rounded-full font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#059669] transition-all group/btn shadow-xl disabled:opacity-50"
                   >
                     {loading ? (
                       <span className="animate-pulse">Processing...</span>
                     ) : (
                       <>
                         <span>Secure Access Pass</span>
                         <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                       </>
                     )}
                   </button>
                   
                   <p className="text-center text-[10px] text-white/20 font-medium tracking-wide uppercase">
                     Powered by Sanctuary Sync & ClickPesa Secure
                   </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

function BenefitItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-black/5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-sm font-bold text-[#0d2a21]/80 tracking-tight">{text}</span>
    </div>
  )
}
