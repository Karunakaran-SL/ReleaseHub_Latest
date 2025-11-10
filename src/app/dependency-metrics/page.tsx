
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DependencyMetricsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [isUpdatingMetrics, setIsUpdatingMetrics] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    const handleUpdateMetrics = async () => {
        setIsUpdatingMetrics(true);
        toast({ title: 'Updating Metrics', description: 'Generating dependency trees for all products...' });
        try {
            const response = await fetch('/api/dependency-tree/update-all', { method: 'POST' });
            const result = await response.json();
            if (response.ok) {
                toast({ title: 'Success', description: result.message });
            } else {
                throw new Error(result.message || 'Failed to update metrics.');
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsUpdatingMetrics(false);
        }
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Dependency Metrics</h1>
                    <Button onClick={handleUpdateMetrics} disabled={isUpdatingMetrics}>
                        {isUpdatingMetrics && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Metrics
                    </Button>
                </div>
                 <div className="text-center text-muted-foreground py-12">
                    <p>Click "Update Metrics" to generate the dependency graph data for all products.</p>
                </div>
            </main>
        </DashboardLayout>
    );
}
