# UrgentCalculate 🧮

A fast, SEO-optimized, fully static calculator website with **89 free online calculators** across 7 categories — Health, Finance, Math, Time & Date, Conversion, Daily Life, and Fun & Games. Built with Next.js App Router, TypeScript, and Tailwind CSS. **No backend. No database. 100% client-side.**

---

## ✨ Features

- **89 calculators** generated from a single typed data registry — add a new calculator by adding one object + one function, no new pages or routes needed
- **Fully static (SSG)** — every calculator page is pre-rendered at build time via `generateStaticParams`
- **SEO-optimized** — unique meta title/description/OG tags per calculator, JSON-LD structured data (SoftwareApplication + BreadcrumbList), sitemap.xml, robots.txt
- **Dark mode** with system-preference detection, persisted in `localStorage`
- **Search** — instant client-side fuzzy search across titles, descriptions, tags, and categories
- **Category filtering** with URL sync (`/?category=Health`) so links are shareable and bookmarkable
- **Recently used** and **bookmarked** calculators, persisted in `localStorage` (no account needed)
- **Copy results** to clipboard, **share** via Web Share API (falls back to clipboard on desktop)
- **AdSense-ready placeholder slots** on every calculator page (top/mid/bottom)
- **Mobile-first responsive** card-grid UI
- Zero runtime dependencies beyond `lucide-react` (icons) and `clsx` (conditional classnames)

---

## 🗂 Project Structure

```
calculator-site/
├── app/
│   ├── layout.tsx                  # Root layout: header, footer, theme provider, global metadata
│   ├── page.tsx                    # Homepage (renders HomeClient)
│   ├── globals.css                 # Tailwind layers + design tokens
│   ├── not-found.tsx               # Custom 404
│   ├── sitemap.ts                  # Auto-generated sitemap.xml from calculator registry
│   ├── robots.ts                   # robots.txt generator
│   ├── about/page.tsx              # About page with live calculator stats
│   ├── privacy/page.tsx            # Privacy policy
│   ├── search/page.tsx             # Client-side search results page (?q=)
│   ├── category/[name]/page.tsx    # SSG category landing pages (/category/health)
│   └── calculator/[slug]/page.tsx  # ⭐ Dynamic calculator page — generates all 89 pages
│
├── components/
│   ├── ui/
│   │   ├── Header.tsx              # Sticky nav, search, dark-mode toggle, mobile menu
│   │   ├── Footer.tsx               # Footer link columns
│   │   ├── ThemeProvider.tsx        # Dark mode context (localStorage-backed)
│   │   ├── HomeClient.tsx           # Homepage interactivity: search, filters, recents, bookmarks
│   │   └── CalculatorCard.tsx       # Reusable card used in all grids
│   └── calculators/
│       ├── CalculatorClient.tsx     # ⭐ Generic calculator shell: fields → calculate → results
│       ├── FieldRenderer.tsx        # Renders number/select/date/text inputs from field config
│       ├── ResultsPanel.tsx         # Color-coded result rows, copy button, disclaimer box
│       └── RelatedCalculators.tsx   # "Related calculators" grid at the bottom of each page
│
├── data/
│   └── calculators.ts              # ⭐ THE REGISTRY — all 89 calculators: fields, copy, SEO content
│
├── lib/
│   ├── calculations.ts             # ⭐ THE ENGINE — pure calculation functions, one per calculator
│   ├── hooks.ts                    # useLocalStorage, useRecentCalculators, useBookmarks
│   └── utils.ts                    # formatNumber, copyToClipboard, share, gcd/lcm, slugify, etc.
│
├── public/
│   ├── favicon.svg / favicon-*.png / apple-touch-icon.png / icon-192.png / icon-512.png
│   ├── og-image.png                # Social share image (1200×630)
│   └── manifest.json               # PWA manifest
│
├── next.config.ts                  # output: "export" — fully static build
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── package.json
```

---

## 🧠 How the Dynamic Calculator System Works

Every calculator is defined in **two places** that are joined by a `slug`:

### 1. `data/calculators.ts` — the **shape** (UI + SEO + content)

```ts
{
  slug: "bmi-calculator",
  title: "BMI Calculator",
  shortTitle: "BMI",
  description: "Calculate your Body Mass Index...",   // meta description + card subtitle
  longDescription: "Body Mass Index (BMI) is...",       // SEO content block on the page
  category: "Health",
  icon: "⚖️",
  featured: true,
  fields: [
    { id: "weight", label: "Weight", type: "number", unit: "kg", required: true },
    { id: "height", label: "Height", type: "number", unit: "cm", required: true },
  ],
  formula: "BMI = weight(kg) / height(m)²",
  tags: ["bmi", "body mass index", "weight", "health"],
}
```

