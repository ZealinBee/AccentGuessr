import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Providers } from '@/app/providers'
import '@/scss/App.scss'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/icon.png" />
      </Head>
      <Providers>
        <Component {...pageProps} />
      </Providers>
    </>
  )
}
