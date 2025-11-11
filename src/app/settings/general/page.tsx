'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function GeneralSettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    const handleAction = async (action: 'seed' | 'clear') => {
        setIsLoading(true);
        const endpoint = action === 'seed' ? '/api/seed' : '/api/clear';
        const toastTitle = action === 'seed' ? 'Seeding Database' : 'Clearing Data';
        const successTitle = action === 'seed' ? 'Seeding Complete' : 'Data Cleared';
        
        toast({ title: toastTitle, description: 'This may take a moment...' });
        try {
            const response = await fetch(endpoint, { method: 'POST' });
            const result = await response.json();
            if (response.ok) {
                toast({ title: successTitle, description: result.message });
            } else {
                throw new Error(result.message || 'An unknown error occurred.');
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">General Settings</h1>
                    <p className="text-muted-foreground">Manage general application settings.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Development Settings</CardTitle>
                        <CardDescription>
                            Use these actions to manage the database state for development purposes. These actions are destructive and should not be used in production.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <Button onClick={() => handleAction('seed')} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Seed Data
                        </Button>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button variant="destructive" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Clear Data
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all data from the database tables.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleAction('clear')} className="bg-destructive hover:bg-destructive/90">
                                        Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
