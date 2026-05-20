'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs'
import NavigationClient from '@/components/NavigationClient'
import Cards from '@/components/Cards'
import RollingCardsSection from '@/components/RollingCardsSections'
import CampaignShowcaseSection from '@/components/CampaignShowcaseSection'
import FooterDetails from '@/components/FooterDetails'
import Hero from '@/components/Hero'
import HeroFinal from '@/components/Herofinal'
import CrossingWord from '@/components/CrossingWord'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f6f2]">
       <CrossingWord />
      <NavigationClient />
      <HeroFinal />
      {/* ── HERO: full-viewport, Pixis-style ── */}
      {/* <Hero /> */}

      {/* ── REST OF PAGE ── */}
      {/* <Cards /> */}
      <RollingCardsSection />
      <CampaignShowcaseSection />
      <FooterDetails />
    </div>
  )
}
