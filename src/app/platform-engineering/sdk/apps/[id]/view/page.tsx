
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function ViewSdkAppPage() {
    const [user, setUser] = useState<User | null>(null);
    const [appConfig, setAppConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const { id } = useParams();

    useEffect(() => {
        getUser().then(setUser);
        if (!id) {
            router.push('/platform-engineering/sdk/apps');
            return;
        }

        async function fetchAppConfig() {
            setLoading(true);
            try {
                const res = await fetch(`/api/platform-engineering/sdk-apps/${id}`);
                if (!res.ok) throw new Error('Failed to fetch app configuration.');
                setAppConfig(await res.json());
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchAppConfig();
    }, [id, router, toast]);

    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }

    if (!appConfig) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><p>App configuration not found.</p></div></DashboardLayout>;
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card>
                    <CardHeader>
                        <CardTitle>View SDK App Configuration</CardTitle>
                        <CardDescription>Project: {appConfig.projectName}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Project Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div><Label>Project Name</Label><Input value={appConfig.projectName || ''} disabled /></div>
                                <div><Label>Group</Label><Input value={appConfig.group || ''} disabled /></div>
                                <div><Label>Package Name</Label><Input value={`${appConfig.group || ''}.${appConfig.projectName || ''}`} disabled /></div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Dependencies</h3>
                            <div className="flex flex-wrap gap-2">
                                {appConfig.dependencies && appConfig.dependencies.length > 0 ? (
                                    appConfig.dependencies.map((dep: any) => <Badge key={dep.id} variant="secondary">{dep.name}</Badge>)
                                ) : <p className="text-sm text-muted-foreground">No dependencies selected.</p>}
                            </div>
                        </div>

                         <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Deployment & Environment</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div><Label>Git Repository</Label><Input value={appConfig.repoUrl || 'N/A'} disabled /></div>
                                <div><Label>CI/CD Pipeline</Label><Input value={appConfig.pipelineType || 'N/A'} disabled /></div>
                                <div><Label>Environment Type</Label><Input className="capitalize" value={appConfig.environmentType || 'N/A'} disabled /></div>
                                <div className="lg:col-span-2"><Label>Environment ID</Label><Input value={appConfig.environmentId || 'N/A'} disabled /></div>
                             </div>
                        </div>
                        
                        {(appConfig.simulators?.length > 0 || appConfig.emulators?.length > 0) && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Simulation & Emulation</h3>
                                {appConfig.simulators?.map((sim: any) => (
                                    <Card key={sim.id}>
                                        <CardHeader><CardTitle className="text-base">{sim.name} (Simulator) - {sim.instanceCount} instances</CardTitle></CardHeader>
                                        {sim.instances && sim.instances.length > 0 && (
                                            <CardContent>
                                                {sim.instances.map((inst: any, i: number) => <p key={i} className="text-sm font-mono">{inst.name}@{inst.ip}</p>)}
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                                {appConfig.emulators?.map((emu: any) => (
                                     <Card key={emu.id}>
                                        <CardHeader><CardTitle className="text-base">{emu.name} (Emulator) - {emu.instanceCount} instances</CardTitle></CardHeader>
                                        {emu.instances && emu.instances.length > 0 && (
                                            <CardContent>
                                                {emu.instances.map((inst: any, i: number) => <p key={i} className="text-sm font-mono">{inst.name}@{inst.ip}</p>)}
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => router.back()}>Back</Button>
                        <Button onClick={() => router.push(`/platform-engineering/sdk/apps/${appConfig._id}/edit`)}>Edit</Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
