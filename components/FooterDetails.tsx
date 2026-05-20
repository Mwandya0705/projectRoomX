'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function FooterDetails() {
  return (
    <footer className="w-full">
      {/* ================= CTA STRIP ================= */}
      <div className="relative py-24 text-center bg-gradient-to-r from-purple-300 via-teal-200 to-emerald-300">
        <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-8">
          Enter a new era of advertising
        </h2>

        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition">
          <span className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center text-xs">
            ⏱
          </span>
          Book a demo
        </button>
      </div>

      {/* ================= MAIN FOOTER ================= */}
      <div className="bg-[#062b2a] text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[1.2fr_3fr]">
          
          {/* LEFT COLUMN */}
          <div className="space-y-10">
            {/* Logo */}
            <h3 className="text-2xl font-semibold tracking-wide">PIXIS</h3>

            {/* Partner Card */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 w-64">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <Image
                    src="/media/images/meta.png"
                    alt="Meta Partner"
                    width={32}
                    height={32}
                  />
                  <div>
                    <p className="font-medium">Meta</p>
                    <p className="text-sm text-white/70">Business Partner</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Image
                    src="/media/images/google.png"
                    alt="Google Partner"
                    width={32}
                    height={32}
                  />
                  <div>
                    <p className="font-medium">Google</p>
                    <p className="text-sm text-white/70">Partner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT LINKS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 text-sm">
            <FooterColumn
              title="Products"
              links={['Prism', 'Adroom', 'Integrations', 'Compliance']}
            />

            <FooterColumn
              title="Solutions"
              links={['By team', 'By use case', 'By industry']}
            />

            <FooterColumn
              title="Peer Stories"
              links={[]}
            />

            <FooterColumn
              title="Knowledge Hub"
              links={['Blog', 'Resources', 'Podcasts', 'Events', 'Prism FAQ', 'Glossary']}
            />

            <FooterColumn
              title="Company"
              links={['About', 'News & press', 'Careers']}
            />
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ================= FOOTER COLUMN ================= */

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: string[]
}) {
  return (
    <div>
      <h4 className="font-semibold mb-4">{title}</h4>
      <ul className="space-y-3 text-white/70">
        {links.map((link) => (
          <li key={link}>
            <Link href="#" className="hover:text-white transition">
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}