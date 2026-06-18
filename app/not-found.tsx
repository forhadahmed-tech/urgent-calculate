import Link from "next/link";
import { Calculator } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="text-8xl mb-6">🔢</div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
        404
      </h1>
      <p className="text-xl text-slate-500 dark:text-slate-400 mb-2">
        Calculator not found
      </p>
      <p className="text-slate-400 mb-8">
        This equation doesn&#39;t add up — the page you&#39;re looking for
        doesn&#39;t exist.
      </p>
      <Link href="/" className="btn-primary flex items-center gap-2">
        <Calculator className="w-4 h-4" />
        Browse All Calculators
      </Link>
    </div>
  );
}
