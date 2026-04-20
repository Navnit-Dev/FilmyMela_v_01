import { Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { HeroCarousel } from '@/components/hero-carousel';
import { MovieSection } from '@/components/movie-section';
import { MovieSectionSkeleton } from '@/components/skeletons';
import UserLayout from '@/components/user-layout';
import { getMovies, getHomeSectionsWithMovies } from '@/lib/movies';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  // Fetch critical data first (hero and trending)
  const [
    { movies: featuredMovies },
    { movies: trendingMovies }
  ] = await Promise.all([
    getMovies({ featured: true, limit: 12 }),
    getMovies({ trending: true, limit: 12 })
  ]);

  // Hero slides from featured movies
  const heroMovies = featuredMovies;

  return (
    <UserLayout>
      <main className="min-h-screen bg-[var(--surface)]">
        <Navbar />

        {/* Hero Carousel - Critical content */}
        <HeroCarousel movies={heroMovies} />

        {/* Movie Sections */}
        <div className="space-y-4 lg:space-y-8 pb-12">
          <MovieSection
            title="Trending Now"
            movies={trendingMovies}
            viewAllHref="/movies?trending=true"
          />

          {/* Stream non-critical sections */}
          <Suspense fallback={<MovieSectionSkeleton />}>
            <LatestReleasesSection />
          </Suspense>

          <Suspense fallback={<MovieSectionSkeleton />}>
            <DynamicSections />
          </Suspense>
        </div>

        <Footer />
      </main>
    </UserLayout>
  );
}

// Separate async component for Latest Releases
async function LatestReleasesSection() {
  const { movies: latestMovies } = await getMovies({ limit: 12 });

  return (
    <MovieSection
      title="Latest Releases"
      movies={[...latestMovies].sort(
        (a, b) => new Date(b.release_year) - new Date(a.release_year)
      )}
      viewAllHref="/movies?sort=latest"
    />
  );
}

// Separate async component for Dynamic Sections
async function DynamicSections() {
  const dynamicSections = await getHomeSectionsWithMovies();

  return (
    <>
      {dynamicSections.map((section) => (
        section.movies.length > 0 && (
          <MovieSection
            key={section.id}
            title={section.name}
            movies={section.movies}
            viewAllHref={
              section.section_type === 'industry'
                ? `/movies?industry=${encodeURIComponent(section.filter_value)}`
                : `/movies?genre=${encodeURIComponent(section.filter_value)}`
            }
          />
        )
      ))}
    </>
  );
}
