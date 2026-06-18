"use client";
import { CalcResult } from "@/lib/calculations";
import { Copy, CheckCheck, AlertCircle, TrendingUp } from "lucide-react";
import clsx from "clsx";

interface Props {
  result: CalcResult;
  onCopy: () => void;
  copied: boolean;
}

export function ResultsPanel({ result, onCopy, copied }: Props) {
  // Error state
  if (result.error) {
    return (
      <div className="mx-6 mb-6 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">Input Error</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{result.error}</p>
        </div>
      </div>
    );
  }

  if (!result.outputs.length) return null;

  return (
    <div className="border-t border-slate-100 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50/80 dark:bg-slate-800/50">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
          <TrendingUp className="w-4 h-4 text-brand-500" />
          Results
        </span>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          {copied ? (
            <>
              <CheckCheck className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy Results
            </>
          )}
        </button>
      </div>

      {/* Output rows */}
      <div className="px-6 pb-4">
        {result.outputs.map((row, i) => (
          <div key={i} className="result-row">
            <span className="text-sm text-slate-500 dark:text-slate-400 pr-4 shrink-0">
              {row.label}
            </span>
            <span
              className={clsx(
                "text-right font-mono text-sm break-all",
                row.highlight
                  ? "font-bold text-base px-3 py-1 rounded-lg text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/30 ring-1 ring-brand-200 dark:ring-brand-800"
                  : "text-slate-700 dark:text-slate-300"
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
