import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { HeroCarousel } from '@/components/hero-carousel';
import { MovieSection } from '@/components/movie-section';
import UserLayout from '@/components/user-layout';
import { getMovies, getHomeSectionsWithMovies } from '@/lib/movies';

export default async function HomePage() {
  // Fetch all movie data in parallel
  const [
    { movies: featuredMovies },
    { movies: trendingMovies },
    { movies: latestMovies },
    dynamicSections
  ] = await Promise.all([
    getMovies({ featured: true, limit: 12 }),
    getMovies({ trending: true, limit: 12 }),
    getMovies({ limit: 12 }),
    getHomeSectionsWithMovies()
  ]);

  // Hero slides from featured movies
  const heroMovies = featuredMovies;

  return (
    <UserLayout>
      <main className="min-h-screen bg-[var(--surface)]">
        <Navbar />
        
        {/* Hero Carousel */}
        <HeroCarousel movies={heroMovies} />

        {/* Movie Sections */}
        <div className="space-y-4 lg:space-y-8 pb-12">
          <MovieSection 
            title="Trending Now" 
            movies={trendingMovies} 
            viewAllHref="/movies?trending=true"
          />
          
          <MovieSection 
            title="Latest Releases" 
            movies={latestMovies?.reverse()} 
            viewAllHref="/movies?sort=latest"
          />
          
          {/* Dynamic Sections */}
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
        </div>

        <Footer />
      </main>
    </UserLayout>
  );
}
