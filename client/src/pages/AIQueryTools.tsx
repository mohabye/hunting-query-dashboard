import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Zap, Copy, CheckCircle } from 'lucide-react';

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

const THREAT_LEVELS = ['critical', 'high', 'medium', 'low'];

export default function AIQueryTools() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'generate' | 'convert'>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [convertedQuery, setConvertedQuery] = useState('');
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('ELK');

  // Generate form
  const [generateForm, setGenerateForm] = useState({
    techniqueId: '',
    techniqueName: '',
    description: '',
    category: 'Execution',
    threatLevel: 'high',
  });

  // Convert form
  const [convertForm, setConvertForm] = useState({
    techniqueId: '',
    techniqueName: '',
    queryText: '',
  });

  const { data: queriesData = [] } = trpc.queries.list.useQuery({});
  
  const generateMutation = trpc.ai.generateQuery.useMutation({
    onSuccess: (data) => {
      setGeneratedQuery(data.query);
      setShowResultDialog(true);
      toast.success('Query generated successfully!');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const convertMutation = trpc.ai.convertQuery.useMutation({
    onSuccess: (data) => {
      setConvertedQuery(data.query);
      setShowResultDialog(true);
      toast.success('Query converted successfully!');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const createQueryMutation = trpc.queries.create.useMutation({
    onSuccess: () => {
      toast.success('Query saved to database!');
      setGeneratedQuery('');
      setGenerateForm({
        techniqueId: '',
        techniqueName: '',
        description: '',
        category: 'Execution',
        threatLevel: 'high',
      });
      setShowResultDialog(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleGenerateQuery = async () => {
    if (!generateForm.techniqueId || !generateForm.techniqueName || !generateForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      await generateMutation.mutateAsync({
        ...generateForm,
        threatLevel: generateForm.threatLevel as 'critical' | 'high' | 'medium' | 'low',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConvertQuery = async () => {
    if (!convertForm.techniqueId || !convertForm.techniqueName) {
      toast.error('Please select a technique');
      return;
    }

    const query = queriesData.find(q => q.techniqueId === convertForm.techniqueId);
    if (!query) {
      toast.error('No query found for this technique');
      return;
    }

    setIsGenerating(true);
    try {
      await convertMutation.mutateAsync({
        queryText: query.querySyntax || '',
        techniqueId: convertForm.techniqueId,
        techniqueName: convertForm.techniqueName,
        targetPlatform: selectedPlatform as 'ELK' | 'CrowdStrike' | 'Splunk',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedQuery = () => {
    if (!generatedQuery) {
      toast.error('No query to save');
      return;
    }

    createQueryMutation.mutate({
      name: `AI Generated: ${generateForm.techniqueName}`,
      description: generateForm.description,
      category: generateForm.category,
      techniqueId: generateForm.techniqueId,
      techniqueName: generateForm.techniqueName,
      threatLevel: generateForm.threatLevel as any,
      dataSourcesCustom: 'Auto-detected from AI',
      querySyntax: generatedQuery,
      eventIdsCustom: 'Auto-detected',
      enabled: true,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Query Tools</h1>
          <p className="text-slate-400">Generate and convert hunting queries with ChatGPT AI assistance</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'generate'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Zap className="inline mr-2" size={18} />
            Generate Query
          </button>
          <button
            onClick={() => setActiveTab('convert')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'convert'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Copy className="inline mr-2" size={18} />
            Convert Query
          </button>
        </div>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Generate New Query with AI</h2>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-200">Technique ID *</Label>
                  <Input
                    value={generateForm.techniqueId}
                    onChange={(e) => setGenerateForm({ ...generateForm, techniqueId: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., T1086"
                  />
                </div>

                <div>
                  <Label className="text-slate-200">Technique Name *</Label>
                  <Input
                    value={generateForm.techniqueName}
                    onChange={(e) => setGenerateForm({ ...generateForm, techniqueName: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., PowerShell"
                  />
                </div>

                <div>
                  <Label className="text-slate-200">What should we hunt for? *</Label>
                  <Textarea
                    value={generateForm.description}
                    onChange={(e) => setGenerateForm({ ...generateForm, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Describe the hunting objective in detail..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Tactic</Label>
                    <Select value={generateForm.category} onValueChange={(value) => setGenerateForm({ ...generateForm, category: value })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MITRE_TACTICS.map((tactic) => (
                          <SelectItem key={tactic} value={tactic}>{tactic}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-200">Threat Level</Label>
                    <Select value={generateForm.threatLevel} onValueChange={(value) => setGenerateForm({ ...generateForm, threatLevel: value })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {THREAT_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>{level.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateQuery}
                  disabled={isGenerating || generateMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isGenerating || generateMutation.isPending ? (
                    <Loader2 className="mr-2 animate-spin" size={18} />
                  ) : (
                    <Zap className="mr-2" size={18} />
                  )}
                  Generate with ChatGPT
                </Button>
              </div>
            </Card>

            {/* Output */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Generated Query</h2>
              
              {generatedQuery ? (
                <div className="space-y-4">
                  <div className="bg-slate-700 rounded p-4 max-h-96 overflow-y-auto border border-slate-600">
                    <pre className="text-slate-200 text-sm whitespace-pre-wrap font-mono">{generatedQuery}</pre>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(generatedQuery)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Copy size={18} className="mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={handleSaveGeneratedQuery}
                      disabled={createQueryMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {createQueryMutation.isPending ? <Loader2 className="mr-2 animate-spin" size={18} /> : <CheckCircle className="mr-2" size={18} />}
                      Save to DB
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">Generated query will appear here</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Convert Tab */}
        {activeTab === 'convert' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Convert Existing Query</h2>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-200">Select Technique *</Label>
                  <Select value={convertForm.techniqueId} onValueChange={(value) => {
                    const query = queriesData.find(q => q.techniqueId === value);
                    setConvertForm({
                      techniqueId: value,
                      techniqueName: query?.techniqueName || '',
                      queryText: query?.querySyntax || '',
                    });
                  }}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select a technique..." />
                    </SelectTrigger>
                    <SelectContent>
                      {queriesData.map((query) => (
                        <SelectItem key={query.id} value={query.techniqueId}>
                          {query.techniqueId} - {query.techniqueName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-200">Target Platform *</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ELK">ELK Stack</SelectItem>
                      <SelectItem value="CrowdStrike">CrowdStrike</SelectItem>
                      <SelectItem value="Splunk">Splunk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleConvertQuery}
                  disabled={isGenerating || convertMutation.isPending || !convertForm.techniqueId}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isGenerating || convertMutation.isPending ? (
                    <Loader2 className="mr-2 animate-spin" size={18} />
                  ) : (
                    <Copy className="mr-2" size={18} />
                  )}
                  Convert with ChatGPT
                </Button>
              </div>
            </Card>

            {/* Output */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Converted Query ({selectedPlatform})</h2>
              
              {convertedQuery ? (
                <div className="space-y-4">
                  <div className="bg-slate-700 rounded p-4 max-h-96 overflow-y-auto border border-slate-600">
                    <pre className="text-slate-200 text-sm whitespace-pre-wrap font-mono">{convertedQuery}</pre>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(convertedQuery)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Copy size={18} className="mr-2" />
                    Copy Converted Query
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">Converted query will appear here</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {activeTab === 'generate' ? 'Generated Query' : 'Converted Query'}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-slate-700 rounded p-4 max-h-96 overflow-y-auto">
            <pre className="text-slate-200 text-sm whitespace-pre-wrap font-mono">
              {activeTab === 'generate' ? generatedQuery : convertedQuery}
            </pre>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => copyToClipboard(activeTab === 'generate' ? generatedQuery : convertedQuery)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Copy size={18} className="mr-2" />
              Copy
            </Button>
            {activeTab === 'generate' && (
              <Button
                onClick={handleSaveGeneratedQuery}
                disabled={createQueryMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {createQueryMutation.isPending ? <Loader2 className="mr-2 animate-spin" size={18} /> : <CheckCircle className="mr-2" size={18} />}
                Save to Database
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
