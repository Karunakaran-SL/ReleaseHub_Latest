
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, CmdbInterface } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function EditInterfacePage() {
    const [user, setUser] = useState<User | null>(null);
    const [item, setItem] = useState<CmdbInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [formState, setFormState] = useState<Partial<CmdbInterface> & { updateComment?: string }>({});
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;
        
        setLoading(true);
        fetch(`/api/cmdb/interfaces/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch interface');
                return res.json();
            })
            .then(data => {
                setItem(data);
                setFormState(data);
            })
            .catch(err => {
                toast({ variant: 'destructive', title: 'Error', description: err.message });
                router.push('/cmdb/interfaces');
            })
            .finally(() => setLoading(false));
    }, [id, router, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.updateComment) {
            toast({ variant: 'destructive', title: 'Error', description: 'Update Reason is required.' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/cmdb/interfaces/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState),
            });
            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update interface');
            }
            toast({ title: 'Success', description: 'Interface updated successfully.' });
            router.push('/cmdb/interfaces');
            router.refresh();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (loading || !item) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Update Interface: {item.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <Label htmlFor="name">Interface Name</Label>
                                <Input id="name" value={formState.name || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={formState.description || ''} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2 pt-4">
                                <Label htmlFor="updateComment">Update Reason *</Label>
                                <Textarea 
                                    id="updateComment" 
                                    placeholder="Provide a reason for this update for auditing purposes."
                                    value={formState.updateComment || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()}>CANCEL</Button>
                            <Button type="submit" disabled={loading || !formState.updateComment}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                UPDATE INTERFACE
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </DashboardLayout>
    );
}
