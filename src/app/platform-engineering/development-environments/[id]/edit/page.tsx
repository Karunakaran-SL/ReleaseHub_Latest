
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, DevelopmentEnvironment } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function EditDevelopmentEnvironmentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [environment, setEnvironment] = useState<Partial<DevelopmentEnvironment>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;
        
        async function fetchEnvironment() {
            setLoading(true);
            try {
                const res = await fetch(`/api/development-environments/${id}`);
                if (!res.ok) throw new Error('Failed to fetch environment details.');
                setEnvironment(await res.json());
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
                router.push('/platform-engineering/development-environments');
            } finally {
                setLoading(false);
            }
        }
        fetchEnvironment();
    }, [id, toast, router]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/development-environments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(environment),
            });
            if (!res.ok) throw new Error('Failed to update environment.');
            toast({ title: 'Success', description: 'Environment updated successfully.' });
            router.push(`/platform-engineering/development-environments/${environment._id}/view`);
            router.refresh();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Edit Environment: {environment?.name}</CardTitle>
                        <CardDescription>Update the details for this development environment.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Environment Name</Label>
                            <Input
                                id="name"
                                value={environment?.name || ''}
                                onChange={(e) => setEnvironment(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Product</Label>
                            <Input value={(environment as any)?.productName || environment?.productId || ''} disabled />
                        </div>
                         <div className="space-y-2">
                            <Label>Specification</Label>
                            <Input value={(environment as any)?.specName || environment?.specificationId || ''} disabled />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
