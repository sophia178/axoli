import type { Metadata } from 'next'
import { Inter, Nunito } from 'next/font/google'
import type { ReactNode } from 'react'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Axoli',
  description: 'Study smarter with your new best friend'
}

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${nunito.variable}`}
    >
      <head>
        {adsenseClientId ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body className="font-sans">
        <div className="min-h-screen">
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/3 top-[-12rem] h-[26rem] w-[26rem] rounded-full bg-pink/20 blur-3xl" />
            <div className="absolute right-[-8rem] top-[10rem] h-[30rem] w-[30rem] rounded-full bg-gold/12 blur-3xl" />
            <div className="absolute bottom-[-12rem] left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-pink/10 blur-3xl" />
          </div>
          {children}
        </div>
      </body>
    </html>
  )
}
