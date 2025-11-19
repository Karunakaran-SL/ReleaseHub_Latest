
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { VisualBuilder } from '@/app/platform-engineering/platform-builder/_components/visual-builder';

export default function ViewPlatformFoundationPage() {
    const [user, setUser] = useState<User | null>(null);
    const [foundation, setFoundation] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;
        
        async function fetchFoundation() {
            setLoading(true);
            try {
                const res = await fetch(`/api/platform-foundations/${id}`);
                if (!res.ok) throw new Error('Failed to fetch platform foundation');
                const data = await res.json();
                setFoundation(data);
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchFoundation();

    }, [id, toast]);

    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>
    }

    if (!foundation) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center">Platform Foundation not found.</div></DashboardLayout>
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card>
                    <CardHeader>
                        <CardTitle>View Platform Foundation: {foundation.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[75vh]">
                            <VisualBuilder foundation={foundation} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => router.push('/platform-engineering/platform-foundations')}>Back to List</Button>
                        <Button onClick={() => router.push(`/platform-engineering/platform-foundations/${id}/edit`)}>Edit</Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    )
}
