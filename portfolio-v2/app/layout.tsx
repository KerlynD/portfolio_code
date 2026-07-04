import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { getSiteConfig } from '@/lib/content'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()
  return {
    title: `${siteConfig.name} | ${siteConfig.title}`,
    description: siteConfig.bio,
    keywords: ['Software Engineer', 'Backend', 'Distributed Systems', 'Go', 'Python', 'Datadog', 'Google Cloud'],
    authors: [{ name: siteConfig.name }],
    openGraph: {
      title: `${siteConfig.name} | ${siteConfig.title}`,
      description: siteConfig.bio,
      type: 'website',
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/jpeg" href="/assets/profile/profile.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
