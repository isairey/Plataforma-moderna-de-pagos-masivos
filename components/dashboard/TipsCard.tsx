"use client"

import { Lightbulb, CheckCircle2, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TipsCardProps {
  tips?: string[]
  className?: string
}

export function TipsCard({
  tips = [
    "Use valid Stellar wallet addresses",
    "Verify amounts and asset types",
    "Test with small amounts first",
  ],
  className,
}: TipsCardProps) {
  return (
    <Card className={cn("border-[#1F2937] bg-[#121827] shadow-lg", className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6 text-white font-bold text-xl">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          <h2>Tips</h2>
        </div>

        <div className="space-y-4 mb-6">
          {tips.map((tip, index) => (
            <div key={index} className="flex gap-3 text-gray-400">
              <CheckCircle2 className="h-5 w-5 text-[#00D98B] shrink-0" />
              <p className="text-sm">{tip}</p>
            </div>
          ))}
        </div>

        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 p-0 h-auto text-[#00D98B] hover:text-[#00D98B]/80 hover:bg-transparent"
        >
          <FileText className="h-5 w-5" />
          <span className="font-medium">View Documentation</span>
        </Button>
      </CardContent>
    </Card>
  )
}
