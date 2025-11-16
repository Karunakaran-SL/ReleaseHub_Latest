
'use client';
import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Product, Specification, CmdbComponent, Deployment } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Package } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { MultiSelectListBox } from '@/components/ui/multi-select-list-box';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { locations } from '@/lib/locations';

interface Hypervisor {
    _id: string;
    name: string;
}

type EditDeploymentState = Partial<Deployment>;

function EditDeploymentPageContent() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [formState, setFormState] = useState<EditDeploymentState>({});
    
    // Data for dropdowns
    const [products, setProducts] = useState<Product[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [hypervisors, setHypervisors] = useState<Hypervisor[]>([]);
    const [allComponents, setAllComponents] = useState<CmdbComponent[]>([]);

    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');

    const countriesInRegion = locations.find(r => r.name === selectedRegion)?.countries || [];
    const zonesInCountry = countriesInRegion.find(c => c.name === selectedCountry)?.zones || [];


    useEffect(() => {
        getUser().then(setUser);
        async function fetchInitialData() {
            setLoading(true);
            try {
                const [deploymentRes, productsRes, specsRes, hypervisorsRes, componentsRes] = await Promise.all([
                    fetch(`/api/deployments/${id}`),
                    fetch('/api/products'),
                    fetch('/api/specifications'),
                    fetch('/api/settings/specifications/hypervisors'),
                    fetch('/api/cmdb/components')
                ]);

                if (!deploymentRes.ok) throw new Error('Failed to fetch deployment data.');
                const deploymentData = await deploymentRes.json();
                setFormState(deploymentData);
                setSelectedRegion(deploymentData.details.region || '');
                setSelectedCountry(deploymentData.details.country || '');
                
                if (!productsRes.ok || !specsRes.ok || !hypervisorsRes.ok || !componentsRes.ok) {
                    throw new Error('Failed to fetch dependency data.');
                }
                setProducts(await productsRes.json());
                setSpecifications(await specsRes.json());
                setHypervisors(await hypervisorsRes.json());
                setAllComponents(await componentsRes.json());

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
                router.push('/fleet-management/deployment');
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData();
    }, [id, router, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, group: 'security' | 'details') => {
        const { id, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [group]: { ...prev[group], [id]: value } as any
        }));
    };
    
    const handleSelectChange = (field: 'productId' | 'specificationId' | 'hypervisorId' | 'details.region' | 'details.country' | 'details.availabilityZone', value: string) => {
        if (field.startsWith('details.')) {
            const detailField = field.split('.')[1];
            setFormState(p => ({ ...p, details: { ...p.details, [detailField]: value } as any }));

            if (detailField === 'region') {
                setSelectedRegion(value);
                setSelectedCountry('');
                 setFormState(p => ({ ...p, details: { ...p.details, country: undefined, availabilityZone: undefined } as any }));
            }
            if (detailField === 'country') {
                setSelectedCountry(value);
                 setFormState(p => ({ ...p, details: { ...p.details, availabilityZone: undefined } as any }));
            }
        } else {
            setFormState(p => ({ ...p, [field]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formState,
                updateComment: 'Updated provisioning details.'
            };
            
            const response = await fetch(`/api/deployments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error(errorData)
                throw new Error(errorData.message || 'Failed to update deployment.');
            }

            toast({ title: 'Success', description: 'Deployment details updated. Package regenerated.' });
            router.push(`/fleet-management/deployment/${id}/view`);
            router.refresh();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !formState.details) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 flex justify-center">
                 <form onSubmit={handleSubmit} className="w-full">
                    <Card className="w-full max-w-4xl mx-auto">
                        <CardHeader>
                            <CardTitle>Update Provisioning Details</CardTitle>
                            <CardDescription>Editing deployment: {formState.details?.deploymentId}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-2">
                                    <Label htmlFor="product-select">Product</Label>
                                    <Select value={formState.productId} onValueChange={(v) => handleSelectChange('productId', v)}>
                                        <SelectTrigger id="product-select"><SelectValue placeholder="Select a product..." /></SelectTrigger>
                                        <SelectContent>{products.map(p => <SelectItem key={p._id} value={p._id}>{p.name} (v{p.version})</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="spec-select">Specification</Label>
                                    <Select value={formState.specificationId} onValueChange={(v) => handleSelectChange('specificationId', v)}>
                                        <SelectTrigger id="spec-select"><SelectValue placeholder="Select a specification..." /></SelectTrigger>
                                        <SelectContent>{specifications.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hypervisor-select">Hypervisor</Label>
                                    <Select value={formState.hypervisorId} onValueChange={(v) => handleSelectChange('hypervisorId', v)}>
                                        <SelectTrigger id="hypervisor-select"><SelectValue placeholder="Select a hypervisor..." /></SelectTrigger>
                                        <SelectContent>{hypervisors.map(h => <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Foundation Components</Label>
                                    <MultiSelectListBox
                                        available={allComponents.filter(c => !(formState.foundationComponentIds || []).includes(c._id)).map(c => ({ id: c._id, label: c.name }))}
                                        chosen={(formState.foundationComponentIds || []).map(id => {
                                            const comp = allComponents.find(c => c._id === id);
                                            return { id: id, label: comp?.name || id };
                                        })}
                                        onMoveToChosen={(ids) => setFormState(p => ({ ...p, foundationComponentIds: [...(p.foundationComponentIds || []), ...ids] }))}
                                        onMoveToAvailable={(ids) => setFormState(p => ({...p, foundationComponentIds: (p.foundationComponentIds || []).filter(id => !ids.includes(id)) }))}
                                        onMoveAllToChosen={() => setFormState(p => ({...p, foundationComponentIds: allComponents.map(c => c._id)}))}
                                        onMoveAllToAvailable={() => setFormState(p => ({...p, foundationComponentIds: []}))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">Security & Access</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="encryptionKey">Encryption Keys</Label>
                                    <Textarea id="encryptionKey" value={formState.security?.encryptionKey || ''} onChange={(e) => handleInputChange(e, 'security')}/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="signingCert">Signing Certificates</Label>
                                    <Textarea id="signingCert" value={formState.security?.signingCert || ''} onChange={(e) => handleInputChange(e, 'security')}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pkiDetails">PKI Details</Label>
                                    <Textarea id="pkiDetails" value={formState.security?.pkiDetails || ''} onChange={(e) => handleInputChange(e, 'security')}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="iamToken">IAM Token</Label>
                                    <Input id="iamToken" value={formState.security?.iamToken || ''} onChange={(e) => handleInputChange(e, 'security')}/>
                                </div>
                            </div>
                             <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">Deployment Details</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="deploymentId">Deployment ID *</Label>
                                    <Input id="deploymentId" value={formState.details?.deploymentId || ''} onChange={(e) => handleInputChange(e, 'details')} disabled/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer">Customer *</Label>
                                    <Input id="customer" value={formState.details?.customer || ''} onChange={(e) => handleInputChange(e, 'details')} required/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="factory">Factory</Label>
                                    <Input id="factory" value={formState.details?.factory || ''} onChange={(e) => handleInputChange(e, 'details')} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                         <Select value={formState.details?.region} onValueChange={(v) => handleSelectChange('details.region', v)}>
                                             <SelectTrigger><SelectValue placeholder="Select Region..." /></SelectTrigger>
                                             <SelectContent>{locations.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
                                         </Select>
                                         <Select value={formState.details?.country} onValueChange={(v) => handleSelectChange('details.country', v)} disabled={!selectedRegion}>
                                             <SelectTrigger><SelectValue placeholder="Select Country..." /></SelectTrigger>
                                             <SelectContent>{countriesInRegion.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                                         </Select>
                                         <Select value={formState.details?.availabilityZone} onValueChange={(v) => handleSelectChange('details.availabilityZone', v)} disabled={!selectedCountry}>
                                             <SelectTrigger><SelectValue placeholder="Select Zone..." /></SelectTrigger>
                                             <SelectContent>{zonesInCountry.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
                                         </Select>
                                     </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerKeyPair">Customer Key Pair</Label>
                                    <Textarea id="customerKeyPair" value={formState.details?.customerKeyPair || ''} onChange={(e) => handleInputChange(e, 'details')} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Package className="mr-2 h-4 w-4" />
                                Save & Regenerate Package
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </DashboardLayout>
    );
}

export default function EditDeploymentSuspensePage() {
    return (
        <Suspense fallback={<DashboardLayout user={null}><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>}>
            <EditDeploymentPageContent />
        </Suspense>
    )
}
