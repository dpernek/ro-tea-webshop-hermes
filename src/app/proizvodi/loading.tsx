export default function CatalogLoading() {
  return (
    <div className="bg-white">
      {/* Header skeleton */}
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-3 h-9 w-64 rounded bg-slate-200" />
            <div className="h-5 w-32 rounded bg-slate-200" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search bar skeleton */}
        <div className="mb-6 h-12 w-full rounded-xl bg-slate-100" />

        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <aside className="hidden w-56 shrink-0 animate-pulse lg:block">
            <div className="sticky top-24 space-y-3">
              <div className="mb-3 h-4 w-24 rounded bg-slate-200" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 rounded-lg bg-slate-100"
                  style={{ width: `${85 - i * 5}%` }}
                />
              ))}
            </div>
          </aside>

          {/* Products grid skeleton */}
          <div className="min-w-0 flex-1">
            {/* Toolbar skeleton */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="h-9 w-24 rounded-lg bg-slate-100" />
                <div className="h-9 w-36 rounded-lg bg-slate-100" />
              </div>
              <div className="h-5 w-28 rounded bg-slate-100" />
            </div>

            {/* Grid skeleton */}
            <div className="grid gap-3 grid-cols-1 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 aspect-square w-full rounded-lg bg-slate-200" />
                  <div className="mb-2 h-4 w-3/4 rounded bg-slate-200" />
                  <div className="mb-1 h-4 w-1/2 rounded bg-slate-200" />
                  <div className="h-5 w-1/3 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
