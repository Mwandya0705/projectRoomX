'use client'

import Link from 'next/link'
import RollingCardsSection from '@/components/RollingCardsSections'
import CampaignShowcaseSection from '@/components/CampaignShowcaseSection'
import Blogging from '@/components/Blogging'
import HeroFinal from '@/components/Herofinal'
import CrossingWord from '@/components/CrossingWord'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f6f2]">
      <div className="hidden lg:block">
        <CrossingWord />
      </div>
      <HeroFinal />
      {/* ── HERO: full-viewport, Pixis-style ── */}
      {/* <Hero /> */}

      {/* ── REST OF PAGE ── */}
      {/* <Cards /> */}
      <RollingCardsSection />
      <CampaignShowcaseSection />
      <Blogging />
    </div>
  )
}
