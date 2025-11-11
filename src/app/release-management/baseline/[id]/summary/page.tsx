
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Baseline } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Save, Download, Workflow, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

function CiCdPipeline() {
    const steps = [
        { name: 'Build Started', status: 'completed' },
        { name: 'Unit Tests', status: 'completed' },
        { name: 'Code Scan', status: 'completed' },
        { name: 'Package Artifacts', status: 'completed' },
        { name: 'Push to Registry', status: 'completed' },
        { name: 'Deployment', status: 'skipped' },
    ];
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Workflow className="h-5 w-5"/> CI/CD Build Status</CardTitle>
                <CardDescription>
                    This is a simulated pipeline run for the baseline package creation.
                    <br/>
                    <span className="text-xs text-amber-600">Note: This is a placeholder. Future work will integrate with a real CI/CD system for live status updates.</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4">
                    {steps.map((step, index) => (
                        <div key={step.name} className="flex items-center">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'} text-white`}>
                                {index + 1}
                            </div>
                            <div className="ml-3">
                                <p className="font-medium">{step.name}</p>
                                <p className={`text-sm ${step.status === 'completed' ? 'text-green-600' : 'text-gray-500'}`}>{step.status}</p>
                            </div>
                            {index < steps.length - 1 && <div className="h-px w-12 bg-gray-300" />}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function BaselineSummaryPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    
    const [user, setUser] = useState<User | null>(null);
    const [baseline, setBaseline] = useState<Baseline | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
        if (!id) {
            toast({ variant: 'destructive', title: 'Error', description: 'No baseline ID provided.' });
            router.push('/release-management/baseline');
            return;
        }

        async function fetchBaseline() {
            try {
                // In a real app, you would fetch by ID, but since we only have a list endpoint, we'll find it from the list
                const res = await fetch('/api/baselines');
                if (!res.ok) throw new Error('Failed to fetch baselines');
                const baselines: Baseline[] = await res.json();
                const foundBaseline = baselines.find(b => b._id === id);
                if (!foundBaseline) throw new Error('Baseline not found');
                setBaseline(foundBaseline);
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchBaseline();
    }, [id, router, toast]);

    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>
    }

    if (!baseline) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center">Baseline not found.</div></DashboardLayout>
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Baseline Summary</CardTitle>
                        <CardDescription>
                            Baseline for <strong>{baseline.product.name} v{baseline.product.version}</strong> has been created successfully.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <CiCdPipeline />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Artifacts</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {baseline.artifacts.map(artifact => (
                                            <li key={artifact.name} className="flex items-center justify-between text-sm">
                                                <a href={artifact.url} download className="text-blue-600 hover:underline">{artifact.name}</a>
                                                <span className="text-muted-foreground">{artifact.size}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                     <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Package Properties</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm font-mono break-all">
                                    <div><span className="font-semibold text-muted-foreground">Location: </span>{baseline.package_properties.location}</div>
                                    <div><span className="font-semibold text-muted-foreground">MD5: </span>{baseline.package_properties.checksum_md5}</div>
                                    <div><span className="font-semibold text-muted-foreground">SHA256: </span>{baseline.package_properties.checksum_sha256}</div>
                                    <div><span className="font-semibold text-muted-foreground">Created: </span>{format(new Date(baseline.created_at), 'yyyy-MM-dd HH:mm:ss')}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="outline" onClick={() => router.push('/release-management/baseline')}>
                            <Save className="mr-2 h-4 w-4" />
                            Save & Go to List
                        </Button>
                         <Button onClick={() => toast({ title: 'Next Step', description: 'Proceeding to validation pipeline (not implemented).'})}>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Proceed to Validation Pipeline
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
