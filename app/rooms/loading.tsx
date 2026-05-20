'use client'

import React from 'react'

export default function RoomsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 lg:p-12 space-y-12 animate-pulse">
      {/* 🎬 Header Skeleton */}
      <div className="flex justify-between items-end mb-16 max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="h-10 w-64 bg-gray-200 rounded-xl" />
          <div className="h-4 w-48 bg-gray-100 rounded-full italic" />
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded-full" />
      </div>

      {/* 🌀 Grid Skeleton */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-[2.5rem] border border-black/5 shadow-sm p-8 space-y-8">
            <div className="space-y-3">
               <div className="h-3 w-32 bg-gray-100 rounded-full" />
               <div className="h-8 w-3/4 bg-gray-200 rounded-xl" />
               <div className="h-12 w-full bg-gray-50 rounded-2xl" />
            </div>

            {/* User Info Bar Skeleton */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
               <div className="space-y-2 flex-1">
                  <div className="h-3 w-1/2 bg-gray-200 rounded-full" />
                  <div className="h-2 w-1/3 bg-gray-100 rounded-full" />
               </div>
               <div className="h-6 w-12 bg-gray-200 rounded-lg" />
            </div>

            {/* Button Skeleton */}
            <div className="h-14 w-full bg-gray-200 rounded-[1.5rem]" />
          </div>
        ))}
      </div>
    </div>
  )
}
