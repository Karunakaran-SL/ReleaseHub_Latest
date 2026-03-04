
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings2, Plus, Save, Trash2 } from 'lucide-react';

const tools = [
    { id: 'fossology', name: 'FOSSology' },
    { id: 'ort', name: 'OSS Review Toolkit (ORT)' },
    { id: 'licensee', name: 'Licensee' },
    { id: 'go-licenses', name: 'go-licenses' },
    { id: 'snipe-it', name: 'Snipe-IT' },
    { id: 'glpi', name: 'GLPI' },
    { id: 'aikido', name: 'Aikido' }
];

export default function LMSIntegrationsSettings() {
    const [loading, setLoading] = useState(false);
    const [configs, setConfigs] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        toolId: 'fossology',
        apiKey: '',
        endpoint: ''
    });

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await fetch('/api/plugins/lms-integrations');
            if (res.ok) setConfigs(await res.json());
        } catch (error) { console.error(error); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/plugins/lms-integrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('Integration configured');
                setFormData({ toolId: 'fossology', apiKey: '', endpoint: '' });
                fetchConfigs();
            } else {
                alert('Failed to save configuration');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/plugins/lms-integrations?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Configuration removed');
                fetchConfigs();
            }
        } catch (error) { alert('An error occurred'); }
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-sm border-border/50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-teal-600" />
                        <CardTitle>Configure Integration</CardTitle>
                    </div>
                    <CardDescription>Setup a new connection to an external License Management System.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tool">LMS Tool</Label>
                                <Select
                                    value={formData.toolId}
                                    onValueChange={(value) => setFormData({ ...formData, toolId: value })}
                                >
                                    <SelectTrigger id="tool">
                                        <SelectValue placeholder="Select tool" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tools.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endpoint">API Endpoint URL</Label>
                                <Input
                                    id="endpoint"
                                    placeholder="https://lms.example.com/api"
                                    value={formData.endpoint}
                                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="apiKey">API Key / Token</Label>
                                <Input
                                    id="apiKey"
                                    type="password"
                                    placeholder="Enter your API token"
                                    value={formData.apiKey}
                                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/20 mt-4">
                        <Button type="submit" className="ml-auto" disabled={loading}>
                            {loading ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Configuration</>}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <Card className="shadow-sm border-border/50">
                <CardHeader>
                    <CardTitle>Active Integrations</CardTitle>
                    <CardDescription>Directly manage existing connections.</CardDescription>
                </CardHeader>
                <CardContent>
                    {configs.length > 0 ? (
                        <div className="space-y-2">
                            {configs.map((config: any) => (
                                <div key={config._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/5 transition-colors">
                                    <div>
                                        <p className="font-medium">{tools.find(t => t.id === config.toolId)?.name || config.toolId}</p>
                                        <p className="text-sm text-muted-foreground">{config.endpoint || 'Default Endpoint'}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(config._id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-4 text-muted-foreground italic">No integrations configured yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
