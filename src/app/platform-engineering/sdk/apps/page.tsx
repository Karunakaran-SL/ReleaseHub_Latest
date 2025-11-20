'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface SdkApp {
    _id: string;
    projectName: string;
    environmentType?: string;
    createdAt: string;
}

export default function SdkAppsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [apps, setApps] = useState<SdkApp[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
        async function fetchApps() {
            setLoading(true);
            try {
                const res = await fetch('/api/platform-engineering/sdk-apps');
                if (!res.ok) throw new Error('Failed to fetch generated apps');
                setApps(await res.json());
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchApps();
    }, [toast]);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Generated SDK Applications</h1>
                        <p className="text-muted-foreground">View and manage your saved SDK project configurations.</p>
                    </div>
                    <Button asChild>
                        <Link href="/platform-engineering/sdk">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create New App
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Saved Configurations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project Name</TableHead>
                                    <TableHead>Environment Type</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-8 w-8 animate-spin" /></TableCell></TableRow>
                                ) : apps.length > 0 ? (
                                    apps.map(app => (
                                        <TableRow key={app._id}>
                                            <TableCell className="font-medium">{app.projectName}</TableCell>
                                            <TableCell className="capitalize">{app.environmentType || 'N/A'}</TableCell>
                                            <TableCell>{format(new Date(app.createdAt), 'PPP')}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24">No saved SDK app configurations found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </DashboardLayout>
    );
}
