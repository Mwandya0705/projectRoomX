'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Lock, FileText, Globe } from 'lucide-react'

export default function CompliancePage() {
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
             <ShieldCheck className="w-6 h-6 text-emerald-500" />
             <span className="text-xs font-black text-[#0d2a21]/40 uppercase tracking-[0.2em]">Trust & Security</span>
          </div>
          <h1 className="text-[72px] lg:text-[88px] font-bold text-[#0d2a21] leading-none tracking-tighter mb-8 font-nanum">
             Enterprise <br/><span className="text-[#10b981]">Compliance.</span>
          </h1>
          <p className="text-xl text-[#0d2a21]/70 leading-relaxed font-satoshi">
            Your data sovereignty is our priority. RoomX is built with the global 
            security standards and regulatory frameworks required to operate 
            high-trust environments across borders.
          </p>
        </div>

        {/* Compliance Pillars */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
           <ComplianceCard 
             icon={<Lock className="w-6 h-6 text-emerald-600" />}
             title="Data Sovereignty"
             desc="Your data stays yours. We use advanced RLS and isolated database schemas to ensure absolute privacy for your room."
           />
           <ComplianceCard 
             icon={<FileText className="w-6 h-6 text-blue-600" />}
             title="GDPR & SOC2"
             desc="Built from the ground up to align with modern privacy regulations and enterprise security protocols."
           />
           <ComplianceCard 
             icon={<Globe className="w-6 h-6 text-purple-600" />}
             title="Global Payments"
             desc="Stripe-powered compliance for tax handling, KYC, and cross-border monetization in 135+ currencies."
           />
        </div>

        {/* Security Statement */}
        <div className="bg-white/40 backdrop-blur-md rounded-[3.5rem] p-16 lg:p-24 border border-white/60">
           <h2 className="text-4xl font-bold text-[#0d2a21] mb-8 font-nanum text-center">Our Security Commitment</h2>
           <div className="max-w-3xl mx-auto space-y-6 text-lg text-[#0d2a21]/70 leading-relaxed font-satoshi text-center">
              <p>
                We understand that for experts and traders, intellectual property is the 
                most valuable asset. That's why RoomX doesn't just provide a video 
                connection—we provide a secure vault.
              </p>
              <p>
                From encrypted streaming tunnels to rigorous access control, every 
                layer of our stack is designed to prevent unauthorized access and 
                ensure your expertise is monetized on your terms.
              </p>
           </div>
        </div>

      </div>
    </div>
  )
}

function ComplianceCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/60 shadow-sm flex flex-col items-center text-center">
       <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm">{icon}</div>
       <h3 className="text-2xl font-bold text-[#0d2a21] mb-4">{title}</h3>
       <p className="text-[#0d2a21]/60 leading-relaxed font-satoshi text-sm">{desc}</p>
    </div>
  )
}
