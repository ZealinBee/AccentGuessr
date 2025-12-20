'use client'

import { Suspense, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from '@/context/AuthContext'
import { GameProvider } from '@/context/GameContext'
import { MatchProvider } from '@/context/MatchContext'
import { NavigationProgress } from '@/components/NavigationProgress'
import { initAnalytics } from '@/lib/firebase'

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
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            {children}
          </GameProvider>
        </MatchProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
