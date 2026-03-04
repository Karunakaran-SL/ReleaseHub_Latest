'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookLock, Plus, Trash2, Save, Settings2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const defaultRiskTiers = [
    { id: 1, name: 'Critical', maxScore: 40, action: 'Block onboarding', color: 'destructive' },
    { id: 2, name: 'High Risk', maxScore: 60, action: 'CISO approval required', color: 'secondary' },
    { id: 3, name: 'Medium Risk', maxScore: 80, action: 'Legal review required', color: 'outline' },
    { id: 4, name: 'Low Risk', maxScore: 100, action: 'Standard onboarding', color: 'outline' },
];

export default function ThirdPartyComplianceSettings() {
    const [riskTiers, setRiskTiers] = useState(defaultRiskTiers);
    const [assessmentCycle, setAssessmentCycle] = useState('annual');
    const [vendorContactEmail, setVendorContactEmail] = useState('vendor-risk@company.com');
    const [newTier, setNewTier] = useState({ name: '', maxScore: '', action: '' });

    const addTier = () => {
        if (!newTier.name.trim() || !newTier.maxScore) return;
        setRiskTiers(prev => [...prev, { id: Date.now(), ...newTier, maxScore: Number(newTier.maxScore), color: 'outline' }]);
        setNewTier({ name: '', maxScore: '', action: '' });
        toast({ title: 'Risk tier added' });
    };
    const removeTier = (id: number) => setRiskTiers(prev => prev.filter(t => t.id !== id));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" /> Assessment Configuration</CardTitle>
                    <CardDescription>Configure vendor assessment frequency and contact details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Assessment Cycle</Label>
                            <Select value={assessmentCycle} onValueChange={setAssessmentCycle}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['monthly', 'quarterly', 'biannual', 'annual'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Vendor Risk Contact Email</Label>
                            <Input value={vendorContactEmail} onChange={e => setVendorContactEmail(e.target.value)} />
                        </div>
                    </div>
                    <Button onClick={() => toast({ title: 'Settings saved' })}><Save className="h-4 w-4 mr-2" /> Save Settings</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookLock className="h-5 w-5" /> Risk Tier Definitions</CardTitle>
                    <CardDescription>Define risk tiers and the required action for each score band.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border rounded-lg divide-y">
                        {riskTiers.map(tier => (
                            <div key={tier.id} className="flex items-center justify-between px-4 py-3">
                                <div>
                                    <p className="font-medium text-sm">{tier.name} <span className="text-muted-foreground font-normal">(score ≤ {tier.maxScore})</span></p>
                                    <p className="text-xs text-muted-foreground">{tier.action}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => removeTier(tier.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                        <p className="text-sm font-medium">Add New Tier</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input placeholder="Tier name" value={newTier.name} onChange={e => setNewTier(p => ({ ...p, name: e.target.value }))} />
                            <Input type="number" placeholder="Max score (0-100)" value={newTier.maxScore} onChange={e => setNewTier(p => ({ ...p, maxScore: e.target.value }))} />
                            <Input placeholder="Required action" value={newTier.action} onChange={e => setNewTier(p => ({ ...p, action: e.target.value }))} />
                        </div>
                        <Button onClick={addTier}><Plus className="h-4 w-4 mr-2" /> Add Tier</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
