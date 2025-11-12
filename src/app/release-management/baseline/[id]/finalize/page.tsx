
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Baseline } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, FileCheck, XCircle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


export default function FinalizeBaselinePage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    
    const [user, setUser] = useState<User | null>(null);
    const [baseline, setBaseline] = useState<Baseline | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notes, setNotes] = useState('');
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
                const res = await fetch(`/api/baselines/${id}`);
                if (!res.ok) throw new Error('Failed to fetch baseline');
                const data = await res.json();
                setBaseline(data);
                
                if (data.status === 'RELEASED' || data.status === 'REJECTED' || data.status === 'ARCHIVED') {
                     toast({ variant: 'default', title: 'Notice', description: 'This baseline has already been finalized and is immutable.' });
                }

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchBaseline();
    }, [id, router, toast]);
    
    const handleSubmit = async (finalStatus: 'RELEASED' | 'REJECTED') => {
        setIsSubmitting(true);
        const actionText = finalStatus === 'RELEASED' ? 'Releasing' : 'Rejecting';
        const successText = finalStatus === 'RELEASED' ? 'released' : 'rejected';
        
        try {
            const response = await fetch(`/api/baselines/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: finalStatus,
                    updateComment: `${actionText} baseline. Notes: ${notes || 'N/A'}`
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${actionText.toLowerCase()} baseline.`);
            }

            toast({ title: 'Success', description: `Baseline has been successfully ${successText}.` });
            router.push('/release-management/baseline');
            router.refresh();

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };


    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>
    }

    if (!baseline) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center">Baseline not found.</div></DashboardLayout>
    }
    
    const isFinalized = ['RELEASED', 'REJECTED', 'ARCHIVED'].includes(baseline.status);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 space-y-6">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl">Phase 4: Finalize Baseline</CardTitle>
                        <CardDescription>
                            Review and finalize the baseline for product <strong>{baseline.product.name}</strong>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isFinalized ? (
                             <Alert variant="default" className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                                <Lock className="h-4 w-4" />
                                <AlertTitle>Baseline Finalized</AlertTitle>
                                <AlertDescription>
                                    This baseline has been {baseline.status.toLowerCase()} and is now read-only. No further actions can be taken.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Warning</AlertTitle>
                                <AlertDescription>
                                    Finalizing or rejecting a baseline is an immutable action. Once completed, the status cannot be changed.
                                </AlertDescription>
                            </Alert>
                        )}


                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <div><span className="font-semibold text-muted-foreground">Version Number:</span> {baseline.product.version}</div>
                            <div><span className="font-semibold text-muted-foreground">Release Date:</span> {format(new Date(), 'yyyy-MM-dd')}</div>
                            <div><span className="font-semibold text-muted-foreground">Responsible Engineer:</span> {user?.username || 'N/A'}</div>
                            <div><span className="font-semibold text-muted-foreground">Current Status:</span> {baseline.status}</div>
                        </div>

                        <div className="space-y-2">
                             <Label htmlFor="consolidated-notes">Consolidated Release Notes</Label>
                             <Textarea id="consolidated-notes" readOnly rows={8} defaultValue="- [Tenant] Platform Foundation v1.0.0: Initial release.\n- [Component] Authentication Service v1.3.0: Added multi-factor authentication support.\n- [Application] User Dashboard v2.0.0: Redesigned user interface."/>
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="notes">Finalization Notes</Label>
                            <Textarea 
                                id="notes" 
                                rows={4}
                                placeholder="Add any final comments or justifications for this action..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                disabled={isFinalized}
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isFinalized || isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4" />}
                                    Reject Baseline
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to reject this baseline?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action is permanent and cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleSubmit('REJECTED')} className="bg-destructive hover:bg-destructive/90">
                                        Confirm Rejection
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="default" className="bg-green-600 hover:bg-green-700" disabled={isFinalized || isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileCheck className="mr-2 h-4 w-4" />}
                                    Apply Baseline Version to Product
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Finalize and Release Baseline?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will mark the baseline as RELEASED and update the product version to {baseline.product.version}. This action is permanent.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleSubmit('RELEASED')}>
                                        Confirm & Finalize
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
