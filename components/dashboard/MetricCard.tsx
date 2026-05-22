import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  iconBgColor?: string;
  iconColor?: string;
}

export function MetricCard({
  icon: Icon,
  title,
  value,
  iconBgColor = "bg-emerald-500/10",
  iconColor = "text-emerald-500",
}: MetricCardProps) {
  return (
    <Card className="bg-slate-900/50 border-slate-800 p-6">
      <div className="flex flex-col gap-4">
        <div
          className={`w-12 h-12 rounded-lg ${iconBgColor} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}
