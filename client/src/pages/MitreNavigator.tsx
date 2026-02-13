import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';

const MITRE_TACTICS = [
  "Reconnaissance",
  "Resource Development",
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Defense Evasion",
  "Credential Access",
  "Discovery",
  "Lateral Movement",
  "Collection",
  "Command and Control",
  "Exfiltration",
  "Impact",
];

const MITRE_TECHNIQUES = [
  { id: "T1595", name: "Active Scanning", tactic: "Reconnaissance" },
  { id: "T1592", name: "Gather Victim Host Information", tactic: "Reconnaissance" },
  { id: "T1589", name: "Gather Victim Identity Information", tactic: "Reconnaissance" },
  { id: "T1059", name: "Command and Scripting Interpreter", tactic: "Execution" },
  { id: "T1086", name: "PowerShell", tactic: "Execution" },
  { id: "T1053", name: "Scheduled Task/Job", tactic: "Execution" },
  { id: "T1047", name: "Windows Management Instrumentation", tactic: "Execution" },
  { id: "T1055", name: "Process Injection", tactic: "Privilege Escalation" },
  { id: "T1548", name: "Abuse Elevation Control Mechanism", tactic: "Privilege Escalation" },
  { id: "T1134", name: "Access Token Manipulation", tactic: "Defense Evasion" },
  { id: "T1197", name: "BITS Jobs", tactic: "Defense Evasion" },
  { id: "T1110", name: "Brute Force", tactic: "Credential Access" },
  { id: "T1187", name: "Forced Authentication", tactic: "Credential Access" },
  { id: "T1040", name: "Network Sniffing", tactic: "Credential Access" },
  { id: "T1083", name: "File and Directory Discovery", tactic: "Discovery" },
  { id: "T1135", name: "Network Share Discovery", tactic: "Discovery" },
  { id: "T1570", name: "Lateral Tool Transfer", tactic: "Lateral Movement" },
  { id: "T1123", name: "Audio Capture", tactic: "Collection" },
  { id: "T1119", name: "Automated Exfiltration", tactic: "Exfiltration" },
];

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function MitreNavigator() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTactic, setSelectedTactic] = useState<string | null>(null);
  const { data: queriesData = [] } = trpc.queries.list.useQuery({});

  // Calculate comprehensive TTP coverage
  const calculateCoverage = useMemo(() => {
    const coverageByTactic: Record<string, { count: number; techniques: Set<string> }> = {};
    const coverageByTechnique: Record<string, number> = {};
    const procedureCount: Record<string, number> = {};
    
    // Initialize
    MITRE_TACTICS.forEach(tactic => {
      coverageByTactic[tactic] = { count: 0, techniques: new Set() };
    });

    // Process queries
    queriesData.forEach(query => {
      // Tactic coverage
      if (query.category && coverageByTactic[query.category]) {
        coverageByTactic[query.category].count += 1;
        if (query.techniqueId) {
          coverageByTactic[query.category].techniques.add(query.techniqueId);
        }
      }

      // Technique coverage
      if (query.techniqueId) {
        coverageByTechnique[query.techniqueId] = (coverageByTechnique[query.techniqueId] || 0) + 1;
      }

      // Procedure coverage (based on techniqueName)
      if (query.techniqueName) {
        procedureCount[query.techniqueName] = (procedureCount[query.techniqueName] || 0) + 1;
      }
    });

    return { coverageByTactic, coverageByTechnique, procedureCount };
  }, [queriesData]);

  const { coverageByTactic, coverageByTechnique, procedureCount } = calculateCoverage;

  // Calculate statistics
  const totalQueries = queriesData.length;
  const totalTacticsCovered = Object.values(coverageByTactic).filter(t => t.count > 0).length;
  const totalTechniqueCovered = Object.keys(coverageByTechnique).length;
  const totalProceduresCovered = Object.keys(procedureCount).length;
  const totalTactics = MITRE_TACTICS.length;
  const totalTechniques = MITRE_TECHNIQUES.length;

  // Calculate percentages
  const tacticCoveragePercent = Math.round((totalTacticsCovered / totalTactics) * 100);
  const techniqueCoveragePercent = Math.round((totalTechniqueCovered / totalTechniques) * 100);
  const procedureCoveragePercent = Math.round((totalProceduresCovered / totalProceduresCovered + 1) * 100) || 0;

  // Prepare chart data
  const tacticChartData = MITRE_TACTICS.map(tactic => ({
    name: tactic.substring(0, 12),
    fullName: tactic,
    coverage: coverageByTactic[tactic].count,
    techniques: coverageByTactic[tactic].techniques.size,
  }));

  const techniqueChartData = MITRE_TECHNIQUES
    .filter(tech => !selectedTactic || tech.tactic === selectedTactic)
    .map(tech => ({
      id: tech.id,
      name: tech.name.substring(0, 20),
      fullName: tech.name,
      tactic: tech.tactic,
      coverage: coverageByTechnique[tech.id] || 0,
    }))
    .sort((a, b) => b.coverage - a.coverage);

  const pieData = [
    { name: 'Covered', value: totalTechniqueCovered },
    { name: 'Uncovered', value: totalTechniques - totalTechniqueCovered },
  ];

  const filteredTactics = MITRE_TACTICS.filter(tactic =>
    tactic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">MITRE ATT&CK Coverage Analysis</h1>
          <p className="text-slate-400">Comprehensive TTP (Tactics, Techniques, Procedures) coverage metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 p-6 rounded-lg">
            <p className="text-slate-400 text-sm mb-2">Total Queries</p>
            <p className="text-4xl font-bold text-white">{totalQueries}</p>
            <p className="text-xs text-slate-500 mt-2">Hunting queries created</p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 p-6 rounded-lg">
            <p className="text-blue-200 text-sm mb-2">Tactics Covered</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-blue-100">{totalTacticsCovered}/{totalTactics}</p>
              <p className="text-lg font-semibold text-blue-300">{tacticCoveragePercent}%</p>
            </div>
            <p className="text-xs text-blue-300 mt-2">MITRE tactics with queries</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700 p-6 rounded-lg">
            <p className="text-green-200 text-sm mb-2">Techniques Covered</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-green-100">{totalTechniqueCovered}/{totalTechniques}</p>
              <p className="text-lg font-semibold text-green-300">{techniqueCoveragePercent}%</p>
            </div>
            <p className="text-xs text-green-300 mt-2">MITRE techniques with queries</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700 p-6 rounded-lg">
            <p className="text-purple-200 text-sm mb-2">Procedures Covered</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-purple-100">{totalProceduresCovered}</p>
              <TrendingUp className="text-purple-300" size={20} />
            </div>
            <p className="text-xs text-purple-300 mt-2">Unique technique implementations</p>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="tactics" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
            <TabsTrigger value="tactics" className="text-slate-200">Tactic Coverage</TabsTrigger>
            <TabsTrigger value="techniques" className="text-slate-200">Technique Details</TabsTrigger>
            <TabsTrigger value="overview" className="text-slate-200">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="tactics" className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Coverage by MITRE Tactic</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={tacticChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  formatter={(value, name) => {
                    if (name === 'coverage') return [value, 'Queries'];
                    return [value, 'Techniques'];
                  }}
                />
                <Legend />
                <Bar dataKey="coverage" fill="#3b82f6" name="Queries" />
                <Bar dataKey="techniques" fill="#10b981" name="Techniques" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="techniques" className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Technique Coverage Details</h3>
            
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                  placeholder="Search tactics..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
              <button
                onClick={() => setSelectedTactic(null)}
                className={`px-3 py-2 rounded text-sm font-medium transition ${
                  selectedTactic === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                All Tactics
              </button>
              {filteredTactics.map(tactic => (
                <button
                  key={tactic}
                  onClick={() => setSelectedTactic(tactic)}
                  className={`px-3 py-2 rounded text-sm font-medium transition ${
                    selectedTactic === tactic
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {tactic.substring(0, 15)}
                </button>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={techniqueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="id" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  formatter={(value, name, props) => [value, `${props.payload.id} - ${props.payload.fullName}`]}
                />
                <Bar dataKey="coverage" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="overview" className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Coverage Overview</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Detailed Technique List */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Technique Coverage Matrix</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MITRE_TECHNIQUES.map(technique => {
              const coverage = coverageByTechnique[technique.id] || 0;
              const isCovered = coverage > 0;
              return (
                <div 
                  key={technique.id} 
                  className={`rounded-lg p-4 border-2 transition ${
                    isCovered
                      ? 'bg-green-900 border-green-700'
                      : 'bg-slate-700 border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-mono text-amber-400 font-semibold">{technique.id}</p>
                      <p className={`text-sm ${isCovered ? 'text-green-100' : 'text-slate-300'}`}>{technique.name}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      isCovered ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {coverage > 0 ? `${coverage}Q` : 'None'}
                    </div>
                  </div>
                  <p className={`text-xs ${isCovered ? 'text-green-200' : 'text-slate-400'}`}>{technique.tactic}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
