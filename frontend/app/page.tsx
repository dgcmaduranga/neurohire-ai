import Navbar from "../src/components/layout/Navbar";
import Footer from "../src/components/layout/Footer";
import HeroSection from "../src/components/sections/HeroSection";
import LogoStrip from "../src/components/sections/LogoStrip";
import FeaturesSection from "../src/components/sections/FeaturesSection";
import HowItWorksSection from "../src/components/sections/HowItWorksSection";
import StatsSection from "../src/components/sections/StatsSection";
import PricingSection from "../src/components/sections/PricingSection";
import FAQSection from "../src/components/sections/FAQSection";
import CTASection from "../src/components/sections/CTASection";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#071033]">
      <Navbar />
      <HeroSection />
      <LogoStrip />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <section
        id="pricing"
        className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2"
      >
        <PricingSection />
        <FAQSection />
      </section>
      <CTASection />
      <Footer />
    </main>
  );
}