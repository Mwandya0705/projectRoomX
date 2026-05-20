'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isStudio, setIsStudio] = useState(false)

  useEffect(() => {
    // Check if we are entering the Live Studio (/room/[id])
    const enteringStudio = pathname.startsWith('/room/')
    setIsStudio(enteringStudio)
  }, [pathname])

  return (
    <>
      {/* 🚀 The Page Content */}
      <div className={isStudio ? '' : 'page-content'}>
        {children}
      </div>

      <style jsx global>{`
        /* Disable view transitions specifically for the root if we are in studio */
        ${isStudio ? `
          ::view-transition-old(root),
          ::view-transition-new(root) {
            animation: none !important;
            mix-blend-mode: normal !important;
            clip-path: none !important;
          }
        ` : ''}
      `}</style>
    </>
  )
}

