import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { HeroCarousel } from '@/components/hero-carousel';
import { MovieSection } from '@/components/movie-section';
import { getMovies } from '@/lib/movies';

export default async function HomePage() {
  // Fetch all movie data in parallel
  const [
    { movies: featuredMovies },
    { movies: trendingMovies },
    { movies: latestMovies },
    { movies: hollywoodMovies },
    { movies: bollywoodMovies }
  ] = await Promise.all([
    getMovies({ featured: true, limit: 8 }),
    getMovies({ trending: true, limit: 12 }),
    getMovies({ limit: 12 }),
    getMovies({ industry: 'Hollywood', limit: 6 }),
    getMovies({ industry: 'Bollywood', limit: 6 })
  ]);

  // Hero slides from featured movies
  const heroMovies = featuredMovies.slice(0, 5);

  return (
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
          movies={latestMovies} 
          viewAllHref="/movies?sort=latest"
        />
        
        <MovieSection 
          title="Hollywood" 
          movies={hollywoodMovies} 
          viewAllHref="/movies?industry=Hollywood"
        />
        
        <MovieSection 
          title="Bollywood" 
          movies={bollywoodMovies} 
          viewAllHref="/movies?industry=Bollywood"
        />
      </div>

      <Footer />
    </main>
  );
}
