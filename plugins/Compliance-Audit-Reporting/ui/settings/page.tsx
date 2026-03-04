'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileArchive, Plus, Trash2, Save, Settings2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const defaultAuditTypes = [
    { id: 1, name: 'Internal Security Audit', frequency: 'annual', assignee: 'Internal Audit Team', enabled: true },
    { id: 2, name: 'External Penetration Test', frequency: 'annual', assignee: 'Third-Party Firm', enabled: true },
    { id: 3, name: 'Quarterly Access Review', frequency: 'quarterly', assignee: 'IT Operations', enabled: false },
];

export default function AuditReportingSettings() {
    const [auditTypes, setAuditTypes] = useState(defaultAuditTypes);
    const [auditEmail, setAuditEmail] = useState('audit@company.com');
    const [retentionYears, setRetentionYears] = useState('7');
    const [reportFormat, setReportFormat] = useState('pdf');
    const [newType, setNewType] = useState({ name: '', frequency: 'annual', assignee: '' });

    const addType = () => {
        if (!newType.name.trim()) return;
        setAuditTypes(prev => [...prev, { id: Date.now(), ...newType, enabled: true }]);
        setNewType({ name: '', frequency: 'annual', assignee: '' });
        toast({ title: 'Audit type added' });
    };
    const removeType = (id: number) => setAuditTypes(prev => prev.filter(t => t.id !== id));
    const toggleType = (id: number) => setAuditTypes(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" /> Report Configuration</CardTitle>
                    <CardDescription>Configure audit report format, retention period, and contact details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Audit Contact Email</Label>
                            <Input value={auditEmail} onChange={e => setAuditEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Report Retention (years)</Label>
                            <Input type="number" value={retentionYears} onChange={e => setRetentionYears(e.target.value)} min={1} max={20} />
                        </div>
                        <div className="space-y-2">
                            <Label>Default Report Format</Label>
                            <Select value={reportFormat} onValueChange={setReportFormat}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['pdf', 'xlsx', 'csv', 'json'].map(f => <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button onClick={() => toast({ title: 'Settings saved' })}><Save className="h-4 w-4 mr-2" /> Save Settings</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileArchive className="h-5 w-5" /> Scheduled Audit Types</CardTitle>
                    <CardDescription>Define recurring audit types and their frequency.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border rounded-lg divide-y">
                        {auditTypes.map(at => (
                            <div key={at.id} className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <Switch checked={at.enabled} onCheckedChange={() => toggleType(at.id)} />
                                    <div>
                                        <p className="font-medium text-sm">{at.name}</p>
                                        <p className="text-xs text-muted-foreground">Assignee: {at.assignee}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{at.frequency}</Badge>
                                    <Button variant="ghost" size="icon" onClick={() => removeType(at.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                        <p className="text-sm font-medium">Add Audit Type</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input placeholder="Audit type name" value={newType.name} onChange={e => setNewType(p => ({ ...p, name: e.target.value }))} />
                            <Input placeholder="Assignee / team" value={newType.assignee} onChange={e => setNewType(p => ({ ...p, assignee: e.target.value }))} />
                            <Select value={newType.frequency} onValueChange={v => setNewType(p => ({ ...p, frequency: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['monthly', 'quarterly', 'biannual', 'annual'].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={addType}><Plus className="h-4 w-4 mr-2" /> Add Audit Type</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
