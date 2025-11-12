
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Product, Specification, CmdbComponent, Deployment } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, ArrowLeft, Key, Shield, FileText, Anchor } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MultiSelectListBox, type Option } from '@/components/ui/multi-select-list-box';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Hypervisor {
    _id: string;
    name: string;
}

type WizardData = Partial<Deployment>;

export default function NewDeploymentWizardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [wizardData, setWizardData] = useState<WizardData>({});
    
    // Data for dropdowns
    const [products, setProducts] = useState<Product[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [hypervisors, setHypervisors] = useState<Hypervisor[]>([]);
    const [allComponents, setAllComponents] = useState<CmdbComponent[]>([]);


    useEffect(() => {
        getUser().then(setUser);
        async function fetchInitialData() {
            try {
                const [productsRes, specsRes, hypervisorsRes, componentsRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/specifications'),
                    fetch('/api/settings/specifications/hypervisors'),
                    fetch('/api/cmdb/components')
                ]);
                if (!productsRes.ok || !specsRes.ok || !hypervisorsRes.ok || !componentsRes.ok) {
                    throw new Error('Failed to fetch initial data.');
                }
                setProducts(await productsRes.json());
                setSpecifications(await specsRes.json());
                setHypervisors(await hypervisorsRes.json());
                setAllComponents(await componentsRes.json());

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData();
    }, [toast]);
    
    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, group: 'security' | 'details') => {
        const { id, value } = e.target;
        setWizardData(prev => ({
            ...prev,
            [group]: {
                ...prev[group],
                [id]: value
            }
        }));
    };

    const isNextDisabled = () => {
        switch (step) {
            case 1: return !wizardData.productId || !wizardData.specificationId;
            case 2: return !wizardData.hypervisorId;
            case 3: return !wizardData.foundationComponentIds || wizardData.foundationComponentIds.length === 0;
            case 4: return false; // Optional fields
            case 5: return !wizardData.details?.deploymentId || !wizardData.details?.customer;
            default: return false;
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 1: return "Step 1: Select Product and Specification";
            case 2: return "Step 2: Select Hypervisor or Platform Type";
            case 3: return "Step 3: Select Default Platform Foundation";
            case 4: return "Step 4: Enter Deployment Security and Access Details";
            case 5: return "Step 5: Enter Deployment Details";
            case 6: return "Step 6: Review Deployment Summary";
            case 7: return "Step 7: Create Deployment Package";
            default: return "New Deployment";
        }
    };
    
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/deployments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(wizardData),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error(errorData)
                throw new Error(errorData.message || 'Failed to create deployment.');
            }

            toast({ title: 'Success', description: 'New deployment initiated successfully.' });
            router.push('/fleet-management/deployment');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        if (loading) return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;

        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="product-select">Product</Label>
                            <Select value={wizardData.productId} onValueChange={(v) => setWizardData(p => ({...p, productId: v}))}>
                                <SelectTrigger id="product-select"><SelectValue placeholder="Select a product..." /></SelectTrigger>
                                <SelectContent>{products.map(p => <SelectItem key={p._id} value={p._id}>{p.name} (v{p.version})</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="spec-select">Specification</Label>
                            <Select value={wizardData.specificationId} onValueChange={(v) => setWizardData(p => ({...p, specificationId: v}))}>
                                <SelectTrigger id="spec-select"><SelectValue placeholder="Select a specification..." /></SelectTrigger>
                                <SelectContent>{specifications.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            case 2:
                 return (
                    <div className="space-y-2">
                        <Label htmlFor="hypervisor-select">Hypervisor / Platform Type</Label>
                        <Select value={wizardData.hypervisorId} onValueChange={(v) => setWizardData(p => ({...p, hypervisorId: v}))}>
                            <SelectTrigger id="hypervisor-select"><SelectValue placeholder="Select a hypervisor..." /></SelectTrigger>
                            <SelectContent>{hypervisors.map(h => <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-2">
                        <Label>Select Default Platform Foundation</Label>
                        <p className="text-sm text-muted-foreground">Select the foundational components for this deployment.</p>
                        <MultiSelectListBox
                            available={allComponents.filter(c => !(wizardData.foundationComponentIds || []).includes(c._id)).map(c => ({ id: c._id, label: c.name }))}
                            chosen={(wizardData.foundationComponentIds || []).map(id => {
                                const comp = allComponents.find(c => c._id === id);
                                return { id: id, label: comp?.name || id };
                            })}
                            onMoveToChosen={(ids) => setWizardData(p => ({ ...p, foundationComponentIds: [...(p.foundationComponentIds || []), ...ids] }))}
                            onMoveToAvailable={(ids) => setWizardData(p => ({...p, foundationComponentIds: (p.foundationComponentIds || []).filter(id => !ids.includes(id)) }))}
                            onMoveAllToChosen={() => setWizardData(p => ({...p, foundationComponentIds: allComponents.map(c => c._id)}))}
                            onMoveAllToAvailable={() => setWizardData(p => ({...p, foundationComponentIds: []}))}
                        />
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="encryptionKey">Encryption Keys</Label>
                            <Textarea id="encryptionKey" placeholder="Paste encryption keys..." value={wizardData.security?.encryptionKey || ''} onChange={(e) => handleInputChange(e, 'security')}/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="signingCert">Signing Certificates</Label>
                            <Textarea id="signingCert" placeholder="Paste signing certificates..." value={wizardData.security?.signingCert || ''} onChange={(e) => handleInputChange(e, 'security')}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pkiDetails">PKI Details</Label>
                            <Textarea id="pkiDetails" placeholder="Enter PKI details..." value={wizardData.security?.pkiDetails || ''} onChange={(e) => handleInputChange(e, 'security')}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="iamToken">IAM Token</Label>
                            <Input id="iamToken" placeholder="Enter IAM token..." value={wizardData.security?.iamToken || ''} onChange={(e) => handleInputChange(e, 'security')}/>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="deploymentId">Deployment ID *</Label>
                            <Input id="deploymentId" value={wizardData.details?.deploymentId || ''} onChange={(e) => handleInputChange(e, 'details')} required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customer">Customer *</Label>
                            <Input id="customer" value={wizardData.details?.customer || ''} onChange={(e) => handleInputChange(e, 'details')} required/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="factory">Factory</Label>
                            <Input id="factory" value={wizardData.details?.factory || ''} onChange={(e) => handleInputChange(e, 'details')} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" value={wizardData.details?.location || ''} onChange={(e) => handleInputChange(e, 'details')} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="customerKeyPair">Customer Key Pair</Label>
                            <Textarea id="customerKeyPair" value={wizardData.details?.customerKeyPair || ''} onChange={(e) => handleInputChange(e, 'details')} />
                        </div>
                    </div>
                );
            case 6:
                const product = products.find(p => p._id === wizardData.productId);
                const spec = specifications.find(s => s._id === wizardData.specificationId);
                const hypervisor = hypervisors.find(h => h._id === wizardData.hypervisorId);
                const components = (wizardData.foundationComponentIds || []).map(id => allComponents.find(c => c._id === id)?.name).filter(Boolean);
                return (
                    <div className="space-y-6 text-sm">
                        <h3 className="text-lg font-semibold">Please review your selections:</h3>
                        <div><strong className="w-32 inline-block">Product:</strong> {product?.name} (v{product?.version})</div>
                        <div><strong className="w-32 inline-block">Specification:</strong> {spec?.name}</div>
                        <div><strong className="w-32 inline-block">Hypervisor:</strong> {hypervisor?.name}</div>
                        <div><strong className="w-32 inline-block">Deployment ID:</strong> {wizardData.details?.deploymentId}</div>
                        <div><strong className="w-32 inline-block">Customer:</strong> {wizardData.details?.customer}</div>
                        <div><strong className="w-32 inline-block">Foundation:</strong> {components.join(', ')}</div>
                    </div>
                );
            case 7:
                 return (
                    <div className="text-center space-y-4">
                        <h3 className="text-xl font-bold">Ready to Create Package</h3>
                        <p className="text-muted-foreground">A foundational deployment package will be generated with instructions and release notes based on your configuration.</p>
                        <div className="p-8 bg-muted rounded-lg">
                             <p className="text-sm">Folder paths for deployment reports will be displayed here after creation.</p>
                        </div>
                    </div>
                );

            default:
                return <p>End of wizard.</p>;
        }
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 flex justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>New Deployment Wizard</CardTitle>
                        <CardDescription>{getStepDescription()}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>{renderStepContent()}</CardContent>

                    <CardFooter className="flex justify-between">
                         <div>
                            {step > 1 && (
                                <Button variant="outline" onClick={handleBack} disabled={loading}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            )}
                         </div>
                         <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.back()} disabled={loading}>Cancel</Button>
                            {step < 7 ? (
                                <Button onClick={handleNext} disabled={isNextDisabled()}>
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Finish & Create Package
                                </Button>
                            )}
                         </div>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
