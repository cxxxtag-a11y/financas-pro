import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  type?: 'default' | 'income' | 'expense' | 'credit';
  subtitle?: string;
  delay?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, type = 'default', subtitle, delay = 'delay-0' }) => {
  const colorClass = type === 'income' ? 'text-emerald-400' : type === 'expense' ? 'text-red-400' : type === 'credit' ? 'text-purple-400' : 'text-blue-400';
  const bgClass = type === 'income' ? 'bg-emerald-500/10' : type === 'expense' ? 'bg-red-500/10' : type === 'credit' ? 'bg-purple-500/10' : 'bg-blue-500/10';

  return (
    <div className={`glass-panel p-6 rounded-2xl hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1 anim-enter ${delay}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
          <h3 className={`text-2xl font-bold ${colorClass} tracking-tight`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bgClass} ${colorClass} backdrop-blur-sm shadow-inner`}>
          <Icon size={22} />
        </div>
      </div>
      {subtitle && (
        <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div> {subtitle}
        </div>
      )}
    </div>
  );
};
