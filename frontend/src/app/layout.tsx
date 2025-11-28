import type { Metadata } from 'next'
import '@/scss/App.scss'
import { Providers } from './providers'

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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
