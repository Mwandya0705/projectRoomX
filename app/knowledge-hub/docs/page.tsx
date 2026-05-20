'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Book, Search, Command, ExternalLink } from 'lucide-react'

const DOC_SECTIONS = [
  {
    title: "Getting Started",
    items: ["Introduction to RoomX", "The Monetization Era", "Setting up your first room", "Prism vs Adroom"]
  },
  {
    title: "Platform Engines",
    items: ["Using Prism for Trading", "Adroom Campaign Analytics", "AI Creative Workflows", "Streaming Specs"]
  },
  {
    title: "Monetization",
    items: ["Stripe Integration", "Subscription Tiers", "Payout Schedules", "Taxes & Compliance"]
  },
  {
    title: "Community",
    items: ["Chat Moderation", "Member Insights", "Recording & Highlights", "Peer Networking"]
  }
]

export default function DocsPage() {
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

        <div className="grid lg:grid-cols-[1fr_3fr] gap-20">
           {/* Sidebar */}
           <div className="hidden lg:block space-y-10">
              {DOC_SECTIONS.map((section) => (
                <div key={section.title}>
                   <h3 className="text-xs font-black text-[#0d2a21]/30 uppercase tracking-[0.2em] mb-6">{section.title}</h3>
                   <ul className="space-y-4">
                      {section.items.map((item) => (
                        <li key={item} className="text-[15px] font-medium text-[#0d2a21]/60 hover:text-[#10b981] transition-colors cursor-pointer">
                          {item}
                        </li>
                      ))}
                   </ul>
                </div>
              ))}
           </div>

           {/* Main Content */}
           <div>
              <div className="mb-20">
                 <h1 className="text-[72px] font-bold text-[#0d2a21] leading-none tracking-tighter mb-8 font-nanum">Knowledge Hub Docs.</h1>
                 <div className="relative max-w-xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0d2a21]/30" />
                    <input 
                      type="text" 
                      placeholder="Search for articles, guides, or specifications..." 
                      className="w-full bg-white/40 backdrop-blur-md border border-white/80 rounded-3xl pl-16 pr-6 py-6 outline-none focus:border-[#10b981] transition-all"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-[#0d2a21]/5 px-3 py-1.5 rounded-lg">
                       <Command className="w-3 h-3 text-[#0d2a21]/40" />
                       <span className="text-[10px] font-bold text-[#0d2a21]/40">K</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-20">
                 <article className="max-w-3xl">
                    <h2 className="text-4xl font-bold text-[#0d2a21] mb-8 font-nanum">Welcome to the future of expertise.</h2>
                    <div className="space-y-6 text-lg text-[#0d2a21]/70 leading-relaxed font-satoshi">
                       <p>
                         This documentation is your roadmap for building a high-value private community on RoomX. 
                         Whether you're a crypto trader looking to provide real-time signals, or a designer 
                         scaling a creative summit, our engines are built to support your vision.
                       </p>
                       <p>
                         Use the sidebar to explore specific technical capabilities of Prism and Adroom, or 
                         dive into our monetization guides to learn how to optimize your revenue streams.
                       </p>
                    </div>
                    
                    <div className="mt-12 p-8 bg-[#10b981]/10 rounded-[2.5rem] border border-[#10b981]/20 flex items-start gap-6">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#10b981] shadow-sm shrink-0">
                          <ExternalLink className="w-6 h-6" />
                       </div>
                       <div>
                          <h4 className="font-bold text-[#0d2a21] mb-2 text-lg">Looking for a specific video tutorial?</h4>
                          <p className="text-[#0d2a21]/60 text-sm leading-relaxed mb-4">
                            Check out our Learning Path section for step-by-step video walkthroughs on 
                            everything from room setup to advanced audience targeting.
                          </p>
                          <Link href="/knowledge-hub/learning" className="text-[#10b981] font-bold hover:underline">Go to Learning Paths →</Link>
                       </div>
                    </div>
                 </article>
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}
