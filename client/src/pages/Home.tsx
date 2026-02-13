import { useState, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Zap, TrendingUp } from 'lucide-react';

const THREAT_COLORS = {
  critical: 'bg-red-900 text-red-100 border-red-700',
  high: 'bg-orange-900 text-orange-100 border-orange-700',
  medium: 'bg-yellow-900 text-yellow-100 border-yellow-700',
  low: 'bg-blue-900 text-blue-100 border-blue-700',
};

const THREAT_BADGE_COLORS = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-600 text-white',
  medium: 'bg-yellow-600 text-white',
  low: 'bg-blue-600 text-white',
};

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [threatFilter, setThreatFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: queries = [], isLoading, refetch } = trpc.queries.list.useQuery({});
  const createMutation = trpc.queries.create.useMutation({
    onSuccess: () => {
      toast.success('Query created successfully!');
      setIsCreateOpen(false);
      setFormData({
        name: '',
        description: '',
        category: 'Execution',
        techniqueId: '',
        techniqueName: '',
        threatLevel: 'high',
        dataSourcesCustom: '',
        eventIdsCustom: '',
      });
      refetch();
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const deleteMutation = trpc.queries.delete.useMutation({
    onSuccess: () => {
      toast.success('Query deleted successfully!');
      refetch();
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Execution',
    techniqueId: '',
    techniqueName: '',
    threatLevel: 'high',
    dataSourcesCustom: '',
    eventIdsCustom: '',
  });

  const filteredQueries = useMemo(() => {
    return queries.filter(q => {
      const matchesSearch = searchQuery === '' ||
        q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.techniqueId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.techniqueName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesThreat = threatFilter === 'all' || q.threatLevel === threatFilter;
      
      return matchesSearch && matchesThreat;
    });
  }, [queries, searchQuery, threatFilter]);

  const handleCreateQuery = () => {
    if (!formData.name || !formData.techniqueId || !formData.techniqueName) {
      toast.error('Please fill in all required fields');
      return;
    }

    createMutation.mutate({
      ...formData,
      threatLevel: formData.threatLevel as any,
      enabled: true,
    });
  };

  const handleDeleteQuery = (id: number) => {
    if (window.confirm('Are you sure you want to delete this query?')) {
      deleteMutation.mutate({ id });
    }
  };

  // Statistics
  const stats = {
    total: queries.length,
    critical: queries.filter(q => q.threatLevel === 'critical').length,
    high: queries.filter(q => q.threatLevel === 'high').length,
    medium: queries.filter(q => q.threatLevel === 'medium').length,
    low: queries.filter(q => q.threatLevel === 'low').length,
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Threat Hunting Dashboard</h1>
              <p className="text-slate-300">Manage and track your security hunting queries</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus size={18} className="mr-2" />
                  Create Query
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Hunting Query</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label className="text-slate-200">Query Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="e.g., PowerShell Execution Detection"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-200">Description *</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Describe what this query hunts for..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-200">Technique ID *</Label>
                      <Input
                        value={formData.techniqueId}
                        onChange={(e) => setFormData({ ...formData, techniqueId: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="e.g., T1086"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Technique Name *</Label>
                      <Input
                        value={formData.techniqueName}
                        onChange={(e) => setFormData({ ...formData, techniqueName: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="e.g., PowerShell"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-200">Tactic</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['Execution', 'Persistence', 'Privilege Escalation', 'Defense Evasion', 'Credential Access', 'Discovery', 'Lateral Movement', 'Collection'].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-200">Threat Level</Label>
                      <Select value={formData.threatLevel} onValueChange={(value) => setFormData({ ...formData, threatLevel: value })}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-200">Data Sources (comma-separated)</Label>
                    <Input
                      value={formData.dataSourcesCustom}
                      onChange={(e) => setFormData({ ...formData, dataSourcesCustom: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="e.g., Sysmon, ETW, Windows Event Log"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-200">Event IDs (comma-separated)</Label>
                    <Input
                      value={formData.eventIdsCustom}
                      onChange={(e) => setFormData({ ...formData, eventIdsCustom: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="e.g., 1, 4688, 8"
                    />
                  </div>

                  <Button
                    onClick={handleCreateQuery}
                    disabled={createMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create Query'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <p className="text-slate-400 text-sm">Total Queries</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-red-900 rounded-lg p-4 border border-red-700">
              <p className="text-red-200 text-sm">Critical</p>
              <p className="text-3xl font-bold text-red-100">{stats.critical}</p>
            </div>
            <div className="bg-orange-900 rounded-lg p-4 border border-orange-700">
              <p className="text-orange-200 text-sm">High</p>
              <p className="text-3xl font-bold text-orange-100">{stats.high}</p>
            </div>
            <div className="bg-yellow-900 rounded-lg p-4 border border-yellow-700">
              <p className="text-yellow-200 text-sm">Medium</p>
              <p className="text-3xl font-bold text-yellow-100">{stats.medium}</p>
            </div>
            <div className="bg-blue-900 rounded-lg p-4 border border-blue-700">
              <p className="text-blue-200 text-sm">Low</p>
              <p className="text-3xl font-bold text-blue-100">{stats.low}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filter */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
              placeholder="Search by name, technique ID, or technique name..."
            />
          </div>
          <Select value={threatFilter} onValueChange={setThreatFilter}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Threat Levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Queries Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading queries...</p>
          </div>
        ) : filteredQueries.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto mb-4 text-slate-400" size={48} />
            <p className="text-slate-400 text-lg">No queries found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQueries.map((query) => (
              <Card key={query.id} className={`${THREAT_COLORS[query.threatLevel as keyof typeof THREAT_COLORS]} border-2 rounded-lg p-6 hover:shadow-lg transition`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{query.name}</h3>
                    <p className="text-sm opacity-90 font-mono">{query.techniqueId}</p>
                  </div>
                  <span className={`${THREAT_BADGE_COLORS[query.threatLevel as keyof typeof THREAT_BADGE_COLORS]} px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2`}>
                    {query.threatLevel.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm opacity-90 mb-3 line-clamp-2">{query.description}</p>

                <div className="space-y-2 text-sm mb-4 opacity-90">
                  <p><strong>Technique:</strong> {query.techniqueName}</p>
                  <p><strong>Tactic:</strong> {query.category}</p>
                  {query.dataSources && query.dataSources.length > 0 && (
                    <p><strong>Sources:</strong> {query.dataSources.join(', ')}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-opacity-20 hover:bg-opacity-30"
                    onClick={() => setEditingId(query.id)}
                  >
                    <Edit2 size={16} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-red-600 bg-opacity-20 hover:bg-opacity-30 text-red-100 border-red-500"
                    onClick={() => handleDeleteQuery(query.id)}
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
