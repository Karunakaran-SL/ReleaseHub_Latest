'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Plus, Trash2, Save, Settings2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const defaultSopCategories = [
    { id: 1, name: 'Deployment & Release', owner: 'Platform Team', reviewCycle: 'quarterly', enabled: true },
    { id: 2, name: 'Incident Response', owner: 'Security Team', reviewCycle: 'biannual', enabled: true },
    { id: 3, name: 'Access Request', owner: 'IT Operations', reviewCycle: 'annual', enabled: false },
];

export default function OperationalComplianceSettings() {
    const [categories, setCategories] = useState(defaultSopCategories);
    const [deviationEmail, setDeviationEmail] = useState('ops-compliance@company.com');
    const [approvalThreshold, setApprovalThreshold] = useState('2');
    const [newCat, setNewCat] = useState({ name: '', owner: '', reviewCycle: 'quarterly' });

    const addCategory = () => {
        if (!newCat.name.trim()) return;
        setCategories(prev => [...prev, { id: Date.now(), ...newCat, enabled: true }]);
        setNewCat({ name: '', owner: '', reviewCycle: 'quarterly' });
        toast({ title: 'Category added' });
    };
    const removeCategory = (id: number) => setCategories(prev => prev.filter(c => c.id !== id));
    const toggleCategory = (id: number) => setCategories(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" /> General Configuration</CardTitle>
                    <CardDescription>Configure approval rules and notification settings for Operational Compliance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Deviation Alert Email</Label>
                            <Input value={deviationEmail} onChange={e => setDeviationEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Minimum Approvers Required</Label>
                            <Input type="number" value={approvalThreshold} onChange={e => setApprovalThreshold(e.target.value)} min={1} max={10} />
                        </div>
                    </div>
                    <Button onClick={() => toast({ title: 'Settings saved' })}><Save className="h-4 w-4 mr-2" /> Save Settings</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" /> SOP Categories</CardTitle>
                    <CardDescription>Define categories for Standard Operating Procedures and their review cycles.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border rounded-lg divide-y">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <Switch checked={cat.enabled} onCheckedChange={() => toggleCategory(cat.id)} />
                                    <div>
                                        <p className="font-medium text-sm">{cat.name}</p>
                                        <p className="text-xs text-muted-foreground">Owner: {cat.owner}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{cat.reviewCycle}</Badge>
                                    <Button variant="ghost" size="icon" onClick={() => removeCategory(cat.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                        <p className="text-sm font-medium">Add New Category</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input placeholder="Category name" value={newCat.name} onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} />
                            <Input placeholder="Owner team" value={newCat.owner} onChange={e => setNewCat(p => ({ ...p, owner: e.target.value }))} />
                            <Select value={newCat.reviewCycle} onValueChange={v => setNewCat(p => ({ ...p, reviewCycle: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['monthly', 'quarterly', 'biannual', 'annual'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={addCategory}><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
