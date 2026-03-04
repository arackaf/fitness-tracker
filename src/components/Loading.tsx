export function Loading() {
  return (
    <div
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      role="status"
      aria-label="Loading"
    >
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-white border-t-transparent animation-duration-[1.8s]" />
    </div>
  );
}
