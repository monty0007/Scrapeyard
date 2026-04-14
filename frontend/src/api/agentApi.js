const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export const listAgents = () => request('/api/agents');

export const runAgent = (name, config, script) =>
  request(`/api/agents/${encodeURIComponent(name)}/run`, {
    method: 'POST',
    body: JSON.stringify({ config, script }),
  });

export const stopAgent = (name) =>
  request(`/api/agents/${encodeURIComponent(name)}/stop`, { method: 'POST' });

export const getStatus = (name) =>
  request(`/api/agents/${encodeURIComponent(name)}/status`);

export const installAgent = (name) =>
  request(`/api/agents/${encodeURIComponent(name)}/install`, { method: 'POST' });

/**
 * Opens an EventSource (SSE) stream for live logs.
 * Returns a cleanup function to close the stream.
 */
export function streamLogs(name, onLine, onError) {
  const es = new EventSource(`${BASE}/api/agents/${encodeURIComponent(name)}/logs`);
  es.onmessage = (e) => onLine(e.data);
  es.onerror = (e) => {
    onError?.(e);
    es.close();
  };
  return () => es.close();
}
