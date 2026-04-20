import './globals.css';
import { Inter, Manrope } from 'next/font/google';
import dynamic from 'next/dynamic';
import { Providers } from '@/components/providers';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { AllStructuredData } from '@/components/structured-data';

// Dynamic imports for heavy components (loading state only, no SSR option in Server Components)
const BootScreenProvider = dynamic(() => import('@/components/boot-screen-provider').then(mod => mod.BootScreenProvider), {
  loading: () => null,
});

const PopupModal = dynamic(() => import('@/components/popup-modal').then(mod => mod.default), {
  loading: () => null,
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata = {
  title: {
    default: 'FilmyMela - Stream & Download Movies',
    template: '%s | FilmyMela'
  },
  description: 'Discover, stream, and download your favorite movies. A premium cinematic experience with Hollywood, Bollywood, and more.',
  keywords: ['movies', 'streaming', 'download', 'cinema', 'films', 'hollywood', 'bollywood', 'tollywood', 'watch online', 'hd movies'],
  authors: [{ name: 'FilmyMela' }],
  creator: 'FilmyMela',
  publisher: 'FilmyMela',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://filmymela.com',
    siteName: 'FilmyMela',
    title: 'FilmyMela - Stream & Download Movies',
    description: 'Discover, stream, and download your favorite movies. A premium cinematic experience.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FilmyMela - Movie Streaming Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FilmyMela - Stream & Download Movies',
    description: 'Discover, stream, and download your favorite movies.',
    images: ['/og-image.jpg'],
    creator: '@filmymela',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0e0e0e' },
    { media: '(prefers-color-scheme: dark)', color: '#0e0e0e' },
  ],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'EXvvfD9Pzvc1slojtlRV513EavOrMO89-OjU3PIgrJE',
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${manrope.variable}`}>
      <head>
        {/* Preconnect for external domains */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.telegram.org" />
        <AllStructuredData />
      </head>
      <body className="antialiased pb-16 md:pb-0 font-sans">
          <BootScreenProvider>
            <Providers>
              {children}
            </Providers>
            <MobileBottomNav />
            <PopupModal />
          </BootScreenProvider>
      </body>
    </html>
  );
}
