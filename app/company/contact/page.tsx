'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, MessageSquare, MapPin } from 'lucide-react'

export default function ContactPage() {
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
             Let’s Talk.
          </h1>
          <p className="text-xl text-[#0d2a21]/70 leading-relaxed font-satoshi">
            Have questions about Prism, Adroom, or how to scale your private room? 
            Our team of expert strategists is ready to help you navigate the monetization era.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-20">
           {/* Form Section */}
           <div className="bg-white/40 backdrop-blur-md p-12 rounded-[3.5rem] border border-white/60 shadow-sm">
              <form className="space-y-6">
                 <div>
                    <label className="block text-sm font-bold text-[#0d2a21] mb-2">FULL NAME</label>
                    <input type="text" placeholder="Your name" className="w-full bg-white/50 border border-black/5 rounded-2xl px-6 py-4 outline-none focus:border-[#10b981] transition-all" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-[#0d2a21] mb-2">EMAIL ADDRESS</label>
                    <input type="email" placeholder="you@company.com" className="w-full bg-white/50 border border-black/5 rounded-2xl px-6 py-4 outline-none focus:border-[#10b981] transition-all" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-[#0d2a21] mb-2">HOW CAN WE HELP?</label>
                    <textarea rows={4} placeholder="Tell us about your room..." className="w-full bg-white/50 border border-black/5 rounded-2xl px-6 py-4 outline-none focus:border-[#10b981] transition-all"></textarea>
                 </div>
                 <button className="w-full py-5 bg-[#0d2a21] text-white rounded-2xl font-bold text-lg hover:bg-[#184638] transition-all shadow-xl">
                   Send Message
                 </button>
              </form>
           </div>

           {/* Info Section */}
           <div className="space-y-12 py-8">
              <ContactRow 
                icon={<Mail className="w-6 h-6" />}
                title="Email Us"
                content="hello@roomx.ai"
                desc="For general inquiries and partnerships."
              />
              <ContactRow 
                icon={<MessageSquare className="w-6 h-6" />}
                title="Support Hub"
                content="support.roomx.ai"
                desc="Available 24/7 for technical assistance."
              />
              <ContactRow 
                icon={<MapPin className="w-6 h-6" />}
                title="Global Offices"
                content="London • New York • Singapore"
                desc="Our strategic centers across the globe."
              />
           </div>
        </div>

      </div>
    </div>
  )
}

function ContactRow({ icon, title, content, desc }: { icon: React.ReactNode; title: string; content: string; desc: string }) {
  return (
    <div className="flex gap-6">
       <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#0d2a21] shadow-sm shrink-0">
          {icon}
       </div>
       <div>
          <h4 className="text-sm font-bold text-[#0d2a21]/40 uppercase tracking-widest mb-1">{title}</h4>
          <p className="text-2xl font-bold text-[#0d2a21] mb-2">{content}</p>
          <p className="text-[#0d2a21]/60 text-sm leading-relaxed">{desc}</p>
       </div>
    </div>
  )
}
