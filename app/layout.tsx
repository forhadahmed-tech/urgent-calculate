import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0284c7",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://urgentcalculate.com"),
  title: {
    default: "UrgentCalculate — 100+ Free Online Calculators",
    template: "%s | UrgentCalculate",
  },
  description:
    "Free online calculators for health, finance, math, time, and daily life. BMI, EMI, compound interest, age, percentage, and 100+ more calculators.",
  keywords: [
    "calculator", "online calculator", "free calculator",
    "bmi calculator", "emi calculator", "percentage calculator",
    "compound interest", "age calculator",
  ],
  authors: [{ name: "UrgentCalculate" }],
  creator: "UrgentCalculate",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://urgentcalculate.com",
    siteName: "UrgentCalculate",
    title: "UrgentCalculate — 100+ Free Online Calculators",
    description: "Free instant calculators for health, finance, math, conversions, and everyday life.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UrgentCalculate — 100+ Free Online Calculators",
    description: "Free instant calculators for health, finance, math, conversions, and everyday life.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
