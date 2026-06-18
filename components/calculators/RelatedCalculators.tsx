import Link from "next/link";
import { Calculator } from "@/data/calculators";
import { ArrowRight } from "lucide-react";

interface Props {
  calculators: Calculator[];
}

export function RelatedCalculators({ calculators }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {calculators.map((c) => (
        <Link
          key={c.slug}
          href={`/calculator/${c.slug}`}
          className="group flex items-center gap-3 p-3 card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <span className="text-xl shrink-0">{c.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand-600 transition-colors truncate">
              {c.title}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors shrink-0" />
        </Link>
      ))}
    </div>
  );
}
