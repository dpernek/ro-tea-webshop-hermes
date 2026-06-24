export default function KataloziLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="h-7 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-36 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="rounded-xl border border-slate-200">
        <div className="animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3">
              <div className="h-4 w-36 rounded bg-slate-200" />
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-4 w-48 rounded bg-slate-200" />
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-5 w-20 rounded-full bg-slate-200" />
              <div className="ml-auto flex gap-2">
                <div className="h-8 w-8 rounded bg-slate-200" />
                <div className="h-8 w-8 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
