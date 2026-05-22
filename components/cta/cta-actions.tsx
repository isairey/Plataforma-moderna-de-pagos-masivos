"use client";

import { Button } from "@/components/ui/button";

interface CtaActionsProps {
  primaryText: string;
  secondaryText: string;
}

export function CtaActions({ primaryText, secondaryText }: CtaActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      {/* Primary Button */}
      <Button
        size="lg"
        className="bg-[#10B981] hover:bg-[#0F9E6E] text-[#E5E7EB] px-10 py-6 text-base font-medium rounded min-w-[240px] shadow-lg shadow-black/20 transition-all"
      >
        {primaryText}
      </Button>

      {/* Secondary Button */}
      <Button
        variant="outline"
        size="lg"
        className="bg-[#4B5563] hover:bg-[#374151] border-[#4B5563] text-white px-10 py-6 text-base font-medium rounded min-w-[240px] transition-all"
      >
        {secondaryText}
      </Button>
    </div>
  );
}
