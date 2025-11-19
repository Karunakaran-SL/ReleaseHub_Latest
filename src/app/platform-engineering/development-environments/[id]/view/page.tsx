'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
    PROVISIONING: 'bg-yellow-200 text-yellow-800',
    READY: 'bg-green-200 text-green-800',
    ERROR: 'bg-red-200 text-red-800',
    DELETING: 'bg-gray-300 text-gray-900',
};

export default function ViewDevelopmentEnvironmentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [environment, setEnvironment] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;
        
        async function fetchData() {
            setLoading(true);
            try {
                const res = await fetch(`/api/development-environments/${id}`);
                if (!res.ok) throw new Error('Failed to fetch environment details');
                const data = await res.json();
                setEnvironment(data);
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, toast]);

    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }
    
    if (!environment) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center">Environment not found.</div></DashboardLayout>;
    }
    
    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl">{environment.name}</CardTitle>
                                <CardDescription>Viewing development environment details.</CardDescription>
                            </div>
                            <Badge className={cn("text-base", statusColors[environment.status])}>
                                {environment.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Product</Label>
                                <Input value={environment.productName || 'N/A'} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>Specification</Label>
                                <Input value={environment.specName || 'N/A'} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>Created By</Label>
                                <Input value={environment.createdBy} disabled />
                            </div>
                             <div className="space-y-2">
                                <Label>Created At</Label>
                                <Input value={format(new Date(environment.createdAt), 'PPP p')} disabled />
                            </div>
                             <div className="space-y-2">
                                <Label>Est. Cost</Label>
                                <Input value={`$${environment.estimatedCost?.toFixed(2) || '0.00'} / hr`} disabled />
                            </div>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold mb-2">Resource Usage</h3>
                             <div className="grid md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted">
                                 <div><Label>CPU</Label><Input value={environment.resourceUsage?.cpu || 'N/A'} disabled /></div>
                                 <div><Label>Memory</Label><Input value={environment.resourceUsage?.memory || 'N/A'} disabled /></div>
                                 <div><Label>Storage</Label><Input value={environment.resourceUsage?.storage || 'N/A'} disabled /></div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => router.back()}>Back</Button>
                        <Button onClick={() => router.push(`/platform-engineering/development-environments/${id}/edit`)}>Edit</Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
