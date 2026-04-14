import { useNavigate } from 'react-router-dom';
import StatusBadge, { CategoryBadge } from './StatusBadge';
import { CATEGORY_COLORS } from '../data/agents';

const GLOW_MAP = {
  Scraping:   'hover:shadow-[0_0_40px_rgba(6,182,212,0.22)] hover:border-cyan-500/40',
  Browser:    'hover:shadow-[0_0_40px_rgba(20,184,166,0.22)] hover:border-teal-500/40',
  Automation: 'hover:shadow-[0_0_40px_rgba(52,211,153,0.22)] hover:border-emerald-500/40',
  'AI Agent': 'hover:shadow-[0_0_40px_rgba(251,191,36,0.22)] hover:border-amber-500/40',
};

const ICON_BG_MAP = {
  Scraping:   'bg-cyan-500/10 border-cyan-500/20',
  Browser:    'bg-teal-500/10 border-teal-500/20',
  Automation: 'bg-emerald-500/10 border-emerald-500/20',
  'AI Agent': 'bg-amber-500/10 border-amber-500/20',
};

export default function AgentCard({ agent, status = 'idle', installed = false }) {
  const navigate = useNavigate();
  const glow = GLOW_MAP[agent.category] ?? '';
  const iconBg = ICON_BG_MAP[agent.category] ?? 'bg-white/5 border-white/10';

  return (
    <div
      onClick={() => navigate(`/agent/${agent.id}`)}
      className={`
        group relative flex flex-col gap-4 p-5 rounded-2xl cursor-pointer
        glass border border-white/10
        transition-all duration-300
        ${glow}
        hover:-translate-y-0.5
      `}
    >
      {/* Top shimmer line on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />

      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Icon tile */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl leading-none border ${iconBg} shrink-0`}>
            {agent.icon}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-100 group-hover:text-white transition-colors leading-tight">
              {agent.name}
            </h3>
            <span className="text-xs text-slate-500 font-semibold">{agent.language}</span>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 flex-1">
        {agent.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <CategoryBadge category={agent.category} />
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/agent/${agent.id}`); }}
          className="text-sm px-4 py-1.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-lg transition-all duration-200 active:scale-95"
        >
          Launch →
        </button>
      </div>

      {/* Not installed warning */}
      {!installed && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400/60 border-t border-white/5 pt-2.5 -mb-1">
          <span>⚠</span>
          <span>Not installed — dependencies missing</span>
        </div>
      )}
    </div>
  );
}
