import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Providers } from '@/app/providers'
import '@/scss/App.scss'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>AccentGuessr - Guess Accents from Around the World</title>
        <meta
          name="description"
          content="Test your ability to identify accents from different regions and countries. Play solo or multiplayer accent guessing game."
        />
        <meta
          name="keywords"
          content="accent guess, geography game, accent game, multiplayer quiz"
        />
        <link rel="icon" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <Providers>
        <Component {...pageProps} />
      </Providers>
    </>
  )
}
