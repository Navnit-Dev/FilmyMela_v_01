import './globals.css';
import { Providers } from '@/components/providers';

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
    google: 'OYP0Td0V_8K4JyLfR5RaOj5Mfs0b7GXeyukCWSgmJoc',
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FilmyMela',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://filmymela.com',
    description: 'Discover, stream, and download your favorite movies.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://filmymela.com'}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className="dark">
      <head>
        <meta name="monetag" content="cc0b89e59eb0afa4f8c43ec2b08f5df1">
        
      </head>
      <body className="antialiased">
          <Providers>
            {children}
          </Providers>
      </body>
    </html>
  );
}
