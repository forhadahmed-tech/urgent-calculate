import { MetadataRoute } from "next";
import { CALCULATORS } from "@/data/calculators";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://urgentcalculate.com";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...CALCULATORS.map((c) => ({
      url: `${base}/calculator/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: c.featured ? 0.9 : 0.7,
    })),
  ];
}
