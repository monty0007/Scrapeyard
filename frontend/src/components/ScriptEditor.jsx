import Editor from '@monaco-editor/react';

const LANG_LABELS = { python: 'Python', javascript: 'JavaScript' };
const LANG_COLORS = {
  python:     'text-blue-300 bg-blue-500/10 border-blue-500/20',
  javascript: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
};

export default function ScriptEditor({ value, onChange, language = 'python' }) {
  const langColor = LANG_COLORS[language] ?? 'text-slate-400 bg-white/5 border-white/10';

  return (
    <div className="flex flex-col h-full bg-[#0d0f1a]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">Script</span>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${langColor}`}>
          {LANG_LABELS[language] ?? language}
        </span>
      </div>

      {/* Monaco */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={onChange}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: '"Cascadia Code", "Fira Code", ui-monospace, Consolas, monospace',
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            wordWrap: 'on',
            tabSize: 4,
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'gutter',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            bracketPairColorization: { enabled: true },
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>
    </div>
  );
}
