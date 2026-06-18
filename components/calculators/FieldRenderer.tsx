"use client";
import { Field } from "@/data/calculators";
import clsx from "clsx";

interface Props {
  field: Field;
  value: string;
  onChange: (val: string) => void;
}

// Fields that should take the full grid width (long free-text inputs)
const FULL_WIDTH_IDS = new Set(["text", "names", "grades", "numbers", "list"]);

export function FieldRenderer({ field, value, onChange }: Props) {
  const id = `field-${field.id}`;
  const isFullWidth = field.type === "text" && FULL_WIDTH_IDS.has(field.id);

  return (
    <div className={clsx(isFullWidth && "sm:col-span-2")}>
      <label htmlFor={id} className="label">
        {field.label}
      </label>

      {field.type === "select" ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        >
          <option value="">— Select —</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === "radio" ? (
        <div className="flex gap-2 flex-wrap">
          {field.options?.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={clsx(
                "px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150",
                value === opt.value
                  ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-brand-400"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : isFullWidth ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.id === "text" ? 6 : 3}
          className="input-field resize-y font-mono text-sm"
        />
      ) : field.type === "date" ? (
        <input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
      ) : (
        <div className="relative">
          <input
            id={id}
            type={field.type === "text" ? "text" : "number"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step ?? (field.type === "number" ? "any" : undefined)}
            className={clsx("input-field", field.unit && "pr-14")}
          />
          {field.unit && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none select-none">
              {field.unit}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
