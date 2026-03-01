import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kerlyn Angel Difo | Software Engineer',
  description: 'Software Engineer passionate about backend systems, distributed infrastructure, and developer tooling. Currently at Datadog, heading to Google Cloud.',
  keywords: ['Software Engineer', 'Backend', 'Distributed Systems', 'Go', 'Python', 'Datadog', 'Google Cloud'],
  authors: [{ name: 'Kerlyn Angel Difo' }],
  openGraph: {
    title: 'Kerlyn Angel Difo | Software Engineer',
    description: 'Software Engineer passionate about backend systems, distributed infrastructure, and developer tooling.',
    type: 'website',
  },
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
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
