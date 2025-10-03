import type { Metadata } from 'next'
import Footer from './components/Footer'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://careshare.vercel.app'),
  title: {
    default: 'CareShare - Coordinate Family Care Together',
    template: '%s | CareShare'
  },
  description: 'A platform that helps families coordinate care for elderly loved ones. Share costs, organize events, and manage responsibilities together. Simplify family caregiving coordination.',
  keywords: ['family care', 'elderly care', 'caregiving', 'family coordination', 'shared expenses', 'care management', 'family events', 'senior care', 'caregiver support'],
  authors: [{ name: 'CareShare' }],
  creator: 'CareShare',
  publisher: 'CareShare',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://careshare.vercel.app',
    siteName: 'CareShare',
    title: 'CareShare - Coordinate Family Care Together',
    description: 'A platform that helps families coordinate care for elderly loved ones. Share costs, organize events, and manage responsibilities together.',
    images: [
      {
        url: '/careshare-logo.png',
        width: 1200,
        height: 630,
        alt: 'CareShare - Coordinate Family Care Together',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CareShare - Coordinate Family Care Together',
    description: 'A platform that helps families coordinate care for elderly loved ones. Share costs, organize events, and manage responsibilities together.',
    images: ['/careshare-logo.png'],
    creator: '@careshare',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes when available
    // google: 'your-google-site-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CareShare',
    description: 'A platform that helps families coordinate care for elderly loved ones. Share costs, organize events, and manage responsibilities together.',
    url: 'https://careshare.vercel.app',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Coordinate family caregiving',
      'Share and track costs',
      'Organize events and appointments',
      'Manage care responsibilities',
    ],
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <div style={{ flex: 1 }}>{children}</div>
        </div>
        <Footer />
      </body>
    </html>
  )
}
