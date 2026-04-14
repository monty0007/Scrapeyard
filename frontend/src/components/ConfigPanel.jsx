export default function ConfigPanel({ agent, config, onChange }) {
  if (!agent) return null;
  const fields = agent.configFields ?? [];
  const set = (key, val) => onChange({ ...config, [key]: val });

  return (
    <div className="glass border border-white/10 rounded-2xl h-full overflow-y-auto flex flex-col gap-5 p-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-cyan-400 to-teal-400" />
        <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">Configuration</h3>
      </div>

      {fields.includes('url') && (
        <Field label="Target URL" icon="🌐">
          <input
            type="url"
            value={config.url ?? ''}
            placeholder="https://example.com"
            onChange={(e) => set('url', e.target.value)}
            className="input-glass"
          />
        </Field>
      )}

      {fields.includes('selector') && (
        <Field label="CSS Selector / XPath" icon="🎯">
          <input
            type="text"
            value={config.selector ?? ''}
            placeholder="div.content or //h1"
            onChange={(e) => set('selector', e.target.value)}
            className="input-glass"
          />
        </Field>
      )}

      {fields.includes('prompt') && (
        <Field label="Prompt" icon="💬">
          <textarea
            rows={4}
            value={config.prompt ?? ''}
            placeholder="Describe the research task…"
            onChange={(e) => set('prompt', e.target.value)}
            className="input-glass resize-none"
          />
        </Field>
      )}

      {fields.includes('headless') && (
        <Field label="Headless Mode" icon="👻">
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="relative">
              <input
                type="checkbox"
                checked={config.headless ?? true}
                onChange={(e) => set('headless', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 rounded-full bg-white/10 border border-white/15 peer-checked:bg-indigo-500/60 peer-checked:border-indigo-400/50 transition-all" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40 peer-checked:translate-x-4 peer-checked:bg-white transition-all" />
            </div>
            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
              Run browser headlessly
            </span>
          </label>
        </Field>
      )}

      {fields.includes('timeout') && (
        <Field label="Timeout (seconds)" icon="⏱">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1} max={120}
              value={config.timeout ?? 30}
              onChange={(e) => set('timeout', Number(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
            <span className="text-sm text-slate-300 w-8 text-right tabular-nums">{config.timeout ?? 30}s</span>
          </div>
        </Field>
      )}

      {fields.includes('depth') && (
        <Field label="Crawl Depth" icon="🔑">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1} max={10}
              value={config.depth ?? 2}
              onChange={(e) => set('depth', Number(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
            <span className="text-sm text-slate-300 w-6 text-right tabular-nums">{config.depth ?? 2}</span>
          </div>
        </Field>
      )}

      {fields.includes('apiKey') && (
        <Field label="API Key" icon="🔐">
          <input
            type="password"
            value={config.apiKey ?? ''}
            placeholder="sk-…"
            onChange={(e) => set('apiKey', e.target.value)}
            className="input-glass"
            autoComplete="off"
          />
          <p className="text-[11px] text-slate-600 mt-1">Stored in .env on the backend</p>
        </Field>
      )}
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider">
        {icon && <span className="text-sm leading-none">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}
