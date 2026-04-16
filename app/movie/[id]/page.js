import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import MovieDetailClient from './movie-detail-client';
import { getMovieById } from '@/lib/movies';
import { MovieStructuredData, VideoStructuredData } from '@/components/structured-data';

export async function generateMetadata({ params }) {
  const { id } = await params;
  
  try {
    const movie = await getMovieById(id);
    
    if (!movie) {
      return {
        title: 'Movie Not Found | FilmyMela',
        description: 'The requested movie could not be found.',
      };
    }

    const genres = movie.genre?.join(', ') || 'Movies';
    const cast = movie.cast?.join(', ') || '';
    
    return {
      title: `${movie.name} (${movie.release_year}) | Watch & Download`,
      description: `Watch ${movie.name} (${movie.release_year}) - ${movie.description?.substring(0, 150)}... Rated ${movie.rating}/10. ${genres}.`,
      keywords: [movie.name, movie.industry, genres, cast, 'watch online', 'download', 'streaming'],
      openGraph: {
        title: `${movie.name} (${movie.release_year})`,
        description: movie.description,
        type: 'video.movie',
        images: [
          {
            url: movie.poster_url,
            width: 600,
            height: 900,
            alt: `${movie.name} Poster`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${movie.name} (${movie.release_year})`,
        description: movie.description?.substring(0, 200),
        images: [movie.poster_url],
      },
    };
  } catch {
    return {
      title: 'Movie | FilmyMela',
      description: 'Discover amazing movies on FilmyMela.',
    };
  }
}

export default async function MovieDetailPage({ params }) {
  const { id } = await params;
  
  let movie;
  try {
    movie = await getMovieById(id);
  } catch {
    notFound();
  }

  if (!movie) {
    notFound();
  }

  return (
    <>
      <MovieStructuredData movie={movie} />
      <VideoStructuredData movie={movie} />
      <MovieDetailClient movie={movie} />
    </>
  );
}
