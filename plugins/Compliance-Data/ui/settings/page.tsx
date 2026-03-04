'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Fingerprint, Plus, Trash2, Save, Settings2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const defaultPolicies = [
    { id: 1, name: 'PII Encryption', classification: 'Restricted', retention: '5 years', enabled: true },
    { id: 2, name: 'Telemetry Anonymization', classification: 'Internal', retention: '2 years', enabled: true },
    { id: 3, name: 'Log Data Purge', classification: 'Public', retention: '90 days', enabled: false },
];

export default function DataComplianceSettings() {
    const [policies, setPolicies] = useState(defaultPolicies);
    const [dsarDeadlineDays, setDsarDeadlineDays] = useState('30');
    const [dpoEmail, setDpoEmail] = useState('dpo@company.com');
    const [newPolicy, setNewPolicy] = useState({ name: '', classification: 'Internal', retention: '1 year' });

    const addPolicy = () => {
        if (!newPolicy.name.trim()) return;
        setPolicies(prev => [...prev, { id: Date.now(), ...newPolicy, enabled: true }]);
        setNewPolicy({ name: '', classification: 'Internal', retention: '1 year' });
        toast({ title: 'Policy added' });
    };
    const removePolicy = (id: number) => { setPolicies(prev => prev.filter(p => p.id !== id)); };
    const togglePolicy = (id: number) => { setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)); };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" /> DSAR Configuration</CardTitle>
                    <CardDescription>Configure Data Subject Access Request deadlines and contact information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>DSAR Response Deadline (days)</Label>
                            <Input type="number" value={dsarDeadlineDays} onChange={e => setDsarDeadlineDays(e.target.value)} min={1} max={90} />
                        </div>
                        <div className="space-y-2">
                            <Label>Data Protection Officer Email</Label>
                            <Input value={dpoEmail} onChange={e => setDpoEmail(e.target.value)} placeholder="dpo@company.com" />
                        </div>
                    </div>
                    <Button onClick={() => toast({ title: 'Settings saved' })}><Save className="h-4 w-4 mr-2" /> Save Settings</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Fingerprint className="h-5 w-5" /> Data Retention Policies</CardTitle>
                    <CardDescription>Define and manage data classification and retention rules.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border rounded-lg divide-y">
                        {policies.map(policy => (
                            <div key={policy.id} className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <Switch checked={policy.enabled} onCheckedChange={() => togglePolicy(policy.id)} />
                                    <div>
                                        <p className="font-medium text-sm">{policy.name}</p>
                                        <p className="text-xs text-muted-foreground">Retain for {policy.retention}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{policy.classification}</Badge>
                                    <Button variant="ghost" size="icon" onClick={() => removePolicy(policy.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                        <p className="text-sm font-medium">Add New Policy</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input placeholder="Policy name" value={newPolicy.name} onChange={e => setNewPolicy(p => ({ ...p, name: e.target.value }))} />
                            <Select value={newPolicy.classification} onValueChange={v => setNewPolicy(p => ({ ...p, classification: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['Restricted', 'Confidential', 'Internal', 'Public'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input placeholder="Retention period (e.g. 2 years)" value={newPolicy.retention} onChange={e => setNewPolicy(p => ({ ...p, retention: e.target.value }))} />
                        </div>
                        <Button onClick={addPolicy}><Plus className="h-4 w-4 mr-2" /> Add Policy</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
