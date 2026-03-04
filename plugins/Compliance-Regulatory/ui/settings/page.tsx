'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Landmark, Plus, Trash2, Save, Settings2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const defaultFrameworks = [
    { id: 1, name: 'ISO 27001', certBody: 'BSI Group', autoRenew: true, enabled: true },
    { id: 2, name: 'SOC 2 Type II', certBody: 'External Auditor', autoRenew: false, enabled: true },
    { id: 3, name: 'GDPR', certBody: 'Internal DPO', autoRenew: true, enabled: true },
    { id: 4, name: 'HIPAA', certBody: 'CMS', autoRenew: false, enabled: false },
];

export default function RegulatoryComplianceSettings() {
    const [frameworks, setFrameworks] = useState(defaultFrameworks);
    const [certEmail, setCertEmail] = useState('compliance@company.com');
    const [renewalWarningDays, setRenewalWarningDays] = useState('90');
    const [newFw, setNewFw] = useState({ name: '', certBody: '', autoRenew: false });

    const addFramework = () => {
        if (!newFw.name.trim()) return;
        setFrameworks(prev => [...prev, { id: Date.now(), ...newFw, enabled: true }]);
        setNewFw({ name: '', certBody: '', autoRenew: false });
        toast({ title: 'Framework added' });
    };
    const removeFramework = (id: number) => setFrameworks(prev => prev.filter(f => f.id !== id));
    const toggleFramework = (id: number) => setFrameworks(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" /> Renewal Configuration</CardTitle>
                    <CardDescription>Configure compliance contact and certification renewal thresholds.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Compliance Contact Email</Label>
                            <Input value={certEmail} onChange={e => setCertEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Renewal Warning (days before expiry)</Label>
                            <Input type="number" value={renewalWarningDays} onChange={e => setRenewalWarningDays(e.target.value)} min={30} max={365} />
                        </div>
                    </div>
                    <Button onClick={() => toast({ title: 'Settings saved' })}><Save className="h-4 w-4 mr-2" /> Save Settings</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" /> Active Frameworks</CardTitle>
                    <CardDescription>Enable or disable tracked regulatory frameworks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border rounded-lg divide-y">
                        {frameworks.map(fw => (
                            <div key={fw.id} className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <Switch checked={fw.enabled} onCheckedChange={() => toggleFramework(fw.id)} />
                                    <div>
                                        <p className="font-medium text-sm">{fw.name}</p>
                                        <p className="text-xs text-muted-foreground">Cert Body: {fw.certBody}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {fw.autoRenew && <Badge variant="secondary">Auto-renew</Badge>}
                                    <Button variant="ghost" size="icon" onClick={() => removeFramework(fw.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                        <p className="text-sm font-medium">Add Framework</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input placeholder="Framework name (e.g. PCI DSS)" value={newFw.name} onChange={e => setNewFw(p => ({ ...p, name: e.target.value }))} />
                            <Input placeholder="Certifying body" value={newFw.certBody} onChange={e => setNewFw(p => ({ ...p, certBody: e.target.value }))} />
                        </div>
                        <Button onClick={addFramework}><Plus className="h-4 w-4 mr-2" /> Add Framework</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
