import Link from "next/link";
import { Calculator, CATEGORIES } from "@/data/calculators";
import clsx from "clsx";

interface Props {
  calculator: Calculator;
  compact?: boolean;
}

// Tailwind color classes per category id — used for the small category badge
const CATEGORY_BADGE: Record<string, string> = {
  health:     "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  finance:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  math:       "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  time:       "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  conversion: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  daily:      "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  fun:        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
};

function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function CalculatorCard({ calculator: c, compact }: Props) {
  return (
    <Link
      href={`/calculator/${c.slug}`}
      className={clsx(
        "group card p-5 flex flex-col gap-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer",
        compact && "p-4 gap-2"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={clsx("text-2xl", compact && "text-xl")}>{c.icon}</span>
        <span
          className={clsx(
            "text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
            CATEGORY_BADGE[c.category] ?? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
          )}
        >
          {categoryLabel(c.category)}
        </span>
      </div>
      <div>
        <h3
          className={clsx(
            "font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors",
            compact ? "text-sm" : "text-base"
          )}
        >
          {c.title}
        </h3>
        {!compact && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {c.description}
          </p>
        )}
      </div>
    </Link>
  );
}
