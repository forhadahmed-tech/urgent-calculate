"use client";
// Static export: searchParams must be handled client-side
import { useMemo } from "react";
import { CALCULATORS } from "@/data/calculators";
import { CalculatorCard } from "@/components/ui/CalculatorCard";
import Link from "next/link";

export default function SearchPage() {
  // Read ?q= from URL client-side (compatible with static export)
  const q = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("q") ?? "";
  }, []);

  const results = useMemo(() => {
    const lq = q.toLowerCase().trim();
    if (!lq) return [];
    return CALCULATORS.filter(
      (c) =>
        c.title.toLowerCase().includes(lq) ||
        c.description.toLowerCase().includes(lq) ||
        c.tags.some((t) => t.toLowerCase().includes(lq)) ||
        c.category.toLowerCase().includes(lq)
    );
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Link href="/" className="text-sm text-brand-600 hover:underline">← Home</Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-3 mb-6">
        {q ? (
          <>
            {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
            <span className="text-brand-600">&ldquo;{q}&rdquo;</span>
          </>
        ) : (
          "Search Calculators"
        )}
      </h1>

      {/* Search form */}
      <form action="/search" method="GET" className="mb-8">
        <div className="flex gap-3 max-w-lg">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search 100+ calculators…"
            className="input-field flex-1"
            autoFocus
          />
          <button type="submit" className="btn-primary px-6">Search</button>
        </div>
      </form>

      {/* No results */}
      {q && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No calculators found for &ldquo;{q}&rdquo;
          </p>
          <p className="text-slate-400 mb-6 text-sm">
            Try a different keyword, or browse all calculators below.
          </p>
          <Link href="/" className="btn-primary">Browse All Calculators</Link>
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((c) => (
            <CalculatorCard key={c.slug} calculator={c} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!q && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-5xl mb-4">🧮</p>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
            Type above to search 100+ free calculators
          </p>
        </div>
      )}
    </div>
  );
}
