import { Hero } from "@/components/landing/Hero";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { FeatureSection } from "@/components/feature-section";
import { HowItWorks } from "@/components/how-it-works";
import { CtaSection } from "@/components/cta-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BlockchainFeaturesSection from "@/components/blockchainfeatures-section";
import CryptoPaymentSection from "@/components/cryptopay-section";
import { Navbar } from "@/components/landing/navbar";
import { ProcessSection } from "@/components/landing/process-section";
import { SecuritySection } from "@/components/landing/security-section";
import { PaymentWorkflowsSection } from "@/components/payment-workflows-section";
import { MissionSection } from "@/components/landing/mission-section";
import { WhyTeamsChooseBatchPay } from "@/components/landing/WhyTeamsChooseBatchPay";
import StellarFooter from "@/components/landing/StellarFooter";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <Hero />
      <ProcessSection />
      <WhyTeamsChooseBatchPay />
      <HowItWorks />
      <FeatureSection />
      <BlockchainFeaturesSection />
      <SecuritySection />
      <PaymentWorkflowsSection />
      <MissionSection />
      <CryptoPaymentSection />
      <CtaSection />
      <StellarFooter />
    </main>
  );
}
