import { Query, DataSource, Procedure } from '@/lib/types';
import { getThreatBgColor, getThreatLabel, getThreatColor, getDataSourceTypeColor, formatDate } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface QueryCardProps {
  query: Query;
  dataSources: DataSource[];
  procedure: Procedure | undefined;
}

export default function QueryCard({ query, dataSources, procedure }: QueryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const relatedDataSources = dataSources.filter(ds => query.data_sources.includes(ds.id));

  return (
    <div className="query-card group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-mono font-bold text-lg text-slate-100 group-hover:text-amber-300 transition-colors">
            {query.name}
          </h3>
          {procedure && (
            <p className="text-xs text-slate-400 mt-1">
              MITRE: <span className="text-amber-400">{procedure.mitre_id}</span>
            </p>
          )}
        </div>
        <div className={`threat-badge ${getThreatBgColor(query.threat_level)}`}>
          {getThreatLabel(query.threat_level)}
        </div>
      </div>

      <p className="text-sm text-slate-300 mb-3 line-clamp-2">{query.description}</p>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${query.coverage}%` }}
            />
          </div>
          <span className="text-xs font-mono text-slate-400">{query.coverage}%</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
        <span className="px-2 py-1 bg-slate-700/30 rounded border border-slate-600/50">
          {query.detections} detections
        </span>
        <span className="px-2 py-1 bg-slate-700/30 rounded border border-slate-600/50">
          Updated {formatDate(query.last_updated)}
        </span>
        {query.enabled ? (
          <span className="px-2 py-1 bg-green-900/30 rounded border border-green-700/50 text-green-400">
            ACTIVE
          </span>
        ) : (
          <span className="px-2 py-1 bg-slate-900/30 rounded border border-slate-700/50 text-slate-400">
            DISABLED
          </span>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-amber-300 transition-colors py-2 border-t border-slate-700/50"
      >
        <span>{expanded ? 'Hide Details' : 'Show Details'}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-3 animate-in fade-in duration-300">
          <div>
            <p className="text-xs font-mono text-slate-400 mb-2">QUERY SYNTAX:</p>
            <code className="block text-xs bg-slate-900/50 p-2 rounded border border-slate-700/50 text-slate-300 overflow-x-auto">
              {query.query_syntax}
            </code>
          </div>

          <div>
            <p className="text-xs font-mono text-slate-400 mb-2">EVENT IDS:</p>
            <div className="flex flex-wrap gap-2">
              {query.event_ids.map(id => (
                <span key={id} className="px-2 py-1 bg-slate-700/30 rounded text-xs font-mono text-slate-300 border border-slate-600/50">
                  {id}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-mono text-slate-400 mb-2">DATA SOURCES:</p>
            <div className="space-y-2">
              {relatedDataSources.map(ds => (
                <div key={ds.id} className="text-xs">
                  <div className={`data-source-tag ${getDataSourceTypeColor(ds.type)}`}>
                    {ds.type}
                  </div>
                  <p className="text-slate-400 mt-1">{ds.name}</p>
                  <p className="text-slate-500 text-xs">{ds.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