### 2. `lib/calculations.ts` — the **logic** (pure function, keyed by the same slug)

```ts
const bmi: CalcFn = ({ weight, height }) => {
  const w = num(weight), h = num(height) / 100;
  const bmiVal = w / (h * h);
  return { rows: [
    { label: "Your BMI", value: fmt(bmiVal, 1), highlight: true, color: "green" },
    { label: "Category", value: "Normal Weight ✓", color: "green" },
  ]};
};

export const CALCULATION_REGISTRY: Record<string, CalcFn> = {
  "bmi-calculator": bmi,
  // ...88 more
};
```

### 3. One generic page renders all of them

`app/calculator/[slug]/page.tsx` calls `generateStaticParams()` to pre-render all 89 slugs at build time. Each page renders the **same** `<CalculatorClient calculator={calc} />` component, which:

1. Reads `calculator.fields` and renders the right input for each (`FieldRenderer`)
2. On submit, calls `calculate(calculator.slug, values)` from `lib/calculations.ts`
3. Renders the returned `{ rows, error?, disclaimer? }` via `ResultsPanel`

**Adding calculator #90 requires zero new files** — just append one object to `calculators.ts` and one function (registered by slug) to `calculations.ts`.

---

## 🚀 Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open http://localhost:3000
```

### Build & preview the static export

```bash
npm run build      # outputs fully static site to /out
npx serve out       # preview the static build locally
```

---

## ☁️ Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel          # first deploy (follow prompts)
vercel --prod   # promote to production
```

### Option B — Git integration (recommended)

1. Push this repo to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Framework preset: **Next.js** (auto-detected)
4. Build command: `npm run build` (already set in `vercel.json`)
5. Output directory: `out` (already set in `vercel.json`)
6. Click **Deploy** — done in ~60 seconds

Because `next.config.ts` sets `output: "export"`, the entire site builds to static HTML/CSS/JS with **no serverless functions required** — it can also be deployed to Netlify, Cloudflare Pages, GitHub Pages, or any static host.

---

## ➕ Adding a New Calculator (Step-by-Step)

1. **Open `data/calculators.ts`** and add a new object to the `calculators` array:
   ```ts
   {
     slug: "my-new-calculator",
     title: "My New Calculator",
     shortTitle: "New Calc",
     description: "One-line description for SEO + cards.",
     longDescription: "A longer paragraph explaining the concept for the SEO content block.",
     category: "Math",                 // must be one of the 7 CATEGORIES
     icon: "🆕",
     fields: [
       { id: "input1", label: "First Value", type: "number", required: true },
     ],
     formula: "result = input1 * 2",
     tags: ["new", "example"],
   }
   ```

2. **Open `lib/calculations.ts`** and write the pure function + register it:
   ```ts
   const myNewCalc: CalcFn = ({ input1 }) => {
     const v = num(input1);
     return { rows: [{ label: "Result", value: fmt(v * 2), highlight: true, color: "blue" }] };
   };

   export const CALCULATION_REGISTRY: Record<string, CalcFn> = {
     // ...existing entries
     "my-new-calculator": myNewCalc,
   };
   ```

3. **Rebuild** — `app/calculator/[slug]/page.tsx` automatically picks up the new slug via `generateStaticParams()`. No routing changes needed.

---

## 🎨 Customization

| What | Where |
|---|---|
| Brand color | `tailwind.config.ts` → `theme.extend.colors.brand` |
| Site name / domain | `app/layout.tsx` metadata + `app/sitemap.ts` / `app/robots.ts` base URL |
| Currency exchange rates | `lib/calculations.ts` → `CURRENCY_RATES` (static, update periodically) |
| US tax brackets | `lib/calculations.ts` → `taxCalc()` (update yearly) |
| AdSense slots | Search for `ad-slot` in `app/calculator/[slug]/page.tsx` and `components/ui/HomeClient.tsx` |
| Footer link columns | `components/ui/Footer.tsx` → `FOOTER_LINKS` |

---

## ⚠️ Disclaimer

All calculators are for informational and educational purposes only and should not replace professional medical, financial, or legal advice. Currency rates are static approximations. Tax calculations use simplified brackets and don't account for state taxes, credits, or itemized deductions.

---

## 📄 License

MIT — use freely for personal or commercial projects.
# urgent-calculate
