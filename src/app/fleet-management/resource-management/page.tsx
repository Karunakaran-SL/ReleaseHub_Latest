
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Deployment } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';

const ResourceMap = dynamic(() => import('./_components/resource-map'), {
    ssr: false,
    loading: () => <div className="h-full bg-muted rounded-md flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
});

interface ResourceDeployment extends Deployment {
    resourceStatus: 'optimal' | 'over-allocated' | 'under-allocated' | 'unknown';
    resources: {
        cpu: { allocated: number, used: number };
        memory: { allocated: number, used: number };
        storage: { allocated: number, used: number };
    };
}


export default function ResourceManagementPage() {
    const [user, setUser] = useState<User | null>(null);
    const [deployments, setDeployments] = useState<ResourceDeployment[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            try {
                const deploymentsRes = await fetch('/api/deployments');
                if (!deploymentsRes.ok) {
                    throw new Error('Failed to fetch initial data.');
                }
                const deploymentsData: Deployment[] = await deploymentsRes.json();
                
                // Add dummy resource data for visualization
                const deploymentsWithResources = deploymentsData.map(d => {
                    const cpuAlloc = Math.floor(Math.random() * 64) + 16;
                    const memAlloc = Math.floor(Math.random() * 256) + 64;
                    const stoAlloc = Math.floor(Math.random() * 2048) + 512;
                    
                    const cpuUsed = Math.floor(cpuAlloc * (Math.random() * 0.7 + 0.1));
                    const memUsed = Math.floor(memAlloc * (Math.random() * 0.7 + 0.1));
                    
                    let status: ResourceDeployment['resourceStatus'] = 'optimal';
                    const usagePercent = memUsed / memAlloc;
                    if (usagePercent > 0.8) status = 'over-allocated';
                    else if (usagePercent < 0.2) status = 'under-allocated';
                    
                    return {
                        ...d,
                        resourceStatus: status,
                        resources: {
                            cpu: { allocated: cpuAlloc, used: cpuUsed },
                            memory: { allocated: memAlloc, used: memUsed },
                            storage: { allocated: stoAlloc, used: Math.floor(stoAlloc * (Math.random() * 0.8 + 0.1)) },
                        }
                    }
                });

                setDeployments(deploymentsWithResources);
                
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                 <div className="mb-8">
                    <h1 className="text-3xl font-bold">Resource Management</h1>
                    <p className="text-muted-foreground">Global view of resource allocation and utilization across all deployments.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Global Resource View</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[70vh] bg-muted rounded-md flex items-center justify-center">
                            {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <ResourceMap deployments={deployments} />}
                        </div>
                    </CardContent>
                </Card>

            </main>
        </DashboardLayout>
    );
}
