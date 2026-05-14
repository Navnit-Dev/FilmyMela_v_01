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
  keywords: [
  "bollywood movies ott release",
  "upcoming bollywood movies 2026",
  "new hindi movies streaming",
  "best bollywood movies netflix",
  "best bollywood movies prime video",
  "hollywood movies hindi dubbed",
  "new hollywood movies ott",
  "best action movies netflix",
  "best thriller movies prime video",
  "marvel movies watch order",
  "anime hindi dubbed",
  "best anime for beginners",
  "top anime movies netflix",
  "dark anime recommendations",
  "best shonen anime",
  "demon slayer hindi dubbed",
  "attack on titan final season",
  "jujutsu kaisen season 3",
  "one piece watch order",
  "naruto filler list",
  "squid game ending explained",
  "movie ending explained",
  "web series ending explained",
  "movie review",
  "ott release date",
  "where to watch movies legally",
  "new ott releases this week",
  "top 10 netflix movies",
  "best web series india",
  "best korean dramas netflix",
  "top sci fi movies",
  "best horror movies streaming",
  "best comedy movies netflix",
  "top romantic movies bollywood",
  "new south indian movies dubbed",
  "tollywood movies ott release",
  "pan india movies list",
  "highest grossing indian movies",
  "box office collection",
  "upcoming marvel movies",
  "dc movies in order",
  "john wick watch order",
  "best crime thriller web series",
  "anime release schedule",
  "anime season release date",
  "netflix trending movies",
  "prime video trending series",
  "disney hotstar new releases",
  "crunchyroll best anime",
  "top imdb rated movies"
],
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
    google: 'OWPMu5R30m2A9NasXDVRbiy0Z4K-gqV2sgo2eaE4w6U',
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
