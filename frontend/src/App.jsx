import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAgentStore } from './store/agentStore';
import Dashboard from './pages/Dashboard';
import AgentDetail from './pages/AgentDetail';

function AppRoutes() {
  const fetchStatuses = useAgentStore((s) => s.fetchStatuses);

  useEffect(() => {
    fetchStatuses();
    const id = setInterval(fetchStatuses, 5000);
    return () => clearInterval(id);
  }, [fetchStatuses]);

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/agent/:name" element={<AgentDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
