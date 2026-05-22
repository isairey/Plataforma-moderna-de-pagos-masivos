import {
  Rocket,
  Wallet,
  Upload,
  CheckCircle,
  Send,
  Eye,
  Lightbulb,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export function QuickStartGuide() {
  const steps = [
    {
      number: 1,
      icon: Wallet,
      title: "Connect Wallet",
      description: "Connect your Stellar wallet to authorize transactions",
    },
    {
      number: 2,
      icon: Upload,
      title: "Upload Payment File",
      description: "Upload CSV or JSON file with recipient details",
    },
    {
      number: 3,
      icon: CheckCircle,
      title: "Validate Recipients",
      description: "Review and validate all payment recipients",
    },
    {
      number: 4,
      icon: Send,
      title: "Submit Batch",
      description: "Submit batch transaction to Stellar network",
    },
    {
      number: 5,
      icon: Eye,
      title: "Review Results",
      description: "Monitor transaction status and review results",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Documentation</h1>
        <p className="text-gray-400">
          Guides, tutorials, and technical resources for using Stellar BatchPay.
        </p>
      </div>

      <Card className="bg-[#0a1628] border-[#1e3a5f] p-8">
        <div className="flex items-center gap-2 mb-6">
          <Rocket className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-semibold text-white">
            Quick Start Guide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center">
                    <span className="text-gray-900 font-semibold">
                      {step.number}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-4">
          <div className="flex gap-3">
            <Lightbulb className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-emerald-400 font-medium mb-1">Pro Tip</h4>
              <p className="text-gray-300 text-sm">
                Start with testnet to familiarize yourself with the process
                before using mainnet.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
