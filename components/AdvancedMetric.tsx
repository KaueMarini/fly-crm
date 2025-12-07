'use client';

import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';

interface MetricProps {
  title: string;
  value: string;
  subValue?: string;
  trend?: string;
  trendValue?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  color?: string; // ex: 'blue', 'purple', 'emerald'
}

export function AdvancedMetric({ 
  title, value, subValue, trend, trendValue, isPositive = true, icon, color = 'blue' 
}: MetricProps) {
  
  // Mapas de cores para gradientes e sombras
  const colorMap: any = {
    blue: 'from-blue-500/20 to-blue-600/5 text-blue-500 border-blue-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-500 border-purple-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-500 border-emerald-500/20',
    orange: 'from-orange-500/20 to-orange-600/5 text-orange-500 border-orange-500/20',
    pink: 'from-pink-500/20 to-pink-600/5 text-pink-500 border-pink-500/20',
  };

  const activeColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
      
      {/* Background Glow */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${activeColor.split(' ')[0]} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-2.5 rounded-xl border bg-slate-950/50 ${activeColor.split(' ').slice(1).join(' ')}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendValue}
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl xl:text-3xl font-bold text-white tracking-tight">{value}</span>
          {subValue && <span className="text-sm text-slate-500 font-medium">{subValue}</span>}
        </div>
        {trend && <p className="text-slate-500 text-xs mt-2">{trend}</p>}
      </div>
    </div>
  );
}