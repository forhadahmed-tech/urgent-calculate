import Link from "next/link";
import { Calculator } from "lucide-react";

const FOOTER_LINKS: Record<string, { label: string; slug: string }[]> = {
  "Health": [
    { label: "BMI Calculator", slug: "bmi-calculator" },
    { label: "BMR Calculator", slug: "bmr-calculator" },
    { label: "Calorie Calculator", slug: "calorie-calculator" },
    { label: "Water Intake", slug: "water-intake-calculator" },
  ],
  "Finance": [
    { label: "EMI Calculator", slug: "loan-emi-calculator" },
    { label: "Compound Interest", slug: "compound-interest-calculator" },
    { label: "Discount Calculator", slug: "discount-calculator" },
    { label: "Mortgage Calculator", slug: "mortgage-calculator" },
  ],
  "Math": [
    { label: "Percentage Calculator", slug: "percentage-calculator" },
    { label: "Average Calculator", slug: "average-calculator" },
    { label: "Fraction Calculator", slug: "fraction-calculator" },
    { label: "Square Root", slug: "square-root-calculator" },
  ],
  "Fun & Tools": [
    { label: "Love Calculator", slug: "love-calculator" },
    { label: "Password Generator", slug: "password-generator" },
    { label: "Random Number", slug: "random-number-generator" },
    { label: "Dice Roller", slug: "dice-roller" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-brand-600 mb-3">
              <Calculator className="w-5 h-5" />
              UrgentCalculate
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Free, fast, and accurate calculators for every need. No signup. No login. Instant results.
            </p>
            <div className="flex flex-col gap-1 text-sm">
              <Link href="/about" className="text-slate-400 hover:text-brand-600 transition-colors">About</Link>
              <Link href="/privacy" className="text-slate-400 hover:text-brand-600 transition-colors">Privacy Policy</Link>
              <Link href="/search" className="text-slate-400 hover:text-brand-600 transition-colors">Search Calculators</Link>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 text-sm">{category}</h3>
              <ul className="space-y-2">
                {links.map(({ label, slug }) => (
                  <li key={slug}>
                    <Link
                      href={`/calculator/${slug}`}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} UrgentCalculate. All rights reserved.</p>
          <p>All calculators are for informational purposes only.</p>
        </div>
      </div>
    </footer>
  );
}
