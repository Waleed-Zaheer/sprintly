import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted">Last updated: {lastUpdated}</p>

          <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-foreground/90">
            This is a starting-point template, not legal advice — have it reviewed by a lawyer familiar with your
            jurisdiction and business before relying on it.
          </div>

          <div className="prose-legal mt-10 space-y-8 text-sm leading-relaxed text-foreground/90">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
