import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { FAQSection } from "@/components/marketing/FAQSection";
import { FinalCta } from "@/components/marketing/FinalCta";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <FeaturesSection />
        <PricingSection />
        <FAQSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
