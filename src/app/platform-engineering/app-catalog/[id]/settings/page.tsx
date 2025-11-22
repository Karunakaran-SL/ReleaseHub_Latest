
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

interface AppCatalogItem {
    _id: string;
    name: string;
    description: string;
    category: string;
    subcategory: string;
    logo: string;
    website: string;
    kubernetesConfig: Record<string, any>;
}

export default function AppCatalogSettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [item, setItem] = useState<AppCatalogItem | null>(null);
    const [config, setConfig] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { id } = useParams();

    useEffect(() => {
        getUser().then(setUser);
        if (!id) {
            router.push('/platform-engineering/app-catalog');
            return;
        }

        async function fetchData() {
            setLoading(true);
            try {
                const res = await fetch(`/api/app-catalog/${id}`);
                if (!res.ok) throw new Error('Failed to fetch item details');
                const data = await res.json();
                setItem(data);
                setConfig(data.kubernetesConfig || {});
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, router, toast]);
    
    const handleConfigChange = (key: string, value: any) => {
        setConfig(prev => ({...prev, [key]: value}));
    };

    const handleSave = async () => {
        if (!item) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/app-catalog/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kubernetesConfig: config }),
            });
            if (!res.ok) throw new Error('Failed to save configuration');
            toast({ title: 'Success', description: `${item.name} configuration saved.` });
            router.push('/platform-engineering/app-catalog');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }

    if (!item) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center">App not found.</div></DashboardLayout>;
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <div className="flex items-start gap-4">
                            <Image src={item.logo} alt={`${item.name} logo`} width={64} height={64} className="rounded-lg" />
                            <div>
                                <CardTitle className="text-2xl">{item.name} Configuration</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="namespace">Namespace</Label>
                            <Input id="namespace" value={config.namespace || 'default'} onChange={e => handleConfigChange('namespace', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="replicaCount">Replica Count</Label>
                            <Input id="replicaCount" type="number" value={config.replicaCount || 1} onChange={e => handleConfigChange('replicaCount', parseInt(e.target.value, 10))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="values">Helm Values (YAML)</Label>
                            <Textarea id="values" value={config.values || ''} onChange={e => handleConfigChange('values', e.target.value)} rows={15} className="font-mono text-xs"/>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                         <Button variant="outline" onClick={() => router.push('/platform-engineering/app-catalog')}>Back to Catalog</Button>
                         <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             <Save className="mr-2 h-4 w-4" /> Save Configuration
                         </Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
