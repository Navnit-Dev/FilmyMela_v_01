'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-[var(--on-surface)] mb-4">Oops!</h1>
        <p className="text-[var(--on-surface-variant)] mb-6">
          Something went wrong. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-[var(--primary)] text-[var(--on-primary)] rounded-lg font-medium"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-[var(--surface-container)] text-[var(--on-surface)] rounded-lg font-medium"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
