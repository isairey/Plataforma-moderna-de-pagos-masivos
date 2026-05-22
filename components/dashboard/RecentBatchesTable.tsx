"use client"

import Link from "next/link"
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface BatchRecord {
  id: string
  recipients: number
  amount: string
  status: "Completed" | "Processing" | "Failed"
  timestamp: string
}

const defaultBatches: BatchRecord[] = [
  {
    id: "#BP-2024-001",
    recipients: 147,
    amount: "$12,450.00",
    status: "Completed",
    timestamp: "2 hours ago",
  },
  {
    id: "#BP-2024-002",
    recipients: 89,
    amount: "$8,920.50",
    status: "Processing",
    timestamp: "4 hours ago",
  },
  {
    id: "#BP-2024-003",
    recipients: 203,
    amount: "$15,780.25",
    status: "Completed",
    timestamp: "1 day ago",
  },
  {
    id: "#BP-2024-004",
    recipients: 156,
    amount: "$22,340.75",
    status: "Failed",
    timestamp: "2 days ago",
  },
]

interface RecentBatchesTableProps {
  batches?: BatchRecord[]
  className?: string
}

export function RecentBatchesTable({
  batches = defaultBatches,
  className,
}: RecentBatchesTableProps) {
  return (
    <Card className={cn("border-[#1F2937] bg-[#121827] shadow-lg", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Batches</h2>
          <Button asChild variant="link" className="text-[#00D98B] hover:text-[#00D98B]/80 text-sm p-0">
            <Link href="/dashboard/history">View All</Link>
          </Button>
        </div>
        
        <div className="hidden md:block overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-medium text-gray-500 border-b border-[#1F2937]">
                <th className="pb-4 font-semibold uppercase tracking-wider">Batch ID</th>
                <th className="pb-4 font-semibold uppercase tracking-wider">Recipients</th>
                <th className="pb-4 font-semibold uppercase tracking-wider">Amount</th>
                <th className="pb-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="pb-4 font-semibold uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {batches.map((batch) => (
                <tr 
                  key={batch.id} 
                  className="border-b border-[#1F2937]/50 hover:bg-white/[0.02] transition-colors cursor-default"
                >
                  <td className="py-5 font-medium text-gray-300 whitespace-nowrap">{batch.id}</td>
                  <td className="py-5 text-gray-400">{batch.recipients}</td>
                  <td className="py-5 font-bold text-white text-base">{batch.amount}</td>
                  <td className="py-5">
                    <StatusBadge status={batch.status} />
                  </td>
                  <td className="py-5 text-gray-500 whitespace-nowrap">{batch.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View - List */}
        <div className="flex flex-col gap-4 md:hidden">
          {batches.map((batch) => (
            <div 
              key={batch.id} 
              className="flex flex-col p-4 rounded-xl border border-[#1F2937] bg-[#1F293780]/20 gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-300">{batch.id}</span>
                <StatusBadge status={batch.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs uppercase tracking-wider">Recipients</span>
                  <span className="text-white font-medium">{batch.recipients}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-gray-500 text-xs uppercase tracking-wider">Amount</span>
                  <span className="text-white font-bold">{batch.amount}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 border-t border-[#1F2937] pt-2">
                Created {batch.timestamp}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: BatchRecord["status"] }) {
  const configs = {
    Completed: {
      color: "bg-green-500/10 text-green-400 border-green-500/20",
      icon: CheckCircle2,
      label: "Completed"
    },
    Processing: {
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      icon: Clock,
      label: "Processing"
    },
    Failed: {
      color: "bg-red-500/10 text-red-400 border-red-500/20",
      icon: AlertTriangle,
      label: "Failed"
    }
  }

  const config = configs[status]
  const Icon = config.icon

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 border w-fit",
        config.color
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  )
}
