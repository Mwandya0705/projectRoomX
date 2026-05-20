import type { Metadata } from 'next'
import { Inter, Montserrat, Press_Start_2P, EB_Garamond } from 'next/font/google'
import './globals.css'
import ClientWrapper from '../components/ClientWrapper'
import NavigationClient from '@/components/NavigationClient'
import FooterDetails from '@/components/FooterDetails'
import { ViewTransitions } from 'next-view-transitions'
import TransitionProvider from '@/components/TransitionProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })
const pressStart2P = Press_Start_2P({ 
  weight: '400', 
  subsets: ['latin'], 
  variable: '--font-press-start' 
})

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-eb-garamond',
})

export const metadata: Metadata = {
  title: 'RoomX - Private Live Rooms for Creators',
  description: 'Monetize your live content with subscription-based rooms',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ViewTransitions>
      <html lang="en" className={`${inter.variable} ${montserrat.variable} ${ebGaramond.variable} ${pressStart2P.variable}`}>
        <body className="font-sans antialiased">
          <TransitionProvider>
            <NavigationClient />
            <ClientWrapper>
              {children}
              <FooterDetails />
            </ClientWrapper>
          </TransitionProvider>
        </body>
      </html>
    </ViewTransitions>
  )
}
