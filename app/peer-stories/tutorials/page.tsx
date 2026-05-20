'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Clock, BookOpen, Layers } from 'lucide-react'

const TUTORIALS = [
  {
    title: "Setting up your first Trading Room",
    duration: "12:45",
    tag: "Basics",
    img: "Tutorial_1_Prop"
  },
  {
    title: "Advanced Adroom Analytics 101",
    duration: "18:20",
    tag: "Analytics",
    img: "Tutorial_2_Prop"
  },
  {
    title: "Mastering Prism for Live Design",
    duration: "15:10",
    tag: "Design",
    img: "Tutorial_3_Prop"
  },
  {
    title: "Retaining Subscribers: The Growth Playbook",
    duration: "22:00",
    tag: "Strategy",
    img: "Tutorial_4_Prop"
  }
]

export default function TutorialsPage() {
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
             <BookOpen className="w-6 h-6 text-emerald-500" />
             <span className="text-xs font-black text-[#0d2a21]/40 uppercase tracking-[0.2em]">Expert Tutorials</span>
          </div>
          <h1 className="text-[72px] lg:text-[88px] font-bold text-[#0d2a21] leading-none tracking-tighter mb-8 font-nanum">
             Learn from <br/><span className="text-[#10b981]">the Best.</span>
          </h1>
          <p className="text-xl text-[#0d2a21]/70 leading-relaxed font-satoshi">
            Over the shoulder guides from established RoomX creators. Master the technical 
            nuances of Prism, the strategic depth of Adroom, and the art of member retention.
          </p>
        </div>

        {/* Tutorials Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
           {TUTORIALS.map((t) => (
             <div key={t.title} className="group bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 overflow-hidden cursor-pointer hover:shadow-xl transition-all">
                <div className="aspect-video bg-gray-200 flex items-center justify-center text-gray-400 font-bold italic relative">
                   {t.img}
                   <div className="absolute inset-0 bg-[#0d2a21]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#0d2a21] shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                         <Play className="w-6 h-6 fill-current" />
                      </div>
                   </div>
                   <div className="absolute bottom-4 right-4 bg-black/50 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                      {t.duration}
                   </div>
                </div>
                <div className="p-8">
                   <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 inline-block">
                     {t.tag}
                   </span>
                   <h3 className="text-2xl font-bold text-[#0d2a21] leading-tight group-hover:text-[#10b981] transition-colors">{t.title}</h3>
                </div>
             </div>
           ))}
        </div>

        {/* Categories CTA */}
        <div className="grid lg:grid-cols-3 gap-8">
           <CategoryBox title="Technical Setup" count="12 Videos" />
           <CategoryBox title="Marketing & Growth" count="8 Videos" />
           <CategoryBox title="Live Engagement" count="6 Videos" />
        </div>

      </div>
    </div>
  )
}

function CategoryBox({ title, count }: { title: string; count: string }) {
  return (
    <div className="bg-[#0d2a21] p-10 rounded-[2.5rem] flex flex-col justify-between h-48 transition-all hover:translate-y-[-8px] cursor-pointer">
       <Layers className="text-white/20 w-8 h-8" />
       <div>
          <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
          <p className="text-[#10b981] text-xs font-bold uppercase tracking-widest">{count}</p>
       </div>
    </div>
  )
}
