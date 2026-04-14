import { CATEGORY_COLORS } from '../data/agents';

export default function StatusBadge({ status }) {
  const map = {
    idle: {
      label: 'Idle',
      cls: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
      dot: 'bg-slate-500',
    },
    running: {
      label: 'Running',
      cls: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/25',
      dot: 'bg-emerald-400 animate-pulse-dot shadow-[0_0_6px_rgba(52,211,153,0.8)]',
    },
    error: {
      label: 'Error',
      cls: 'text-red-400 bg-red-400/10 border-red-400/25',
      dot: 'bg-red-400',
    },
  };
  const { label, cls, dot } = map[status] ?? map.idle;

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${cls}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {label}
    </span>
  );
}

export function CategoryBadge({ category }) {
  const colors = {
    Scraping:   'text-blue-300 bg-blue-500/10 border-blue-500/25',
    Browser:    'text-purple-300 bg-purple-500/10 border-purple-500/25',
    Automation: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
    'AI Agent': 'text-amber-300 bg-amber-500/10 border-amber-500/25',
  };
  const cls = colors[category] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cls}`}>
      {category}
    </span>
  );
}
