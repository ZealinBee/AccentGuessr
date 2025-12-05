import type { Metadata } from 'next'
import '@/scss/App.scss'
import { Providers } from './providers'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'AccentGuessr - Guess Accents from Around the World',
  description: 'Test your ability to identify accents from different regions and countries. Play solo or multiplayer accent guessing game.',
  keywords: 'accent, guess, geography, game, multiplayer, quiz',
  authors: [{ name: 'AccentGuessr' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
    shortcut: '/icon.png',
  },
  themeColor: '#000000',
  openGraph: {
    title: 'AccentGuessr - Guess Accents from Around the World',
    description: 'Test your ability to identify accents from different regions and countries.',
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
        <Script
          id="adsense-loader"
          strategy="afterInteractive"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1290357879552342"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
