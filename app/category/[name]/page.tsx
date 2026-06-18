import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, getCalculatorsByCategory } from "@/data/calculators";
import { CalculatorCard } from "@/components/ui/CalculatorCard";

// Category route params use the same lowercase ids as Calculator.category
// (e.g. "health", "finance", "daily") — no slugification needed.
const REAL_CATEGORIES = CATEGORIES.filter((c) => c.id !== "all");

export async function generateStaticParams() {
  return REAL_CATEGORIES.map((c) => ({ name: c.id }));
}

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const category = REAL_CATEGORIES.find((c) => c.id === params.name);
  if (!category) return {};
  return {
    title: `${category.label} Calculators — Free Online Tools`,
    description: `Free online ${category.label.toLowerCase()} calculators. Fast, accurate, no signup required.`,
  };
}

export default function CategoryPage({ params }: { params: { name: string } }) {
  const category = REAL_CATEGORIES.find((c) => c.id === params.name);
  if (!category) notFound();
  const calcs = getCalculatorsByCategory(category.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <a href="/" className="text-sm text-brand-600 hover:underline">← All Calculators</a>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-3 mb-2">
          {category.icon} {category.label} Calculators
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {calcs.length} free {category.label.toLowerCase()} calculators — instant, accurate, no signup.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {calcs.map((c) => <CalculatorCard key={c.slug} calculator={c} />)}
      </div>
    </div>
  );
}
