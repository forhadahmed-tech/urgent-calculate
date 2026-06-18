import { Metadata } from "next";
import { CALCULATORS, CATEGORIES } from "@/data/calculators";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About UrgentCalculate — Free Online Calculators",
  description:
    "UrgentCalculate provides 100+ free, fast, accurate online calculators for health, finance, math, conversions, and daily life. No signup, no ads.",
};

export default function AboutPage() {
  const realCategories = CATEGORIES.filter((c) => c.id !== "all");
  const countByCategory = realCategories.map((cat) => ({
    name: cat.label,
    icon: cat.icon,
    count: CALCULATORS.filter((c) => c.category === cat.id).length,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-brand-600 hover:underline">← Home</Link>

      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-4 mb-6">
        About UrgentCalculate
      </h1>

      <div className="prose dark:prose-invert prose-slate max-w-none space-y-6">
        <p className="text-lg text-slate-600 dark:text-slate-400">
          UrgentCalculate is a free, fast, and accurate online calculator hub. We believe that
          useful calculation tools should be instantly accessible — no signup, no subscription,
          no clutter.
        </p>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            📊 Calculator Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl">
              <div className="text-4xl font-extrabold text-brand-600">{CALCULATORS.length}+</div>
              <div className="text-sm text-slate-500 mt-1">Total Calculators</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="text-4xl font-extrabold text-green-600">{realCategories.length}</div>
              <div className="text-sm text-slate-500 mt-1">Categories</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {countByCategory.map(({ name, icon, count }) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">{icon} {name}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {count} calculators
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            🚀 Our Mission
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Every day, millions of people need quick answers to everyday calculations — from BMI
            checks to loan EMIs, from tip splits to unit conversions. We built UrgentCalculate
            so those answers are always one click away, on any device, in any network condition.
          </p>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            ⚙️ Technical Details
          </h2>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
            <li>✅ 100% client-side — no data is ever sent to any server</li>
            <li>✅ Fully static site — blazing fast on any CDN</li>
            <li>✅ Dark mode support with system preference detection</li>
            <li>✅ Mobile-first responsive design</li>
            <li>✅ Bookmarks and history stored locally in your browser</li>
            <li>✅ Built with Next.js 14 App Router, TypeScript, and Tailwind CSS</li>
            <li>✅ Deployed on Vercel Edge Network</li>
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            ⚠️ Disclaimer
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            All calculators on UrgentCalculate are for informational and educational purposes
            only. They should not replace professional medical, financial, or legal advice.
            Always consult qualified professionals for important decisions. Results are estimates
            based on standard formulas and may vary based on individual circumstances.
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="btn-primary">
          Explore All Calculators
        </Link>
      </div>
    </div>
  );
}
