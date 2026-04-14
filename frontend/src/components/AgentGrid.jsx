import AgentCard from './AgentCard';

export default function AgentGrid({ agents, statuses }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          status={statuses[agent.id]?.status ?? 'idle'}
          installed={statuses[agent.id]?.installed ?? false}
        />
      ))}
    </div>
  );
}
