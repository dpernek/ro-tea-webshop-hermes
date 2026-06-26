import { getContentSection } from "@/lib/content";

export async function ContentBlock({ sectionKey, className }: { sectionKey: string; className?: string }) {
  const s = await getContentSection(sectionKey);
  if (!s?.title && !s?.body) return null;
  return (
    <section className={className || "border-b border-slate-100 bg-white py-10"}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {s.eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-[#0055a8]">{s.eyebrow}</p>}
        {s.title && <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{s.title}</h2>}
        {s.subtitle && <p className="mt-3 text-lg text-slate-500">{s.subtitle}</p>}
        {s.body && <p className="mt-4 max-w-3xl mx-auto text-slate-600">{s.body}</p>}
        {s.ctaLabel && s.ctaHref && (
          <a href={s.ctaHref} className="mt-6 inline-block rounded-lg bg-[#0055a8] px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
            {s.ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
}
