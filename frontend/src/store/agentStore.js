import { create } from 'zustand';
import { AGENTS } from '../data/agents';
import * as agentApi from '../api/agentApi';

const initialStatuses = Object.fromEntries(
  AGENTS.map((a) => [a.id, { status: 'idle', logs: [], installed: false }])
);

export const useAgentStore = create((set, get) => ({
  agents: AGENTS,
  statuses: initialStatuses,

  setStatus: (agentId, status) =>
    set((state) => ({
      statuses: {
        ...state.statuses,
        [agentId]: { ...state.statuses[agentId], status },
      },
    })),

  appendLog: (agentId, line) =>
    set((state) => ({
      statuses: {
        ...state.statuses,
        [agentId]: {
          ...state.statuses[agentId],
          logs: [...(state.statuses[agentId]?.logs ?? []), line],
        },
      },
    })),

  clearLogs: (agentId) =>
    set((state) => ({
      statuses: {
        ...state.statuses,
        [agentId]: { ...state.statuses[agentId], logs: [] },
      },
    })),

  setInstalled: (agentId, installed) =>
    set((state) => ({
      statuses: {
        ...state.statuses,
        [agentId]: { ...state.statuses[agentId], installed },
      },
    })),

  runAgent: async (agentId, config, script) => {
    const { setStatus, appendLog } = get();
    setStatus(agentId, 'running');
    try {
      await agentApi.runAgent(agentId, config, script);
    } catch (err) {
      appendLog(agentId, `[error] ${err.message}`);
      setStatus(agentId, 'error');
    }
  },

  stopAgent: async (agentId) => {
    const { setStatus } = get();
    try {
      await agentApi.stopAgent(agentId);
      setStatus(agentId, 'idle');
    } catch (err) {
      console.error(err);
    }
  },

  fetchStatuses: async () => {
    try {
      const data = await agentApi.listAgents();
      data.forEach(({ id, status, installed }) => {
        set((state) => ({
          statuses: {
            ...state.statuses,
            [id]: { ...state.statuses[id], status, installed },
          },
        }));
      });
    } catch (_) {
      // backend not yet connected — keep mock states
    }
  },

  installAgent: async (agentId) => {
    const { appendLog, fetchStatuses } = get();
    appendLog(agentId, { ts: new Date().toLocaleTimeString(), text: '[info] Installing dependencies…' });
    try {
      const result = await agentApi.installAgent(agentId);
      if (result.output) {
        result.output
          .split('\n')
          .filter(Boolean)
          .slice(0, 80)
          .forEach((line) =>
            appendLog(agentId, { ts: new Date().toLocaleTimeString(), text: line })
          );
      }
      appendLog(agentId, { ts: new Date().toLocaleTimeString(), text: '[done] Dependencies installed successfully.' });
      await fetchStatuses();
    } catch (err) {
      appendLog(agentId, { ts: new Date().toLocaleTimeString(), text: `[error] Install failed: ${err.message}` });
      throw err;
    }
  },
}));
