import { Procedure, Query, DataSource } from '@/lib/types';
import QueryCard from './QueryCard';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ProcedureSectionProps {
  procedure: Procedure;
  queries: Query[];
  dataSources: DataSource[];
}

export default function ProcedureSection({ procedure, queries, dataSources }: ProcedureSectionProps) {
  const [expanded, setExpanded] = useState(true);

  const procedureQueries = queries.filter(q => procedure.queries.includes(q.id));
  const criticalCount = procedureQueries.filter(q => q.threat_level === 'critical').length;
  const highCount = procedureQueries.filter(q => q.threat_level === 'high').length;

  return (
    <div className="procedure-section">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-mono font-bold text-lg text-amber-300">
              {procedure.mitre_id}
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {procedure.name}
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-2">{procedure.mitre_name}</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {procedure.tactics.map(tactic => (
              <span key={tactic} className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded border border-slate-600/50">
                {tactic}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">
              {procedureQueries.length} queries
            </span>
            {criticalCount > 0 && (
              <span className="text-red-400">
                {criticalCount} critical
              </span>
            )}
            {highCount > 0 && (
              <span className="text-orange-400">
                {highCount} high
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`flex-shrink-0 text-amber-300 transition-transform duration-300 mt-1 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="mt-4 space-y-3 animate-in fade-in duration-300">
          {procedureQueries.length > 0 ? (
            procedureQueries.map(query => (
              <QueryCard
                key={query.id}
                query={query}
                dataSources={dataSources}
                procedure={procedure}
              />
            ))
          ) : (
            <div className="text-center py-4 text-slate-400">
              No queries found for this procedure
            </div>
          )}
        </div>
      )}
    </div>
  );
}
