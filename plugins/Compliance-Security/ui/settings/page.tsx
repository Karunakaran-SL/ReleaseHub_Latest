'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Plus, Trash2, Save, Settings2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const defaultControls = [
    { id: 1, name: 'Multi-Factor Authentication', category: 'Identity', severity: 'critical', enabled: true },
    { id: 2, name: 'Encryption at Rest', category: 'Data', severity: 'high', enabled: true },
    { id: 3, name: 'Network Segmentation', category: 'Network', severity: 'high', enabled: false },
];

export default function SecurityComplianceSettings() {
    const [controls, setControls] = useState(defaultControls);
    const [reviewCycle, setReviewCycle] = useState('quarterly');
    const [alertEmail, setAlertEmail] = useState('security@company.com');
    const [newControl, setNewControl] = useState({ name: '', category: 'Identity', severity: 'medium' });

    const addControl = () => {
        if (!newControl.name.trim()) return;
        setControls(prev => [...prev, { id: Date.now(), ...newControl, enabled: true }]);
        setNewControl({ name: '', category: 'Identity', severity: 'medium' });
        toast({ title: 'Control added', description: `${newControl.name} added to security controls.` });
    };

    const removeControl = (id: number) => {
        setControls(prev => prev.filter(c => c.id !== id));
        toast({ title: 'Control removed' });
    };

    const toggleControl = (id: number) => {
        setControls(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
    };

    return (
        <div className="space-y-6">
            {/* General Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" /> General Configuration</CardTitle>
                    <CardDescription>Configure review cycles and alert notifications for Security Compliance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Review Cycle</Label>
                            <Select value={reviewCycle} onValueChange={setReviewCycle}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                    <SelectItem value="biannual">Bi-Annual</SelectItem>
                                    <SelectItem value="annual">Annual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Alert Email</Label>
                            <Input value={alertEmail} onChange={e => setAlertEmail(e.target.value)} placeholder="security@company.com" />
                        </div>
                    </div>
                    <Button onClick={() => toast({ title: 'Settings saved', description: 'General configuration updated.' })}>
                        <Save className="h-4 w-4 mr-2" /> Save Settings
                    </Button>
                </CardContent>
            </Card>

            {/* Control Registry */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security Control Registry</CardTitle>
                    <CardDescription>Manage which security controls are tracked and enforced.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border rounded-lg divide-y">
                        {controls.map(control => (
                            <div key={control.id} className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <Switch checked={control.enabled} onCheckedChange={() => toggleControl(control.id)} />
                                    <div>
                                        <p className="font-medium text-sm">{control.name}</p>
                                        <p className="text-xs text-muted-foreground">{control.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={control.severity === 'critical' ? 'destructive' : 'secondary'}>{control.severity}</Badge>
                                    <Button variant="ghost" size="icon" onClick={() => removeControl(control.id)}>
                                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add New Control */}
                    <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                        <p className="text-sm font-medium">Add New Control</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input placeholder="Control name" value={newControl.name} onChange={e => setNewControl(p => ({ ...p, name: e.target.value }))} />
                            <Select value={newControl.category} onValueChange={v => setNewControl(p => ({ ...p, category: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['Identity', 'Network', 'Data', 'Operations', 'Physical'].map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={newControl.severity} onValueChange={v => setNewControl(p => ({ ...p, severity: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['critical', 'high', 'medium', 'low'].map(s => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={addControl}><Plus className="h-4 w-4 mr-2" /> Add Control</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
