'use client'

import React from 'react'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f5f6f2] p-8 lg:p-12 space-y-12 animate-pulse">
      {/* 🎬 Top Nav Skeleton */}
      <div className="flex justify-between items-center mb-20">
        <div className="h-12 w-48 bg-gray-200 rounded-2xl" />
        <div className="flex gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
          <div className="h-10 w-32 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* 🎭 Hero Skeleton */}
      <div className="space-y-4 max-w-2xl">
        <div className="h-16 w-3/4 bg-gray-300 rounded-3xl" />
        <div className="h-6 w-1/2 bg-gray-200 rounded-xl" />
      </div>

      {/* 📊 Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-[2.5rem] border border-black/5 p-6 space-y-4">
            <div className="h-4 w-1/2 bg-gray-100 rounded-full" />
            <div className="h-8 w-3/4 bg-gray-200 rounded-xl" />
          </div>
        ))}
      </div>

      {/* 📺 Rooms Table Skeleton */}
      <div className="bg-white rounded-[3rem] border border-black/5 p-8 space-y-8">
        <div className="h-10 w-40 bg-gray-200 rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 w-full bg-gray-50 rounded-2xl flex items-center px-6 gap-6">
              <div className="h-10 w-10 bg-gray-200 rounded-lg shrink-0" />
              <div className="h-4 w-1/4 bg-gray-100 rounded-full" />
              <div className="h-4 w-1/2 bg-gray-50 rounded-full" />
              <div className="h-8 w-24 bg-gray-200 rounded-xl ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
