"use client";

import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  recommended?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For individuals and small teams getting started with batch payments.",
    features: [
      { text: "Up to 50 payments per batch", included: true },
      { text: "CSV file upload", included: true },
      { text: "Basic transaction history", included: true },
      { text: "Testnet support", included: true },
      { text: "Community support", included: true },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
  },
  {
    name: "Professional",
    price: "$29",
    period: "/month",
    description: "For growing teams that need more power and advanced features.",
    features: [
      { text: "Up to 500 payments per batch", included: true },
      { text: "CSV and API uploads", included: true },
      { text: "Advanced transaction history", included: true },
      { text: "Testnet and Mainnet support", included: true },
      { text: "Priority email support", included: true },
      { text: "Full API access", included: true },
      { text: "Webhook notifications", included: true },
    ],
    cta: "Start Free Trial",
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with custom requirements and dedicated support.",
    features: [
      { text: "Unlimited payments per batch", included: true },
      { text: "All integration options", included: true },
      { text: "Full audit trail and reporting", included: true },
      { text: "Multi-network support", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom API limits", included: true },
      { text: "SLA guarantee", included: true },
    ],
    cta: "Contact Sales",
  },
];

function FeatureItem({ text, included }: PlanFeature) {
  return (
    <li className="flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          included
            ? "bg-[#00D98B1A] text-[#00D98B]"
            : "bg-[#252B3D] text-[#4B5563]"
        }`}
      >
        <Check className="h-3 w-3" />
      </div>
      <span
        className={`text-sm leading-relaxed ${
          included ? "text-[#E0E2E8]" : "text-[#4B5563] line-through"
        }`}
      >
        {text}
      </span>
    </li>
  );
}

function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const isRecommended = plan.recommended;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
      whileHover={{ y: -5 }}
      className={`relative flex flex-col rounded-3xl border p-8 transition-all ${
        isRecommended
          ? "border-[#00D98B4D] bg-[#111827] shadow-[0_0_40px_#00D98B10]"
          : "border-[#252B3D] bg-[#111827]"
      }`}
    >
      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00D98B] px-4 py-1 text-xs font-bold text-[#0A0E1A] uppercase tracking-wide">
            <Star className="h-3 w-3" />
            Recommended
          </span>
        </div>
      )}

      {/* Plan header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {plan.price}
          </span>
          {plan.period && (
            <span className="text-[#8B92B0] text-base font-medium">
              {plan.period}
            </span>
          )}
        </div>
        <p className="mt-3 text-sm text-[#8B92B0] leading-relaxed">
          {plan.description}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#252B3D] mb-6" />

      {/* Features */}
      <ul className="flex flex-col gap-3.5 mb-8 flex-1">
        {plan.features.map((feature, i) => (
          <FeatureItem key={i} {...feature} />
        ))}
      </ul>

      {/* CTA button */}
      <button
        className={`w-full rounded-xl py-3.5 text-sm font-bold transition-all duration-200 ${
          isRecommended
            ? "bg-[#00D98B] text-[#0A0E1A] hover:bg-[#00C47E] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#00D98B20]"
            : "border border-[#252B3D] bg-transparent text-white hover:border-[#00D98B4D] hover:bg-[#00D98B0A]"
        }`}
      >
        {plan.cta}
      </button>
    </motion.div>
  );
}

export function PricingPlans() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 md:px-12">
        {/* Section header */}
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4"
          >
            Choose Your <span className="text-[#00D98B]">Plan</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[#8B92B0] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Pick the plan that fits your needs. Upgrade or downgrade anytime.
          </motion.p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
