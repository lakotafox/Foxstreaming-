import './globals.css'
import { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import AnalyticsProvider from './components/analytics/AnalyticsProvider'
import PresenceProvider from './components/analytics/PresenceProvider'
import { RegionProvider } from './lib/context/RegionContext'
import { TVNavigationProvider } from './components/tv/TVNavigationProvider'
import { TVNavigationHint } from './components/tv/TVNavigationHint'
import AdminBanner from './components/ui/AdminBanner'
import { WatchlistProvider } from './hooks/useWatchlist'
import SyncProvider from './components/providers/SyncProvider'

// Optimized font loading with next/font (eliminates render-blocking CSS)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  preload: true,
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#f7931e',
  colorScheme: 'dark light',
}

export const metadata: Metadata = {
  title: 'FoxStream - Stream Beyond',
  description: 'Discover and stream your favorite movies and TV shows with FoxStream. Your ultimate entertainment destination.',
  metadataBase: new URL('http://localhost:3006'),
  keywords: ['movies', 'tv shows', 'streaming', 'entertainment', 'foxstream'],
  authors: [{ name: 'FoxStream' }],
  creator: 'FoxStream',
  publisher: 'FoxStream',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Open Graph tags
  openGraph: {
    title: 'FoxStream - Stream Beyond',
    description: 'Discover and stream your favorite movies and TV shows with FoxStream. Your ultimate entertainment destination.',
    url: 'http://localhost:3006',
    siteName: 'FoxStream',
    images: [
      {
        url: 'http://localhost:3006/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'FoxStream - Stream Beyond',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  // Twitter Card tags
  twitter: {
    card: 'summary_large_image',
    title: 'FoxStream - Stream Beyond',
    description: 'Discover and stream your favorite movies and TV shows with FoxStream. Your ultimate entertainment destination.',
    images: ['http://localhost:3006/twitter-image'],
    creator: '@foxstream',
  },
  // Apple Touch Icon
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  // Manifest
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {/* Screen reader announcements */}
        <div id="sr-announcements" role="status" aria-live="polite" aria-atomic="true" className="sr-only"></div>
        
        <RegionProvider>
          <AnalyticsProvider>
            <PresenceProvider>
              <SyncProvider>
                <WatchlistProvider>
                  <TVNavigationProvider>
                    <AdminBanner />
                    {children}
                    <TVNavigationHint />
                  </TVNavigationProvider>
                </WatchlistProvider>
              </SyncProvider>
            </PresenceProvider>
          </AnalyticsProvider>
        </RegionProvider>
      </body>
    </html>
  )
}