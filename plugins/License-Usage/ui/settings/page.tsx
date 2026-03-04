
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Key, Plus } from 'lucide-react';

export default function LicenseUsageSettings() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'SaaS',
        owner: '',
        status: 'active'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/plugins/license-usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('License added successfully');
                setFormData({ name: '', type: 'SaaS', owner: '', status: 'active' });
            } else {
                alert('Failed to add license');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-sm border-border/50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-indigo-500" />
                        <CardTitle>Add New License</CardTitle>
                    </div>
                    <CardDescription>Register a new software license in the system inventory.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">License Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Adobe Creative Cloud"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="owner">Owner / Department</Label>
                                <Input
                                    id="owner"
                                    placeholder="e.g. Marketing"
                                    value={formData.owner}
                                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">License Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SaaS">SaaS</SelectItem>
                                        <SelectItem value="On-Premise">On-Premise</SelectItem>
                                        <SelectItem value="Perpetual">Perpetual</SelectItem>
                                        <SelectItem value="Open Source">Open Source</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                        <SelectItem value="deprecated">Deprecated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/20 mt-4">
                        <Button type="submit" className="ml-auto" disabled={loading}>
                            {loading ? 'Saving...' : <><Plus className="mr-2 h-4 w-4" /> Add License</>}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <Card className="shadow-sm border-border/50">
                <CardHeader>
                    <CardTitle>License Configuration</CardTitle>
                    <CardDescription>General settings for the License Usage Manager plugin.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
                        <div>
                            <p className="font-medium">Auto-renew Notifications</p>
                            <p className="text-sm text-muted-foreground">Notify owners 30 days before license expiration.</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
