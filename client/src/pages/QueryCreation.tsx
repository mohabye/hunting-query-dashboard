import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Zap, PenTool } from 'lucide-react';

// MITRE ATT&CK Tactics
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

export default function QueryCreation() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [creationMode, setCreationMode] = useState<'manual' | 'ai'>('manual');
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual form state
  const [manualForm, setManualForm] = useState({
    name: '',
    description: '',
    category: 'Execution',
    techniqueId: '',
    techniqueName: '',
    procedure: '',
    threatLevel: 'high',
    dataSourcesCustom: '',
    querySyntax: '',
    eventIdsCustom: '',
  });

  // AI form state
  const [aiForm, setAiForm] = useState({
    userMessage: '',
    category: 'Execution',
    techniqueId: '',
    techniqueName: '',
    threatLevel: 'high',
  });

  const createQueryMutation = trpc.queries.create.useMutation({
    onSuccess: () => {
      toast.success('Query created successfully!');
      setIsOpen(false);
      resetForms();
    },
    onError: (error) => {
      toast.error(`Failed to create query: ${error.message}`);
    },
  });

  const resetForms = () => {
    setManualForm({
      name: '',
      description: '',
      category: 'Execution',
      techniqueId: '',
      techniqueName: '',
      procedure: '',
      threatLevel: 'high',
      dataSourcesCustom: '',
      querySyntax: '',
      eventIdsCustom: '',
    });
    setAiForm({
      userMessage: '',
      category: 'Execution',
      techniqueId: '',
      techniqueName: '',
      threatLevel: 'high',
    });
  };

  const handleManualCreate = async () => {
    if (!manualForm.name || !manualForm.description || !manualForm.techniqueId) {
      toast.error('Please fill in all required fields');
      return;
    }

    createQueryMutation.mutate({
      name: manualForm.name,
      description: manualForm.description,
      category: manualForm.category,
      techniqueId: manualForm.techniqueId,
      techniqueName: manualForm.techniqueName,
      procedure: manualForm.procedure,
      threatLevel: manualForm.threatLevel as any,
      dataSourcesCustom: manualForm.dataSourcesCustom,
      querySyntax: manualForm.querySyntax,
      eventIdsCustom: manualForm.eventIdsCustom,
      enabled: true,
    });
  };

  const handleAIGenerate = async () => {
    if (!aiForm.userMessage || !aiForm.techniqueId || !aiForm.techniqueName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      toast.success('Query generated with AI! (Demo mode)');
      setIsOpen(false);
      resetForms();
    } catch (error) {
      toast.error(`Error generating query: ${(error as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <PenTool size={18} className="mr-2" />
          Create Query
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Create Hunting Query</DialogTitle>
        </DialogHeader>

        <Tabs value={creationMode} onValueChange={(value) => setCreationMode(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700">
            <TabsTrigger value="manual" className="text-slate-200">
              <PenTool size={16} className="mr-2" />
              Manual Creation
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-slate-200">
              <Zap size={16} className="mr-2" />
              AI-Assisted
            </TabsTrigger>
          </TabsList>

          {/* Manual Creation Tab */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-200">Query Name *</Label>
                <Input
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., PowerShell Execution"
                />
              </div>

              <div>
                <Label className="text-slate-200">MITRE Technique ID *</Label>
                <Input
                  value={manualForm.techniqueId}
                  onChange={(e) => setManualForm({ ...manualForm, techniqueId: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., T1086"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-200">Technique Name *</Label>
              <Input
                value={manualForm.techniqueName}
                onChange={(e) => setManualForm({ ...manualForm, techniqueName: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., PowerShell"
              />
            </div>

            <div>
              <Label className="text-slate-200">Description *</Label>
              <Textarea
                value={manualForm.description}
                onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Describe what this query hunts for..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-200">MITRE Tactic</Label>
                <Select value={manualForm.category} onValueChange={(value) => setManualForm({ ...manualForm, category: value })}>
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
                <Select value={manualForm.threatLevel} onValueChange={(value) => setManualForm({ ...manualForm, threatLevel: value })}>
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

            <div>
              <Label className="text-slate-200">Data Sources (comma-separated)</Label>
              <Input
                value={manualForm.dataSourcesCustom}
                onChange={(e) => setManualForm({ ...manualForm, dataSourcesCustom: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., ETW, Sysmon, Network, Registry, File"
              />
              <p className="text-xs text-slate-400 mt-1">Enter custom data sources relevant to your environment</p>
            </div>

            <div>
              <Label className="text-slate-200">Event IDs (comma-separated)</Label>
              <Input
                value={manualForm.eventIdsCustom}
                onChange={(e) => setManualForm({ ...manualForm, eventIdsCustom: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., 4688, 8, 1"
              />
              <p className="text-xs text-slate-400 mt-1">Enter event IDs to monitor (e.g., Windows Event IDs, Sysmon Event IDs)</p>
            </div>

            <div>
              <Label className="text-slate-200">Query Syntax</Label>
              <Textarea
                value={manualForm.querySyntax}
                onChange={(e) => setManualForm({ ...manualForm, querySyntax: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter your query syntax here..."
                rows={3}
              />
            </div>

            <Button onClick={handleManualCreate} disabled={createQueryMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
              {createQueryMutation.isPending ? <Loader2 className="mr-2 animate-spin" size={18} /> : null}
              Create Query
            </Button>
          </TabsContent>

          {/* AI-Assisted Tab */}
          <TabsContent value="ai" className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-200">Describe What You Want to Hunt *</Label>
              <Textarea
                value={aiForm.userMessage}
                onChange={(e) => setAiForm({ ...aiForm, userMessage: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., Find all PowerShell execution events with suspicious command-line arguments..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-200">MITRE Technique ID *</Label>
                <Input
                  value={aiForm.techniqueId}
                  onChange={(e) => setAiForm({ ...aiForm, techniqueId: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., T1086"
                />
              </div>

              <div>
                <Label className="text-slate-200">Technique Name *</Label>
                <Input
                  value={aiForm.techniqueName}
                  onChange={(e) => setAiForm({ ...aiForm, techniqueName: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., PowerShell"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-200">MITRE Tactic</Label>
                <Select value={aiForm.category} onValueChange={(value) => setAiForm({ ...aiForm, category: value })}>
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
                <Select value={aiForm.threatLevel} onValueChange={(value) => setAiForm({ ...aiForm, threatLevel: value })}>
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

            <Button onClick={handleAIGenerate} disabled={isGenerating} className="w-full bg-purple-600 hover:bg-purple-700">
              {isGenerating ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Zap className="mr-2" size={18} />}
              Generate with AI
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
