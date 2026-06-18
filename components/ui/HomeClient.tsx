"use client";
import { useState, useMemo, useEffect } from "react";
import { Search, Star, Clock, ChevronRight } from "lucide-react";
import { Calculator } from "@/data/calculators";
import { CalculatorCard } from "./CalculatorCard";
import clsx from "clsx";

interface CategoryDef {
  id: string;
  label: string;
  icon: string;
}

interface Props {
  allCalculators: Calculator[];
  featured: Calculator[];
  categories: CategoryDef[]; // includes the 'all' entry
}

export function HomeClient({ allCalculators, featured, categories }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [recent, setRecent] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Real, filterable categories (exclude the "all" pseudo-category)
  const realCategories = categories.filter((c) => c.id !== "all");

  useEffect(() => {
    setRecent(JSON.parse(localStorage.getItem("uc_recent") || "[]"));
    setBookmarks(JSON.parse(localStorage.getItem("uc_bookmarks") || "[]"));

    // Read ?category= from URL on initial load (static-export compatible)
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat && categories.some((c) => c.id === cat)) {
      setActiveCategory(cat);
    }
  }, [categories]);

  // Keep the URL in sync without a full navigation/reload
  const selectCategory = (catId: string) => {
    setActiveCategory(catId);
    const url = new URL(window.location.href);
    if (catId === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", catId);
    window.history.replaceState({}, "", url.toString());
  };

  const filtered = useMemo(() => {
    let list = allCalculators;
    if (activeCategory !== "all") list = list.filter((c) => c.category === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.includes(q))
      );
    }
    return list;
  }, [allCalculators, query, activeCategory]);

  const recentCalcs = recent
    .map((slug) => allCalculators.find((c) => c.slug === slug))
    .filter(Boolean) as Calculator[];

  const bookmarkedCalcs = bookmarks
    .map((slug) => allCalculators.find((c) => c.slug === slug))
    .filter(Boolean) as Calculator[];

  const categoryGroups = useMemo(() => {
    if (query || activeCategory !== "all") return null;
    const groups: Record<string, Calculator[]> = {};
    allCalculators.forEach((c) => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [allCalculators, query, activeCategory]);

  const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
          <span className="text-brand-600">{allCalculators.length}+</span> Free Online Calculators
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Instant, accurate calculators for health, finance, math, conversions, and everyday life. No signup. No ads.
        </p>

        {/* Search */}
        <div className="relative max-w-xl mx-auto mt-7">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
          <input
            type="search"
            placeholder="Search calculators… (BMI, EMI, tip, age…)"
            className="input-field pl-12 text-base h-14 shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Top Ad */}
      <div className="ad-slot h-20 mb-8">Advertisement</div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => selectCategory(cat.id)}
            className={clsx(
              "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150",
              activeCategory === cat.id
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-400"
            )}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Recent & Bookmarks */}
      {!query && activeCategory === "all" && (
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {recentCalcs.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm uppercase tracking-wider">
                <Clock className="w-4 h-4" /> Recently Used
              </h2>
              <div className="flex flex-wrap gap-2">
                {recentCalcs.slice(0, 6).map((c) => (
                  <a
                    key={c.slug}
                    href={`/calculator/${c.slug}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm hover:border-brand-400 transition-colors"
                  >
                    <span>{c.icon}</span> {c.title}
                  </a>
                ))}
              </div>
            </div>
          )}
          {bookmarkedCalcs.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm uppercase tracking-wider">
                <Star className="w-4 h-4 text-yellow-400" /> Bookmarked
              </h2>
              <div className="flex flex-wrap gap-2">
                {bookmarkedCalcs.slice(0, 6).map((c) => (
                  <a
                    key={c.slug}
                    href={`/calculator/${c.slug}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm hover:border-brand-400 transition-colors"
                  >
                    <span>{c.icon}</span> {c.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Featured */}
      {!query && activeCategory === "all" && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">⭐ Popular Calculators</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((c) => (
              <CalculatorCard key={c.slug} calculator={c} />
            ))}
          </div>
        </section>
      )}

      {/* Search / filtered results */}
      {(query || activeCategory !== "all") && (
        <section>
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
            {filtered.length} calculator{filtered.length !== 1 ? "s" : ""} found
            {activeCategory !== "all" ? ` in ${categoryLabel(activeCategory)}` : ""}
            {query ? ` for "${query}"` : ""}
          </h2>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No calculators found</p>
              <p className="text-sm mt-1">Try different keywords</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((c) => (
                <CalculatorCard key={c.slug} calculator={c} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Category sections (default view) */}
      {!query && activeCategory === "all" && categoryGroups && (
        <div className="space-y-12">
          {realCategories
            .filter((cat) => categoryGroups[cat.id]?.length)
            .map((cat) => (
              <section key={cat.id}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {cat.icon} {cat.label}
                  </h2>
                  <button
                    onClick={() => selectCategory(cat.id)}
                    className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categoryGroups[cat.id].slice(0, 8).map((c) => (
                    <CalculatorCard key={c.slug} calculator={c} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}

      {/* Bottom Ad */}
      <div className="ad-slot h-24 mt-12">Advertisement</div>
    </div>
  );
}
