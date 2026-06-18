import { Metadata } from "next";
import { HomeClient } from "@/components/ui/HomeClient";
import { CALCULATORS, CATEGORIES, getFeaturedCalculators } from "@/data/calculators";

export const metadata: Metadata = {
  title: "UrgentCalculate — 100+ Free Online Calculators",
  description:
    "Instant free online calculators for BMI, EMI, compound interest, age, percentage, tip, and 100+ more. Fast, accurate, no signup required.",
};

export default function HomePage() {
  const featured = getFeaturedCalculators();
  return (
    <HomeClient
      allCalculators={CALCULATORS}
      featured={featured}
      categories={CATEGORIES}
    />
  );
}
