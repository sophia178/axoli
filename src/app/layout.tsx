import type { Metadata } from 'next'
import { Inter, Nunito } from 'next/font/google'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/react'
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
  metadataBase: new URL('https://axoli.online'),
  title: 'Axoli — Study smarter with your axolotl companion',
  description:
    'Turn notes, YouTube videos or PDFs into flashcards in seconds. Grow your pet axolotl by studying.',
  icons: {
    icon: '/favicon.svg'
  },
  openGraph: {
    title: 'Axoli — Study smarter with your axolotl companion',
    description:
      'Turn notes, YouTube videos or PDFs into flashcards in seconds. Grow your pet axolotl by studying.',
    url: 'https://axoli.online',
    siteName: 'Axoli',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Axoli — Study smarter with your axolotl companion',
    description:
      'Turn notes, YouTube videos or PDFs into flashcards in seconds. Grow your pet axolotl by studying.',
    images: ['/og-image.png']
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  const adsenseClientId =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? 'ca-pub-9710441137160587'
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${nunito.variable}`}
    >
      <head>
        <meta name="google-adsense-account" content="ca-pub-9710441137160587" />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          crossOrigin="anonymous"
        />
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
        <Analytics />
      </body>
    </html>
  )
}