import { db } from "@/lib/db";
import { cache } from "react";

export interface SectionData {
  title: string;
  subtitle: string;
  eyebrow: string;
  ctaLabel: string;
  ctaHref: string;
  body: string;
  active: boolean;
}

export const getContentSection = cache(async (key: string): Promise<SectionData | null> => {
  const section = await db.contentSection.findUnique({ where: { key } });
  if (!section?.active) return null;
  return {
    title: section.title,
    subtitle: section.subtitle,
    eyebrow: section.eyebrow,
    ctaLabel: section.ctaLabel,
    ctaHref: section.ctaHref,
    body: section.body,
    active: section.active,
  };
});
