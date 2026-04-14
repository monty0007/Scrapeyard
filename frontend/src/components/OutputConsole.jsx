import { useRef, useEffect } from 'react';

export default function OutputConsole({ logs = [], onClear }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs.map((l) => `${l.ts}  ${l.text}`).join('\n'));
  };

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden glass-dark border border-white/10 shadow-2xl">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          {/* macOS-style dots */}
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-amber-400/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
          <span className="ml-2 text-[11px] font-semibold text-slate-600 uppercase tracking-widest">Output</span>
        </div>
        <div className="flex gap-1.5">
          <Btn onClick={handleCopy}>Copy</Btn>
          <Btn onClick={onClear}>Clear</Btn>
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 leading-relaxed">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-700">
            <span className="text-3xl opacity-40">▶</span>
            <p className="italic">No output yet. Run the agent to see logs here.</p>
          </div>
        ) : (
          logs.map((line, i) => (
            <div key={i} className="flex gap-3 group">
              <span className="text-slate-700 shrink-0 select-none pt-px">{line.ts}</span>
              <span className={lineColor(line.text)}>
                {highlight(line.text)}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function Btn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/8 border border-white/10"
    >
      {children}
    </button>
  );
}

function lineColor(text) {
  if (text.includes('[error]') || text.includes('Error') || text.includes('error')) return 'text-red-400';
  if (text.includes('[warn]') || text.includes('Warning')) return 'text-amber-400';
  if (text.includes('[info]')) return 'text-indigo-300';
  if (text.startsWith('[done]')) return 'text-emerald-400';
  return 'text-slate-400';
}

function highlight(text) {
  // Bold anything in brackets like [info]
  return text.replace(/\[(info|error|warn|done)\]/g, (m) => m);
}
