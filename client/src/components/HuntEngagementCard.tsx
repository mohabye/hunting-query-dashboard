import { HuntEngagement, Procedure } from '@/lib/types';
import { getStatusBgColor, getStatusColor, getThreatBgColor, getThreatLabel, formatDate } from '@/lib/utils';

interface HuntEngagementCardProps {
  engagement: HuntEngagement;
  procedures: Procedure[];
}

export default function HuntEngagementCard({ engagement, procedures }: HuntEngagementCardProps) {
  const relatedProcedures = procedures.filter(p => engagement.procedures_covered.includes(p.id));

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/20">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-mono font-bold text-lg text-slate-100">
            {engagement.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            ID: <span className="text-amber-400">{engagement.id}</span>
          </p>
        </div>
        <div className={`threat-badge ${getThreatBgColor(engagement.severity)}`}>
          {getThreatLabel(engagement.severity)}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-mono border ${getStatusBgColor(engagement.status)}`}>
          <span className={getStatusColor(engagement.status)}>
            {engagement.status.toUpperCase()}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="bg-slate-700/20 p-2 rounded border border-slate-700/50">
          <p className="text-slate-400">Start Date</p>
          <p className="text-slate-200 font-mono">{formatDate(engagement.start_date)}</p>
        </div>
        <div className="bg-slate-700/20 p-2 rounded border border-slate-700/50">
          <p className="text-slate-400">End Date</p>
          <p className="text-slate-200 font-mono">
            {engagement.end_date ? formatDate(engagement.end_date) : 'Ongoing'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="bg-slate-700/20 p-2 rounded border border-slate-700/50">
          <p className="text-slate-400">Queries</p>
          <p className="text-amber-300 font-mono text-lg">{engagement.total_queries}</p>
        </div>
        <div className="bg-slate-700/20 p-2 rounded border border-slate-700/50">
          <p className="text-slate-400">Detections</p>
          <p className="text-green-400 font-mono text-lg">{engagement.detections_found}</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-400 mb-2">PROCEDURES COVERED:</p>
        <div className="flex flex-wrap gap-2">
          {relatedProcedures.map(proc => (
            <span key={proc.id} className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded border border-slate-600/50">
              {proc.mitre_id}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
