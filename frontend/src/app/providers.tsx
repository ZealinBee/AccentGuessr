'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from '@/context/AuthContext'
import { GameProvider } from '@/context/GameContext'
import { MatchProvider } from '@/context/MatchContext'
import { initAnalytics } from '@/lib/firebase'
import { useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAnalytics({ enabled: true })
  }, [])

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <MatchProvider>
          <GameProvider>
            {children}
          </GameProvider>
        </MatchProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
