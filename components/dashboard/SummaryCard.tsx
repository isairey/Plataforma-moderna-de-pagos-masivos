"use client"

import { Globe } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface SummaryCardProps {
  totalRecipients?: number
  validPayments?: number
  invalidPayments?: number
  estimatedFees?: string
  totalPayout?: string
  className?: string
}

export function SummaryCard({
  totalRecipients = 25,
  validPayments = 23,
  invalidPayments = 2,
  estimatedFees = "0.125 XLM",
  totalPayout = "2,847.50 XLM",
  className,
}: SummaryCardProps) {
  return (
    <Card className={cn("border-[#1F2937] bg-[#121827] shadow-lg", className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6 text-white font-bold text-xl">
          <Globe className="h-5 w-5 text-gray-400" />
          <h2>Transaction Summary</h2>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Recipients</span>
            <span className="text-white font-medium">{totalRecipients}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Valid Payments</span>
            <span className="text-[#00D98B] font-medium">{validPayments}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Invalid Payments</span>
            <span className="text-red-500 font-medium">{invalidPayments}</span>
          </div>

          <Separator className="bg-[#1F2937]" />

          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-400">Estimated Fees</span>
            <span className="text-white font-medium">{estimatedFees}</span>
          </div>

          <div className="flex justify-between items-center text-xl">
            <span className="text-gray-400 font-medium">Total Payout</span>
            <span className="text-white font-bold">{totalPayout}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
