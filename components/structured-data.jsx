import Script from 'next/script';

// Website structured data
export function WebsiteStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FilmyMela',
    url: 'https://filmymela.netlify.app',
    description: 'Watch movies online - Stream your favorite movies anytime, anywhere',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://filmymela.netlify.app/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization structured data
export function OrganizationStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FilmyMela',
    url: 'https://filmymela.netlify.app',
    logo: 'https://filmymela.netlify.app/logo.jpeg',
    description: 'Your ultimate destination for streaming movies online',
    sameAs: [
      'https://facebook.com/filmymela',
      'https://twitter.com/filmymela',
      'https://instagram.com/filmymela'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English', 'Hindi']
    }
  };

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Movie structured data
export function MovieStructuredData({ movie }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.overview || movie.description,
    image: movie.poster_url || movie.thumbnail,
    genre: movie.genres?.map(g => g.name).join(', '),
    datePublished: movie.release_date,
    duration: movie.runtime ? `PT${movie.runtime}M` : undefined,
    director: movie.director ? {
      '@type': 'Person',
      name: movie.director
    } : undefined,
    actor: movie.cast?.map(actor => ({
      '@type': 'Person',
      name: actor.name
    })),
    aggregateRating: movie.rating ? {
      '@type': 'AggregateRating',
      ratingValue: movie.rating,
      bestRating: '10',
      ratingCount: movie.rating_count || '1000'
    } : undefined,
    potentialAction: {
      '@type': 'WatchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://filmymela.nelify.app/movies/${movie.id}`
      }
    }
  };

  // Remove undefined values
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) delete data[key];
  });

  return (
    <Script
      id="movie-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Video structured data for movie player
export function VideoStructuredData({ movie }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: movie.title,
    description: movie.overview || movie.description,
    thumbnailUrl: movie.thumbnail || movie.poster_url,
    uploadDate: movie.release_date,
    duration: movie.runtime ? `PT${movie.runtime}M` : undefined,
    embedUrl: movie.stream_url,
    potentialAction: {
      '@type': 'WatchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://filmymela.nelify.app/movies/${movie.id}`
      }
    }
  };

  Object.keys(data).forEach(key => {
    if (data[key] === undefined) delete data[key];
  });

  return (
    <Script
      id="video-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Breadcrumb structured data
export function BreadcrumbStructuredData({ items }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Mobile app structured data
export function AppStructuredData({ appSettings }) {
  if (!appSettings?.enabled) return null;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: 'FilmyMela Mobile',
    description: 'Watch movies on the go with FilmyMela mobile app',
    url: 'https://filmymela.nelify.app/download-app',
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '10000'
    }
  };

  return (
    <Script
      id="app-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// All structured data combined for main layout
export function AllStructuredData({ appSettings }) {
  return (
    <>
      <WebsiteStructuredData />
      <OrganizationStructuredData />
      {appSettings?.enabled && <AppStructuredData appSettings={appSettings} />}
    </>
  );
}
