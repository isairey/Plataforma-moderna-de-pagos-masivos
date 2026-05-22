"use client";

import { CtaActions } from "./cta-actions";

interface CtaSectionProps {
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
}

export function CtaSection({
  title,
  description,
  primaryButtonText,
  secondaryButtonText,
}: CtaSectionProps) {
  return (
    <div className="py-16 px-6 mx-auto max-w-4xl">
      <div className="rounded-3xl p-12 text-center border bg-[#0F1B1A]">
        <div
          className="absolute inset-0 opacity-30 mix-blend-soft-light pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundSize: "150px",
          }}
        />
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            {title}
          </h2>

          <p className="text-lg text-[#D1D5DB] mb-10 leading-relaxed">
            {description}
          </p>

          <CtaActions
            primaryText={primaryButtonText}
            secondaryText={secondaryButtonText}
          />
        </div>
      </div>
    </div>
  );
}
