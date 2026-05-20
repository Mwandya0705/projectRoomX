'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { blogPosts, BlogCard } from '@/components/Blogging'

export default function KnowledgeHubPage() {
  return (
    <div className="min-h-screen bg-[#f5f6f2] font-sans pt-32 pb-24">
      <div className="max-w-8xl mx-auto px-60">
        
        {/* Header */}
        <div className="mb-20">
          <Link href="/" className="inline-flex items-center gap-2 text-[#0d2a21]/60 hover:text-[#0d2a21] transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[14px] font-bold">Go back</span>
          </Link>
          <h1 className="text-[82px] font-bold text-[#0d2a21] tracking-tight leading-none mb-6">Knowledge Hub</h1>
          <p className="text-[20px] text-[#0d2a21]/70 max-w-2xl leading-relaxed">
            Everything you need to know about private trading communities, 
            monetizing expertise, and scaling your trading room.
          </p>
        </div>

        {/* Grid of All 6 Posts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {blogPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}
