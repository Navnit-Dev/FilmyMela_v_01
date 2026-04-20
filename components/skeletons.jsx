'use client';

import { useState, useEffect } from 'react';

export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-[var(--surface-container)]">
      <div className="aspect-[2/3] skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="w-full aspect-hero lg:aspect-[21/9] skeleton" />
  );
}

export function MovieSectionSkeleton() {
  return (
    <section className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 skeleton rounded w-48" />
          <div className="h-6 skeleton rounded w-20" />
        </div>
        <SkeletonGrid count={12} />
      </div>
    </section>
  );
}
