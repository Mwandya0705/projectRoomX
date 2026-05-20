'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { SchedulingManager } from '@/components/SchedulingManager'

export default function SchedulingDashboard() {
  return (
    <div className="min-h-screen bg-[#f5f6f2] pt-32 pb-24 font-satoshi">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Navigation */}
        <div className="mb-10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#0d2a21]/40 hover:text-[#0d2a21] font-bold text-xs transition-all">
            <ChevronLeft className="w-4 h-4" />
            Back to Control Center
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-5xl font-bold text-[#0d2a21] font-nanum tracking-tighter mb-4">Scheduling Sanctuary</h1>
          <p className="text-[#0d2a21]/50 font-medium">Manage your event types, sent invitations, and synchronization settings.</p>
        </div>

        <SchedulingManager />
      </div>
    </div>
  )
}
