"use client"

import { Info, ExternalLink, ChevronUp, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface HistoricalBatch {
  id: string
  date: string
  network: "Mainnet" | "Testnet"
  recipients: number
  amount: string
  transactions: string // e.g. "127/127"
  status: "Success" | "Partial" | "Failed"
}

const mockData: HistoricalBatch[] = [
  {
    id: "BP-2024-0247",
    date: "Jan 15, 2024 14:32",
    network: "Mainnet",
    recipients: 127,
    amount: "45,250 XLM",
    transactions: "127/127",
    status: "Success",
  },
  {
    id: "BP-2024-0246",
    date: "Jan 14, 2024 09:15",
    network: "Mainnet",
    recipients: 89,
    amount: "32,100 XLM",
    transactions: "87/89",
    status: "Partial",
  },
  {
    id: "BP-2024-0245",
    date: "Jan 13, 2024 16:45",
    network: "Testnet",
    recipients: 54,
    amount: "18,900 XLM",
    transactions: "54/54",
    status: "Success",
  },
  {
    id: "BP-2024-0244",
    date: "Jan 12, 2024 11:20",
    network: "Mainnet",
    recipients: 203,
    amount: "76,450 XLM",
    transactions: "203/203",
    status: "Success",
  },
  {
    id: "BP-2024-0243",
    date: "Jan 11, 2024 08:50",
    network: "Mainnet",
    recipients: 15,
    amount: "5,250 XLM",
    transactions: "0/15",
    status: "Failed",
  },
  {
    id: "BP-2024-0242",
    date: "Jan 10, 2024 15:30",
    network: "Mainnet",
    recipients: 142,
    amount: "52,800 XLM",
    transactions: "142/142",
    status: "Success",
  },
]

interface HistoryTableProps {
  data?: HistoricalBatch[]
  className?: string
}

export function HistoryTable({
  data = mockData,
  className,
}: HistoryTableProps) {
  return (
    <div className={className}>
      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto overflow-y-hidden">
        <table className="w-full text-left min-w-[1000px]">
          <thead>
            <tr className="text-xs font-semibold text-gray-500 border-b border-[#1F2937]">
              <th className="pb-4 px-4 whitespace-nowrap">
                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-300">
                  Batch ID <ChevronDown className="h-3 w-3" />
                </div>
              </th>
              <th className="pb-4 px-4 whitespace-nowrap">
                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-300">
                  Date Submitted <ChevronDown className="h-3 w-3" />
                </div>
              </th>
              <th className="pb-4 px-4 whitespace-nowrap">Network</th>
              <th className="pb-4 px-4 whitespace-nowrap">Recipients</th>
              <th className="pb-4 px-4 whitespace-nowrap">
                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-300">
                  Total Amount <ChevronDown className="h-3 w-3" />
                </div>
              </th>
              <th className="pb-4 px-4 whitespace-nowrap">Transactions</th>
              <th className="pb-4 px-4 whitespace-nowrap">Status</th>
              <th className="pb-4 px-4 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.map((batch) => (
              <tr key={batch.id} className="border-b border-[#1F2937]/50 hover:bg-white/[0.02] transition-colors">
                <td className="py-5 px-4 font-medium text-gray-300 whitespace-nowrap">{batch.id}</td>
                <td className="py-5 px-4 text-gray-400 whitespace-nowrap">{batch.date}</td>
                <td className="py-5 px-4">
                  <Badge variant="outline" className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] items-center gap-1.5 border-none",
                    batch.network === "Mainnet" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                  )}>
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      batch.network === "Mainnet" ? "bg-blue-400" : "bg-purple-400"
                    )}></div>
                    {batch.network}
                  </Badge>
                </td>
                <td className="py-5 px-4 text-gray-400">{batch.recipients}</td>
                <td className="py-5 px-4 font-bold text-white whitespace-nowrap">{batch.amount}</td>
                <td className="py-5 px-4 text-gray-400 font-mono whitespace-nowrap">{batch.transactions}</td>
                <td className="py-5 px-4">
                  <HistoryStatusBadge status={batch.status} />
                </td>
                <td className="py-5 px-4 text-right">
                  <Button variant="link" className="text-[#00D98B] hover:text-[#00D98B]/80 p-0 h-auto font-medium">
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View - List */}
      <div className="flex flex-col gap-4 md:hidden">
        {data.map((batch) => (
          <div 
            key={batch.id} 
            className="flex flex-col p-5 rounded-2xl border border-[#1F2937] bg-[#121827] gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-200">{batch.id}</span>
              <HistoryStatusBadge status={batch.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Amount</span>
                <span className="text-white font-bold">{batch.amount}</span>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Recipients</span>
                <span className="text-white">{batch.recipients}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Network</span>
                <Badge variant="outline" className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] items-center gap-1.5 border-none w-fit",
                    batch.network === "Mainnet" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                  )}>
                    <div className={cn(
                      "h-1 w-1 rounded-full",
                      batch.network === "Mainnet" ? "bg-blue-400" : "bg-purple-400"
                    )}></div>
                    {batch.network}
                  </Badge>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Progress</span>
                <span className="text-gray-400 font-mono text-xs">{batch.transactions}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1F2937]">
              <span className="text-xs text-gray-500">{batch.date}</span>
              <Button variant="link" className="text-[#00D98B] hover:text-[#00D98B]/80 p-0 h-auto text-xs font-semibold">
                View Details <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HistoryStatusBadge({ status }: { status: HistoricalBatch["status"] }) {
  const configs = {
    Success: {
      color: "bg-green-500/10 text-green-400 border-green-500/20",
      label: "Success"
    },
    Partial: {
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      label: "Partial"
    },
    Failed: {
      color: "bg-red-500/10 text-red-400 border-red-500/20",
      label: "Failed"
    }
  }

  const config = configs[status]

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 border w-fit capitalize",
        config.color
      )}
    >
      <div className={cn(
        "h-1.5 w-1.5 rounded-full",
        status === "Success" ? "bg-green-400" :
        status === "Partial" ? "bg-amber-400" :
        "bg-red-400"
      )}></div>
      {config.label}
    </Badge>
  )
}
