export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--on-surface-variant)] text-sm">Loading...</p>
      </div>
    </div>
  );
}
