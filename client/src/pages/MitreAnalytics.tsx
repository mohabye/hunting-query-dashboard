import { useState, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, Target, Shield } from 'lucide-react';

const MITRE_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

export default function MitreAnalytics() {
  const { isAuthenticated } = useAuth();
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);

  const { data: queriesData, isLoading } = trpc.queries.list.useQuery(
    { category: undefined },
    { enabled: isAuthenticated }
  );

  // Calculate MITRE coverage statistics
  const mitreStats = useMemo(() => {
    if (!queriesData) return { techniques: [], procedures: [], coverage: 0 };

    const techniqueMap = new Map<string, { id: string; name: string; count: number; queries: any[] }>();
    const procedureMap = new Map<string, { name: string; count: number }>();

    queriesData.forEach(query => {
      // Track techniques
      const techKey = `${query.techniqueId}-${query.techniqueName}`;
      if (!techniqueMap.has(techKey)) {
        techniqueMap.set(techKey, {
          id: query.techniqueId,
          name: query.techniqueName,
          count: 0,
          queries: [],
        });
      }
      const tech = techniqueMap.get(techKey)!;
      tech.count++;
      tech.queries.push(query);

      // Track procedures
      if (query.procedure) {
        if (!procedureMap.has(query.procedure)) {
          procedureMap.set(query.procedure, { name: query.procedure, count: 0 });
        }
        procedureMap.get(query.procedure)!.count++;
      }
    });

    return {
      techniques: Array.from(techniqueMap.values()).sort((a, b) => b.count - a.count),
      procedures: Array.from(procedureMap.values()).sort((a, b) => b.count - a.count),
      coverage: techniqueMap.size,
    };
  }, [queriesData]);

  // Calculate creation method statistics
  const creationStats = useMemo(() => {
    if (!queriesData) return [];

    const aiCount = queriesData.filter(q => q.name.includes('AI')).length;
    const manualCount = queriesData.length - aiCount;

    return [
      { name: 'Manual', value: manualCount, fill: '#4ECDC4' },
      { name: 'AI-Generated', value: aiCount, fill: '#FF6B6B' },
    ];
  }, [queriesData]);

  // Calculate threat level distribution
  const threatStats = useMemo(() => {
    if (!queriesData) return [];

    const threatMap = new Map<string, number>();
    queriesData.forEach(q => {
      threatMap.set(q.threatLevel, (threatMap.get(q.threatLevel) || 0) + 1);
    });

    return [
      { name: 'Critical', value: threatMap.get('critical') || 0, fill: '#FF6B6B' },
      { name: 'High', value: threatMap.get('high') || 0, fill: '#FFA07A' },
      { name: 'Medium', value: threatMap.get('medium') || 0, fill: '#F7DC6F' },
      { name: 'Low', value: threatMap.get('low') || 0, fill: '#4ECDC4' },
    ];
  }, [queriesData]);

  if (!isAuthenticated) {
    return <div>Please log in to view analytics</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-amber-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Shield size={16} className="text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queriesData?.length || 0}</div>
            <p className="text-xs text-slate-500">Threat hunting queries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MITRE Coverage</CardTitle>
            <Target size={16} className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mitreStats.coverage}</div>
            <p className="text-xs text-slate-500">Unique techniques covered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Procedures</CardTitle>
            <TrendingUp size={16} className="text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mitreStats.procedures.length}</div>
            <p className="text-xs text-slate-500">Tactics covered</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="techniques" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="techniques">Techniques</TabsTrigger>
          <TabsTrigger value="creation">Creation Method</TabsTrigger>
          <TabsTrigger value="threats">Threat Levels</TabsTrigger>
        </TabsList>

        {/* Techniques Tab */}
        <TabsContent value="techniques">
          <Card>
            <CardHeader>
              <CardTitle>MITRE ATT&CK Technique Coverage</CardTitle>
              <CardDescription>Top techniques covered by your queries</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mitreStats.techniques.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4ECDC4" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-2">
                <h3 className="font-semibold text-sm">All Techniques</h3>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {mitreStats.techniques.map(tech => (
                    <div
                      key={tech.id}
                      onClick={() => setSelectedTechnique(tech.id)}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        selectedTechnique === tech.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-slate-50 border-slate-200 hover:border-blue-200'
                      }`}
                    >
                      <p className="font-mono text-sm font-bold">{tech.id}</p>
                      <p className="text-xs text-slate-600">{tech.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{tech.count} queries</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Creation Method Tab */}
        <TabsContent value="creation">
          <Card>
            <CardHeader>
              <CardTitle>Query Creation Method</CardTitle>
              <CardDescription>Manual vs AI-generated queries</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={creationStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {creationStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threat Levels Tab */}
        <TabsContent value="threats">
          <Card>
            <CardHeader>
              <CardTitle>Threat Level Distribution</CardTitle>
              <CardDescription>Queries by threat severity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={threatStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {threatStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Procedures Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Procedures (Tactics) Coverage</CardTitle>
          <CardDescription>MITRE ATT&CK tactics covered by your queries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mitreStats.procedures.map((proc, index) => (
              <div key={proc.name} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div
                  className="w-3 h-3 rounded-full mb-2"
                  style={{ backgroundColor: MITRE_COLORS[index % MITRE_COLORS.length] }}
                />
                <p className="font-semibold text-sm">{proc.name}</p>
                <p className="text-xs text-slate-600 mt-1">{proc.count} queries</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
