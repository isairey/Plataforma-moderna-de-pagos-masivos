"use client"

import { Send, Info, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ActionCardProps {
  onSubmit?: () => void
  disabled?: boolean
  className?: string
}

export function ActionCard({
  onSubmit,
  disabled = false,
  className,
}: ActionCardProps) {
  return (
    <Card className={cn("border-[#1F2937] bg-[#121827] shadow-lg", className)}>
      <CardContent className="p-6 space-y-6">
        <Button 
          onClick={onSubmit}
          disabled={disabled}
          className="w-full h-14 bg-[#00D98B] hover:bg-[#00D98B]/90 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
        >
          <Send className="h-6 w-6 rotate-[-45deg]" />
          Submit Batch Payment
        </Button>

        <div className="space-y-4">
          <div className="flex gap-3 text-gray-400">
            <Info className="h-5 w-5 text-blue-400 shrink-0" />
            <p className="text-sm leading-tight">Transactions are irreversible once submitted</p>
          </div>

          <div className="flex gap-3 text-gray-400">
            <ShieldCheck className="h-5 w-5 text-green-400 shrink-0" />
            <p className="text-sm leading-tight">All payments are validated before processing</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
