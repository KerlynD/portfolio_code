import type { Metadata } from 'next'
import { Oswald, VT323 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { getSiteConfig } from '@/lib/content'
import { getSiteImages } from '@/lib/images'
import { isAdmin } from '@/lib/session'
import { getSiteUrl, shortName } from '@/lib/site'
import EditProvider from '@/components/edit/EditProvider'
import EditToolbar from '@/components/edit/EditToolbar'
import './globals.css'
import './edit.css'

// Self-hosted at build time; globals.css reads these through --display and --mono.
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald', display: 'swap' })
const vt323 = VT323({ subsets: ['latin'], weight: '400', variable: '--font-vt323', display: 'swap' })

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()
  const title = `${shortName(siteConfig.name)} | ${siteConfig.title}`
  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description: siteConfig.bio,
    keywords: ['Software Engineer', 'Backend', 'Distributed Systems', 'Go', 'Python', 'Datadog', 'Google Cloud'],
    authors: [{ name: siteConfig.name }],
    openGraph: {
      title,
      description: siteConfig.bio,
      type: 'website',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [admin, siteConfig] = await Promise.all([isAdmin(), getSiteConfig()])
  const images = getSiteImages(siteConfig)
  return (
    <html lang="en" className={`${oswald.variable} ${vt323.variable}`}>
      <head>
        <link rel="icon" href={images.favicon} />
      </head>
      <body>
        {admin ? (
          <EditProvider>
            {children}
            <EditToolbar images={images} />
          </EditProvider>
        ) : (
          children
        )}
        <Analytics />
      </body>
    </html>
  )
}
