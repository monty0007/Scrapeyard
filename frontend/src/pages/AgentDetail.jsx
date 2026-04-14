import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgentStore } from '../store/agentStore';
import ScriptEditor from '../components/ScriptEditor';
import OutputConsole from '../components/OutputConsole';
import ConfigPanel from '../components/ConfigPanel';
import StatusBadge, { CategoryBadge } from '../components/StatusBadge';
import * as agentApi from '../api/agentApi';

export default function AgentDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { agents, statuses, runAgent, stopAgent, appendLog, clearLogs, installAgent } = useAgentStore();

  const agent = agents.find((a) => a.id === name);
  const agentStatus = statuses[agent?.id] ?? { status: 'idle', logs: [] };

  const [script, setScript] = useState(agent?.template ?? '');
  const [config, setConfig] = useState({
    url: 'https://example.com',
    headless: true,
    timeout: 30,
    depth: 2,
  });
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (agentStatus.status !== 'running') return;
    const cleanup = agentApi.streamLogs(
      agent.id,
      (line) => appendLog(agent.id, { ts: new Date().toLocaleTimeString(), text: line }),
      () => {}
    );
    return cleanup;
  }, [agentStatus.status, agent?.id]);

  const handleRun = useCallback(async () => {
    if (!agent) return;
    clearLogs(agent.id);
    appendLog(agent.id, { ts: new Date().toLocaleTimeString(), text: '[info] Starting agent…' });
    await runAgent(agent.id, config, script);
  }, [agent, config, script]);

  const handleStop = useCallback(async () => {
    if (!agent) return;
    await stopAgent(agent.id);
    appendLog(agent.id, { ts: new Date().toLocaleTimeString(), text: '[info] Agent stopped.' });
  }, [agent]);

  const handleInstall = useCallback(async () => {
    if (!agent || installing) return;
    setInstalling(true);
    try {
      await installAgent(agent.id);
    } finally {
      setInstalling(false);
    }
  }, [agent, installing, installAgent]);

  if (!agent) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="bg-mesh" aria-hidden="true" />
        <div className="relative z-10 glass border border-white/10 rounded-2xl p-10 text-center flex flex-col gap-4">
          <span className="text-5xl">❓</span>
          <p className="text-slate-400">Agent not found: <code className="text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">{name}</code></p>
          <button onClick={() => navigate('/')} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isRunning = agentStatus.status === 'running';

  return (
    <div className="relative min-h-screen">
      <div className="bg-mesh" aria-hidden="true">
        <div className="bg-orb-cyan" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ── Navbar ── */}
        <header className="sticky top-0 z-30 glass border border-white/10 border-x-0 border-t-0">
          <div className="w-full px-6 h-16 flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors glass border border-white/10 px-3 py-2 rounded-xl font-semibold"
            >
              ← Dashboard
            </button>

            <div className="w-px h-5 bg-white/10" />

            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl leading-none shrink-0">{agent.icon}</span>
              <h1 className="text-xl font-black text-slate-100 truncate">{agent.name}</h1>
              <CategoryBadge category={agent.category} />
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <StatusBadge status={agentStatus.status} />

              {/* Install deps */}
              {!agentStatus.installed && !isRunning && (
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {installing ? '⏳ Installing…' : '📦 Install Deps'}
                </button>
              )}
              {agentStatus.installed && (
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Installed
                </span>
              )}

              {/* Run / Stop */}
              {!isRunning ? (
                <button
                  onClick={handleRun}
                  className="flex items-center gap-2 text-sm px-5 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-lg transition-all duration-200 active:scale-95"
                >
                  ▶&nbsp;Run
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-2 text-sm px-5 py-2 rounded-xl font-bold text-red-300 bg-red-500/10 border border-red-500/30 hover:bg-red-500/15 transition-all duration-200 active:scale-95"
                >
                  ■&nbsp;Stop
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ── 3-column layout ── */}
        <div
          className="flex-1 w-full px-6 py-5 grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-4"
          style={{ height: 'calc(100vh - 4rem)', overflow: 'hidden' }}
        >
          {/* LEFT — Config */}
          <aside className="min-h-0 overflow-y-auto rounded-xl">
            <ConfigPanel agent={agent} config={config} onChange={setConfig} />
          </aside>

          {/* CENTER — Editor */}
          <section className="flex flex-col gap-3 min-h-0">
            {/* Description bar */}
            <div className="glass border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-3 shrink-0">
              <span className="text-xs text-slate-500 flex-1 truncate">{agent.description}</span>
              {isRunning && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-300 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                  Running…
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <ScriptEditor
                value={script}
                onChange={setScript}
                language={agent.templateLang ?? 'python'}
              />
            </div>
          </section>

          {/* RIGHT — Console */}
          <aside className="flex flex-col min-h-0">
            <OutputConsole logs={agentStatus.logs} onClear={() => clearLogs(agent.id)} />
          </aside>
        </div>
      </div>
    </div>
  );
}
