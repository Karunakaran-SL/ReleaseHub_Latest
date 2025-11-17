
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, License, Product, CmdbTenant, CmdbComponent, CmdbApplication } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, Box, Warehouse, Puzzle, AppWindow } from 'lucide-react';
import Link from 'next/link';

export default function ViewLicensePage() {
    const [user, setUser] = useState<User | null>(null);
    const [license, setLicense] = useState<License | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [products, setProducts] = useState<Product[]>([]);
    const [tenants, setTenants] = useState<CmdbTenant[]>([]);
    const [components, setComponents] = useState<CmdbComponent[]>([]);
    const [applications, setApplications] = useState<CmdbApplication[]>([]);

    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;

        setLoading(true);
        async function fetchData() {
            try {
                const [licenseRes, productsRes, tenantsRes, componentsRes, applicationsRes] = await Promise.all([
                    fetch(`/api/licenses/usage/${id}`),
                    fetch('/api/products'),
                    fetch('/api/cmdb/tenants'),
                    fetch('/api/cmdb/components'),
                    fetch('/api/cmdb/applications')
                ]);

                if (!licenseRes.ok) throw new Error("Failed to fetch license details");
                
                setLicense(await licenseRes.json());
                setProducts(await productsRes.json());
                setTenants(await tenantsRes.json());
                setComponents(await componentsRes.json());
                setApplications(await applicationsRes.json());

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load data.' });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, toast]);
    
    const getUsedByItems = () => {
        if (!license) return [];
        const items = [];
        if (license.products) {
            items.push(...products.filter(p => license.products!.includes(p._id)).map(p => ({ ...p, type: 'Product', icon: <Box className="h-5 w-5" /> })));
        }
        if (license.tenants) {
            items.push(...tenants.filter(t => license.tenants!.includes(t._id)).map(t => ({ ...t, type: 'Tenant', icon: <Warehouse className="h-5 w-5" /> })));
        }
        if (license.components) {
            items.push(...components.filter(c => license.components!.includes(c._id)).map(c => ({ ...c, type: 'Component', icon: <Puzzle className="h-5 w-5" /> })));
        }
        if (license.apps) {
            items.push(...applications.filter(a => license.apps!.includes(a._id)).map(a => ({ ...a, type: 'Application', icon: <AppWindow className="h-5 w-5" /> })));
        }
        return items;
    };
    
    const usedBy = getUsedByItems();

    if (loading) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }

    if (!license) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><p>License not found.</p></div></DashboardLayout>;
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <Card>
                    <CardHeader>
                        <CardTitle>View License: {license.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Details</h3>
                            <div><Label>Name</Label><Input value={license.name} disabled /></div>
                            <div><Label>Type</Label><Input value={license.type} disabled /></div>
                            <div><Label>Owner</Label><Input value={license.owner} disabled /></div>
                            <div><Label>Status</Label><Input value={license.status} disabled /></div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Impact Analysis (Used By)</h3>
                            <Card>
                                <CardContent className="p-4 max-h-96 overflow-y-auto">
                                    {usedBy.length > 0 ? (
                                        <ul className="space-y-2">
                                            {usedBy.map(item => (
                                                <li key={item._id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                                                    {item.icon}
                                                    <div className="flex-1">
                                                        <p className="font-semibold">{item.name}</p>
                                                        <p className="text-sm text-muted-foreground">{item.type} - v{item.version || 'N/A'}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-8">This license is not currently used by any tracked entities.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                     <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => router.back()}>Back</Button>
                        <Button asChild>
                           <Link href={`/license/usage/${id}/edit`}>Edit</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
