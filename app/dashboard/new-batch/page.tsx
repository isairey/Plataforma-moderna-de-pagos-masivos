"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { useFreighter } from "@/hooks/use-freighter";
import { parsePaymentFile, getBatchSummary } from "@/lib/stellar";
import type { ParsedPaymentFile, BatchResult } from "@/lib/stellar/types";
import { Send, Info, Lightbulb, Check, AlertCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewBatchPaymentPage() {
  const [step, setStep] = useState(1);
  const [selectedNetwork, setSelectedNetwork] = useState<"testnet" | "mainnet">("testnet");
  const [file, setFile] = useState<File | null>(null);
  const [fileFormat, setFileFormat] = useState<"json" | "csv" | null>(null);
  const [validationResult, setValidationResult] = useState<ParsedPaymentFile | null>(null);
  const [validationError, setValidationError] = useState("");
  const [summary, setSummary] = useState<{
    recipientCount: number;
    validCount: number;
    invalidCount: number;
    totalAmount: string;
    assetBreakdown: Record<string, number>;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);

  const { publicKey, signTx } = useFreighter();

  // STEP DEFINITIONS
  const steps = [
    { id: 1, name: "Upload File" },
    { id: 2, name: "Validate" },
    { id: 3, name: "Review" },
    { id: 4, name: "Submit" },
  ];

  const handleFileSelect = async (selectedFile: File, format: "json" | "csv") => {
    setFile(selectedFile);
    setFileFormat(format);

    try {
      const content = await selectedFile.text();
      const parsed = parsePaymentFile(content, format);
      setValidationResult(parsed);
      setValidationError("");

      // Calculate summary
      const instructions = parsed.rows.map(r => r.instruction);
      const batchSummary = getBatchSummary(instructions);
      setSummary(batchSummary);

      toast.success("File parsed and validated successfully");
      setStep(2);
    } catch (error) {
      console.error("Failed to parse file:", error);
      setValidationResult(null);
      setSummary(null);
      setValidationError(error instanceof Error ? error.message : "Failed to parse payment file");
      toast.error(error instanceof Error ? error.message : "Failed to parse payment file");
    }
  };

  const estimatedFees = summary ? (summary.validCount * 0.0001).toFixed(4) : "0.0000";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-slate-400 hover:text-white">
          Dashboard
        </Link>
        <span className="text-slate-600">›</span>
        <span className="text-emerald-500">New Batch Payment</span>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">New Batch Payment</h1>
        <p className="text-slate-400">
          Upload a payment file and send multiple crypto transactions securely.
        </p>
      </div>

      {/* Wallet Connection */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          {publicKey ? "Wallet connected" : "Connect your wallet to get started"}
        </div>
        <ConnectWalletButton />
      </div>

      {/* Stepper */}
      <div className="mb-8 pt-4">
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-800 -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 -z-10 transition-all duration-300"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2 bg-[#0B0F1A] px-2 md:px-4">
              <button
                disabled={step < s.id && (s.id > 1 && (!file || !summary))}
                onClick={() => setStep(s.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 outline-hidden disabled:cursor-not-allowed ${
                  step > s.id
                    ? "bg-emerald-500 border-emerald-500 text-white cursor-pointer hover:bg-emerald-600"
                    : step === s.id
                    ? "bg-[#0B0F1A] border-emerald-500 text-emerald-500"
                    : "bg-[#0B0F1A] border-slate-700 text-slate-500"
                }`}
              >
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </button>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  step >= s.id ? "text-emerald-500" : "text-slate-500"
                }`}
              >
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Upload Payment File</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload onFileSelect={handleFileSelect} />
                {file && (
                  <div className="mt-4 text-sm text-slate-400">
                    Selected:
                    <span className="text-white font-medium"> {file.name}</span>
                    {fileFormat && (
                      <span className="ml-2 text-emerald-500">
                        ({fileFormat.toUpperCase()})
                      </span>
                    )}
                  </div>
                )}
                {validationError && (
                  <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                    {validationError}
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setStep(2)}
                disabled={!file || !summary}
                className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto px-8"
              >
                Continue to Validation
              </Button>
            </div>
          </div>
          {/* Tips */}
          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <CardTitle className="text-lg text-white">Tips</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-slate-400">Use valid Stellar wallet addresses</p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-slate-400">Verify amounts and asset types</p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-slate-400">Test with small amounts first</p>
                </div>
                <button className="text-emerald-500 hover:text-emerald-400 text-sm flex items-center gap-1 mt-2">
                  <BookOpen className="w-3 h-3" />
                  View Documentation
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: Validation */}
      {/* ... Keep the rest of your existing step 2, 3, 4 code unchanged ... */}
    </div>
  );
}