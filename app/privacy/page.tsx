import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — UrgentCalculate",
  description: "Privacy policy for UrgentCalculate. We don't collect personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-brand-600 hover:underline">← Home</Link>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-4 mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-slate-400 mb-8">Last updated: {new Date().getFullYear()}</p>

      <div className="space-y-6 text-slate-600 dark:text-slate-400">
        <section className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
            🔒 We Don&apos;t Collect Your Data
          </h2>
          <p>
            UrgentCalculate is a fully client-side, static website. All calculations happen
            entirely in your browser. We do not store, transmit, or process any data you enter
            into our calculators on any server.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
            💾 Local Storage
          </h2>
          <p>
            We use your browser&apos;s <code>localStorage</code> to save:
          </p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
            <li>Your dark/light mode preference</li>
            <li>Recently visited calculators (slugs only, no inputs)</li>
            <li>Bookmarked calculators (slugs only)</li>
          </ul>
          <p className="mt-3 text-sm">
            This data never leaves your device. You can clear it anytime via your browser settings.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
            📊 Analytics
          </h2>
          <p>
            We may use privacy-respecting analytics (such as Vercel Analytics or Plausible) that
            collect anonymized page view data with no personally identifiable information, no
            cookies, and full GDPR compliance.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
            💰 Advertising
          </h2>
          <p>
            We may display contextual advertisements via Google AdSense. AdSense may use cookies
            to serve relevant ads. You can opt out via Google&apos;s Ad Settings or use a browser
            extension to block ads.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
            📧 Contact
          </h2>
          <p>
            If you have questions about this privacy policy, contact us at:{" "}
            <a href="mailto:privacy@urgentcalculate.com" className="text-brand-600 hover:underline">
              privacy@urgentcalculate.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
