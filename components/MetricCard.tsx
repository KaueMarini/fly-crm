import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricProps {
  title: string;
  value: string;
  trend: string;
  isPositive?: boolean;
}

export function MetricCard({ title, value, trend, isPositive = true }: MetricProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-all">
      <h3 className="text-slate-400 text-sm font-medium mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-white">{value}</span>
        <div className={`flex items-center text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{trend}</span>
        </div>
      </div>
    </div>
  );
}