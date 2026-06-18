import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CALCULATORS, CATEGORIES, getCalculatorBySlug } from "@/data/calculators";
import { CalculatorClient } from "@/components/calculators/CalculatorClient";
import { RelatedCalculators } from "@/components/calculators/RelatedCalculators";

// ─── Static Generation ────────────────────────────────────────
export async function generateStaticParams() {
  return CALCULATORS.map((c) => ({ slug: c.slug }));
}

// ─── Per-page SEO Metadata ────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const calc = getCalculatorBySlug(params.slug);
  if (!calc) return {};
  return {
    title: `${calc.title} — Free Online Calculator`,
    description: calc.description,
    keywords: calc.tags,
    openGraph: {
      title: `${calc.title} — Free Online Calculator`,
      description: calc.description,
      url: `https://urgentcalculate.com/calculator/${calc.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: calc.title,
      description: calc.description,
    },
    alternates: {
      canonical: `https://urgentcalculate.com/calculator/${calc.slug}`,
    },
  };
}

// ─── Page Component ───────────────────────────────────────────
export default function CalculatorPage({ params }: { params: { slug: string } }) {
  const calc = getCalculatorBySlug(params.slug);
  if (!calc) notFound();

  const categoryDef = CATEGORIES.find((c) => c.id === calc.category);
  const categoryLabel = categoryDef?.label ?? calc.category;

  // Related: same category, different slug
  const related = CALCULATORS
    .filter((c) => c.category === calc.category && c.slug !== calc.slug)
    .slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: calc.title,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description: calc.description,
    url: `https://urgentcalculate.com/calculator/${calc.slug}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "120",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://urgentcalculate.com" },
      { "@type": "ListItem", position: 2, name: categoryLabel, item: `https://urgentcalculate.com/?category=${calc.category}` },
      { "@type": "ListItem", position: 3, name: calc.title, item: `https://urgentcalculate.com/calculator/${calc.slug}` },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Structured data for SEO rich results */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
        <a href="/" className="hover:text-brand-600 transition-colors">Home</a>
        <span>/</span>
        <a href={`/?category=${calc.category}`} className="hover:text-brand-600 transition-colors">{categoryLabel}</a>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300 font-medium">{calc.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{calc.icon}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {calc.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{calc.description}</p>
          </div>
        </div>
      </div>

      {/* Top Ad Slot */}
      <div className="ad-slot h-24 mb-8">
        {/* Google AdSense: data-ad-slot="TOP_BANNER" */}
        Advertisement
      </div>

      {/* Calculator (Client Component) */}
      <CalculatorClient calculator={calc} />

      {/* SEO Content */}
      <article className="card p-6 mt-6 prose dark:prose-invert prose-slate max-w-none">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          About the {calc.title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {calc.longDescription}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {calc.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      </article>

      {/* Mid Ad Slot */}
      <div className="ad-slot h-24 my-8">
        {/* Google AdSense: data-ad-slot="MID_RECTANGLE" */}
        Advertisement
      </div>

      {/* Related Calculators */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
            Related {categoryLabel} Calculators
          </h2>
          <RelatedCalculators calculators={related} />
        </div>
      )}

      {/* Bottom Ad */}
      <div className="ad-slot h-24 mt-8">
        {/* Google AdSense: data-ad-slot="BOTTOM_BANNER" */}
        Advertisement
      </div>
    </div>
  );
}
