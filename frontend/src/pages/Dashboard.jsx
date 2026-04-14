import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentStore } from '../store/agentStore';
import { CATEGORIES } from '../data/agents';
import AgentGrid from '../components/AgentGrid';

const CATEGORIES_LIST = Object.values(CATEGORIES);

const CATEGORY_ICONS = {
  Scraping:   '🕷',
  Browser:    '🌐',
  Automation: '⚙️',
  'AI Agent': '🤖',
};

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { agents, statuses } = useAgentStore();
  const navigate = useNavigate();

  const runningAgents   = agents.filter((a) => statuses[a.id]?.status === 'running');
  const installedAgents = agents.filter((a) => statuses[a.id]?.installed);

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      const matchCat = activeCategory === 'All' || a.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [agents, search, activeCategory]);

  const installed = filtered.filter((a) => statuses[a.id]?.installed);
  const available  = filtered.filter((a) => !statuses[a.id]?.installed);

  return (
    <div className="relative min-h-screen">
      <div className="bg-mesh" aria-hidden="true">
        <div className="bg-orb-cyan" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ── Navbar ── */}
        <header className="sticky top-0 z-30 glass border border-white/10 border-x-0 border-t-0">
          <div className="w-full px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl glass-heavy border border-cyan-400/20 flex items-center justify-center text-xl leading-none">
                🕸
              </div>
              <span className="font-black text-slate-100 text-lg tracking-tight">
                Agent<span className="gradient-text">Hub</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              {runningAgents.length > 0 && (
                <div className="flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-4 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
                  <span className="text-sm text-emerald-300 font-semibold">
                    {runningAgents.length} running
                  </span>
                </div>
              )}
              <div className="w-px h-5 bg-white/10" />
              <span className="text-sm text-slate-500 font-medium">{agents.length} agents</span>
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <div className="flex-1 w-full px-8 py-8 flex gap-6">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden lg:flex flex-col gap-5 w-60 shrink-0">

            {/* Stats */}
            <div className="glass border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="text-xs font-black text-cyan-400/80 uppercase tracking-widest">Overview</h3>
              <StatRow icon="📦" label="Total" value={agents.length} />
              <StatRow icon="✅" label="Installed" value={installedAgents.length} color="text-emerald-400" />
              {runningAgents.length > 0 && (
                <StatRow icon="▶" label="Running" value={runningAgents.length} color="text-emerald-300" pulse />
              )}
            </div>

            {/* Category nav */}
            <div className="glass border border-white/10 rounded-2xl p-5 flex flex-col gap-1">
              <h3 className="text-xs font-black text-cyan-400/80 uppercase tracking-widest mb-3">Categories</h3>
              <CategoryBtn
                label="All"
                icon="✦"
                active={activeCategory === 'All'}
                count={agents.length}
                onClick={() => setActiveCategory('All')}
              />
              {CATEGORIES_LIST.map((cat) => (
                <CategoryBtn
                  key={cat}
                  label={cat}
                  icon={CATEGORY_ICONS[cat] ?? '•'}
                  active={activeCategory === cat}
                  count={agents.filter((a) => a.category === cat).length}
                  onClick={() => setActiveCategory(cat)}
                />
              ))}
            </div>

            {/* Running now */}
            {runningAgents.length > 0 && (
              <div className="glass border border-white/10 rounded-2xl p-5 flex flex-col gap-2">
                <h3 className="text-xs font-black text-cyan-400/80 uppercase tracking-widest mb-1">Running Now</h3>
                {runningAgents.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => navigate(`/agent/${a.id}`)}
                    className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl bg-emerald-400/10 border border-emerald-400/15 text-emerald-300 hover:bg-emerald-400/20 transition-all text-left w-full font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot shrink-0" />
                    <span className="truncate">{a.name}</span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* ── MAIN ── */}
          <main className="flex-1 min-w-0 flex flex-col gap-7">

            {/* Hero */}
            <div className="flex flex-col gap-2">
              <h1 className="text-5xl font-black tracking-tight">
                <span className="gradient-text">Scraping</span>
                <span className="text-slate-100"> Agent Hub</span>
              </h1>
              <p className="text-slate-400 text-lg">
                Configure, launch, and monitor your scraping and AI agents.
              </p>
            </div>

            {/* Search + mobile category tabs */}
            <div className="flex flex-col gap-3">
              <div className="relative max-w-md">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search agents…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-glass pl-10 w-full"
                />
              </div>

              {/* Mobile-only category tabs */}
              <div className="flex gap-2 flex-wrap lg:hidden">
                {['All', ...CATEGORIES_LIST].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCategory(tab)}
                    className={`text-sm px-4 py-2 rounded-xl font-semibold transition-all ${
                      activeCategory === tab
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                        : 'glass border border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Agent sections */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 gap-4">
                <span className="text-5xl opacity-30">🔍</span>
                <p className="text-slate-500 text-lg font-medium">No agents match your search.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                {installed.length > 0 && (
                  <section className="flex flex-col gap-5">
                    <SectionHeading label="Installed" count={installed.length} color="text-emerald-400" />
                    <AgentGrid agents={installed} statuses={statuses} />
                  </section>
                )}
                {available.length > 0 && (
                  <section className="flex flex-col gap-5">
                    <SectionHeading label="Available to Add" count={available.length} color="text-slate-500" />
                    <AgentGrid agents={available} statuses={statuses} />
                  </section>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, color = 'text-slate-300', pulse = false }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
        <span className="text-base leading-none">{icon}</span>
        {label}
      </div>
      <span className={`text-base font-extrabold tabular-nums flex items-center gap-1.5 ${color}`}>
        {pulse && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />}
        {value}
      </span>
    </div>
  );
}

function CategoryBtn({ label, icon, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-semibold transition-all text-left ${
        active
          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
      }`}
    >
      <span className="text-base leading-none w-5 text-center shrink-0">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      <span className="text-slate-600 tabular-nums text-xs font-bold">{count}</span>
    </button>
  );
}

function SectionHeading({ label, count, color }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className={`text-sm font-black uppercase tracking-widest ${color}`}>{label}</h2>
      <span className="text-sm font-bold text-slate-500 glass border border-white/10 px-2.5 py-0.5 rounded-full">{count}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}
