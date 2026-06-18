"use client";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Calculator, Menu, X, Search } from "lucide-react";
import { useState, useRef, FormEvent } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Health",     href: "/?category=health" },
  { label: "Finance",    href: "/?category=finance" },
  { label: "Math",       href: "/?category=math" },
  { label: "Conversion", href: "/?category=conversion" },
  { label: "Daily Life", href: "/?category=daily" },
  { label: "About",      href: "/about" },
];

const MOBILE_LINKS = [
  ...NAV_LINKS,
  { label: "Fun & Games", href: "/?category=fun" },
  { label: "Time & Date", href: "/?category=time" },
  { label: "Privacy",     href: "/privacy" },
];

export function Header() {
  const { theme, toggle } = useTheme();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query,      setQuery]      = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const openSearch = () => {
    setSearchOpen(true);
    setMenuOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      window.location.href = `/search?q=${encodeURIComponent(q)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-600 shrink-0">
          <Calculator className="w-6 h-6" />
          <span className="hidden sm:inline">UrgentCalculate</span>
          <span className="sm:hidden font-bold">∑ Calc</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className="hover:text-brand-600 transition-colors whitespace-nowrap">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Search bar (expands inline) */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 100+ calculators…"
                className="input-field h-9 py-1.5 w-44 sm:w-64 text-sm"
              />
              <button type="submit" className="btn-primary py-1.5 px-3 text-sm h-9">
                Go
              </button>
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setQuery(""); }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button onClick={openSearch}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Search calculators">
              <Search className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          )}

          {/* Dark-mode toggle */}
          {!searchOpen && (
            <button onClick={toggle}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              {theme === "dark"
                ? <Sun  className="w-5 h-5 text-yellow-400" />
                : <Moon className="w-5 h-5 text-slate-500" />}
            </button>
          )}

          {/* Mobile hamburger */}
          {!searchOpen && (
            <button onClick={() => setMenuOpen((o) => !o)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Open menu">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-3">
          {MOBILE_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm text-slate-600 dark:text-slate-300 hover:text-brand-600 py-0.5">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
