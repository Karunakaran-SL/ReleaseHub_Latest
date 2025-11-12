
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Baseline } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Save, Download, Info, Package, Warehouse, Puzzle, AppWindow, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function DependencyItem({ item, icon }: { item: { id: string, name: string, version: string }, icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-4 p-2 rounded-md bg-background">
            {icon}
            <div className="flex-grow">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">Version: {item.version}</p>
            </div>
        </div>
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
                const res = await fetch(`/api/baselines/${id}`);
                if (!res.ok) throw new Error('Failed to fetch baseline');
                const foundBaseline = await res.json();
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
    
    const isFinalized = ['RELEASED', 'REJECTED', 'ARCHIVED'].includes(baseline.status);

    const compatibilityMatrixItems = baseline.tenants ? [
        ...baseline.tenants.map((t: any) => ({ type: 'Tenant', ...t})),
        ...baseline.tenants.flatMap((t: any) => (t.components || []).map((c: any) => ({ type: 'Component', ...c}))),
        ...baseline.tenants.flatMap((t: any) => (t.applications || []).map((a: any) => ({ type: 'Application', ...a}))),
    ] : [];

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 space-y-6">
                <Card className="w-full max-w-6xl mx-auto">
                    <CardHeader>
                        <CardTitle>Baseline Summary: {baseline.product.name}</CardTitle>
                        <CardDescription>
                            Viewing baseline version <strong>{baseline.product.version}</strong>, created on {format(new Date(baseline.created_at), 'PPP')}.
                        </CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-6">
                        <Separator />
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Specifications ({baseline.specifications.length})</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {baseline.specifications.map((spec: any) => (
                                    <div key={spec.id} className="text-sm p-2 bg-muted rounded-md flex items-center gap-2">
                                       <FileText className="h-4 w-4 text-indigo-500" /> 
                                       <span>{spec.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <Separator />
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Tenants ({baseline.tenants.length})</h3>
                            <div className="space-y-4">
                            {baseline.tenants.map((tenant: any) => (
                                <Card key={tenant.id} className="bg-secondary/50">
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-md flex items-center gap-2">
                                            <Warehouse className="h-5 w-5" /> {tenant.name} - v{tenant.version}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 space-y-2">
                                        <div>
                                            <h4 className="font-medium text-sm">Components ({tenant.components?.length || 0})</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                                            {tenant.components?.map((comp: any) => <DependencyItem key={comp.id} item={comp} icon={<Puzzle className="h-4 w-4 text-green-500" />} />)}
                                            </div>
                                        </div>
                                         <div>
                                            <h4 className="font-medium text-sm">Applications ({tenant.applications?.length || 0})</h4>
                                             <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                                            {tenant.applications?.map((app: any) => <DependencyItem key={app.id} item={app} icon={<AppWindow className="h-4 w-4 text-blue-500" />} />)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            </div>
                        </div>
                        
                        <Separator />
                        <div>
                             <h3 className="text-lg font-semibold mb-2">Consolidated Release Notes</h3>
                             <Textarea 
                                placeholder="Aggregated release notes will be displayed here..." 
                                rows={8}
                                readOnly
                                defaultValue={`- [Tenant] Platform Foundation v1.0.0: Initial release.\n- [Component] Authentication Service v1.3.0: Added multi-factor authentication support.\n- [Application] User Dashboard v2.0.0: Redesigned user interface.`}
                            />
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-lg font-semibold mb-2">Compatibility Matrix</h3>
                            <Card>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Version</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {compatibilityMatrixItems.map((item) => (
                                            <TableRow key={`${item.type}-${item.name}-${item.version}`}>
                                                <TableCell>{item.type}</TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>{item.version}</TableCell>
                                                <TableCell>
                                                    <span className="flex items-center text-green-600">
                                                        <CheckCircle className="h-4 w-4 mr-1" /> Compatible
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </div>

                        <Separator />

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
                            Back to List
                        </Button>
                         <Button asChild disabled={isFinalized}>
                            <Link href={`/release-management/baseline/${id}/validate`}>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Proceed to Validation Pipeline
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
