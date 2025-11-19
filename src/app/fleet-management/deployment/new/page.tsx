
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
import { Loader2, ArrowRight, ArrowLeft, CheckCircle, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { locations } from '@/lib/locations';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface Hypervisor {
    _id: string;
    name: string;
}

interface PlatformFoundation {
    _id: string;
    name: string;
    specification?: {
        _id: string;
        id: string;
        name: string;
    };
}

type WizardData = Partial<Omit<Deployment, '_id' | 'createdBy' | 'createdAt' | 'status' | 'foundationComponentIds'>> & {
    foundationId?: string;
    foundationComponentIds?: string[];
};

export default function NewDeploymentWizardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [wizardData, setWizardData] = useState<WizardData>({});
    const [finalDeployment, setFinalDeployment] = useState<Deployment | null>(null);
    
    // Data for dropdowns
    const [products, setProducts] = useState<Product[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [hypervisors, setHypervisors] = useState<Hypervisor[]>([]);
    const [platformFoundations, setPlatformFoundations] = useState<PlatformFoundation[]>([]);

    // State for cascading location dropdowns
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');

    const countriesInRegion = locations.find(r => r.name === selectedRegion)?.countries || [];
    const zonesInCountry = countriesInRegion.find(c => c.name === selectedCountry)?.zones || [];

    useEffect(() => {
        getUser().then(setUser);
        async function fetchInitialData() {
            try {
                const [productsRes, specsRes, hypervisorsRes, foundationsRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/specifications'),
                    fetch('/api/settings/specifications/hypervisors'),
                    fetch('/api/platform-foundations')
                ]);
                if (!productsRes.ok || !specsRes.ok || !hypervisorsRes.ok || !foundationsRes.ok) {
                    throw new Error('Failed to fetch initial data.');
                }
                setProducts(await productsRes.json());
                setSpecifications(await specsRes.json());
                setHypervisors(await hypervisorsRes.json());
                setPlatformFoundations(await foundationsRes.json());

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
    
    const handleSelectChange = (field: 'productId' | 'specificationId' | 'hypervisorId' | 'details.region' | 'details.country' | 'details.availabilityZone' | 'foundationId', value: string) => {
        if (field.startsWith('details.')) {
            const detailField = field.split('.')[1];
            setWizardData(p => ({ ...p, details: { ...p.details, [detailField]: value } as any }));

            if (detailField === 'region') {
                setSelectedRegion(value);
                setSelectedCountry('');
                 setWizardData(p => ({ ...p, details: { ...p.details, country: undefined, availabilityZone: undefined } as any }));
            }
            if (detailField === 'country') {
                setSelectedCountry(value);
                 setWizardData(p => ({ ...p, details: { ...p.details, availabilityZone: undefined } as any }));
            }
        } else {
            setWizardData(p => ({ ...p, [field]: value }));
            if (field === 'foundationId') {
                 const selectedFoundation = platformFoundations.find(f => f._id === value);
                 const foundationComponents = (selectedFoundation as any)?.kubernetes?.workerNodes?.map((n:any) => n.label) || [];
                 setWizardData(p => ({ ...p, foundationComponentIds: foundationComponents }));
            }
        }
    };

    const isNextDisabled = () => {
        switch (step) {
            case 1: return !wizardData.productId || !wizardData.specificationId;
            case 2: return !wizardData.hypervisorId;
            case 3: return !wizardData.foundationId;
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
            case 8: return "Step 8: Deployment Provisioning Complete";
            default: return "New Deployment";
        }
    };
    
    const handleSubmit = async () => {
        setLoading(true);
        try {
            // foundationId is internal to the wizard, we need to extract componentIds from it
            const { foundationId, ...payload } = wizardData;

            const response = await fetch('/api/deployments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error(errorData)
                throw new Error(errorData.message || 'Failed to create deployment.');
            }

            const newDeployment = await response.json();
            setFinalDeployment(newDeployment);
            setStep(8); // Move to the final summary step
            toast({ title: 'Success', description: 'New deployment initiated successfully.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        if (loading && step === 1) return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;

        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="product-select">Product</Label>
                            <Select value={wizardData.productId} onValueChange={(v) => handleSelectChange('productId', v)}>
                                <SelectTrigger id="product-select"><SelectValue placeholder="Select a product..." /></SelectTrigger>
                                <SelectContent>{products.map(p => <SelectItem key={p._id} value={p._id}>{p.name} (v{p.version})</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="spec-select">Specification</Label>
                            <Select value={wizardData.specificationId} onValueChange={(v) => handleSelectChange('specificationId', v)}>
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
                        <Select value={wizardData.hypervisorId} onValueChange={(v) => handleSelectChange('hypervisorId', v)}>
                            <SelectTrigger id="hypervisor-select"><SelectValue placeholder="Select a hypervisor..." /></SelectTrigger>
                            <SelectContent>{hypervisors.map(h => <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                );
            case 3:
                const filteredFoundations = platformFoundations.filter(f => f.specification?._id === wizardData.specificationId);
                return (
                    <div className="space-y-4">
                        <Label>Select Default Platform Foundation</Label>
                        <p className="text-sm text-muted-foreground">Select one foundational configuration for this deployment.</p>
                        <RadioGroup value={wizardData.foundationId} onValueChange={(v) => handleSelectChange('foundationId', v)} className="space-y-2">
                            {filteredFoundations.length > 0 ? (
                                filteredFoundations.map(foundation => (
                                    <Label key={foundation._id} htmlFor={foundation._id} className={cn("flex items-center gap-4 border rounded-md p-4 cursor-pointer hover:bg-accent", {
                                        'bg-accent border-primary': wizardData.foundationId === foundation._id
                                    })}>
                                        <RadioGroupItem value={foundation._id} id={foundation._id} />
                                        <span>{foundation.name}</span>
                                    </Label>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground p-4">No compatible platform foundations found for the selected specification.</p>
                            )}
                        </RadioGroup>
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
                            <Label>Location</Label>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                 <Select value={wizardData.details?.region} onValueChange={(v) => handleSelectChange('details.region', v)}>
                                     <SelectTrigger><SelectValue placeholder="Select Region..." /></SelectTrigger>
                                     <SelectContent>{locations.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
                                 </Select>
                                 <Select value={wizardData.details?.country} onValueChange={(v) => handleSelectChange('details.country', v)} disabled={!selectedRegion}>
                                     <SelectTrigger><SelectValue placeholder="Select Country..." /></SelectTrigger>
                                     <SelectContent>{countriesInRegion.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                                 </Select>
                                 <Select value={wizardData.details?.availabilityZone} onValueChange={(v) => handleSelectChange('details.availabilityZone', v)} disabled={!selectedCountry}>
                                     <SelectTrigger><SelectValue placeholder="Select Zone..." /></SelectTrigger>
                                     <SelectContent>{zonesInCountry.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
                                 </Select>
                             </div>
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
                const foundation = platformFoundations.find(f => f._id === wizardData.foundationId);
                return (
                    <div className="space-y-6 text-sm">
                        <h3 className="text-lg font-semibold">Please review your selections:</h3>
                        <div><strong className="w-32 inline-block">Product:</strong> {product?.name} (v{product?.version})</div>
                        <div><strong className="w-32 inline-block">Specification:</strong> {spec?.name}</div>
                        <div><strong className="w-32 inline-block">Hypervisor:</strong> {hypervisor?.name}</div>
                        <div><strong className="w-32 inline-block">Foundation:</strong> {foundation?.name}</div>
                        <div><strong className="w-32 inline-block">Deployment ID:</strong> {wizardData.details?.deploymentId}</div>
                        <div><strong className="w-32 inline-block">Customer:</strong> {wizardData.details?.customer}</div>
                        <div><strong className="w-32 inline-block">Location:</strong> {`${wizardData.details?.region || ''} / ${wizardData.details?.country || ''} / ${wizardData.details?.availabilityZone || ''}`}</div>
                    </div>
                );
            case 7:
                 const finalProduct = products.find(p => p._id === wizardData.productId);
                 return (
                    <div className="text-center space-y-4">
                        <h3 className="text-xl font-bold">Ready to Create Package</h3>
                        <p className="text-muted-foreground">A foundational deployment package for <strong>{finalProduct?.name}</strong> will be generated with instructions and release notes based on your configuration.</p>
                        <div className="p-8 bg-muted rounded-lg text-left">
                            <p className="font-semibold">Package Contents:</p>
                            <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                                <li>Installer binaries for selected components</li>
                                <li>Site-specific configuration files</li>
                                <li>Encryption keys and certificates</li>
                                <li>Deployment runbook and release notes</li>
                            </ul>
                            <p className="mt-4 font-mono text-xs bg-background p-2 rounded">
                                Package Location: /var/deploy/packages/{wizardData.details?.deploymentId || 'deployment-id'}.tar.gz
                            </p>
                        </div>
                    </div>
                );
            case 8:
                return (
                    <div className="text-center space-y-4 p-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                        <h3 className="text-2xl font-bold">Deployment Provisioning Started</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            The new deployment for <strong>{finalDeployment?.details.customer}</strong> is now being provisioned. You can monitor its status on the main dashboard.
                        </p>
                        <div className="p-4 bg-muted rounded-lg text-left space-y-2">
                             <p className="text-sm font-mono"><strong className="text-muted-foreground">Deployment ID:</strong> {finalDeployment?.details.deploymentId}</p>
                             <p className="text-sm font-mono"><strong className="text-muted-foreground">Status:</strong> {finalDeployment?.status}</p>
                             <p className="text-sm font-mono"><strong className="text-muted-foreground">Package Location:</strong> /var/deploy/packages/{finalDeployment?.details.deploymentId}.tar.gz</p>
                        </div>
                    </div>
                )

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
                            {step > 1 && step < 8 && (
                                <Button variant="outline" onClick={handleBack} disabled={loading}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            )}
                         </div>
                         <div className="flex gap-2">
                            {step < 8 && <Button variant="outline" onClick={() => router.push('/fleet-management/deployment')} disabled={loading}>Cancel</Button>}
                            
                            {step < 7 ? (
                                <Button onClick={handleNext} disabled={isNextDisabled()}>
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : step === 7 ? (
                                <Button onClick={handleSubmit} disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
                                    Finish & Create Package
                                </Button>
                            ) : (
                                <Button onClick={() => router.push('/fleet-management/deployment')}>
                                    Return to Dashboard
                                </Button>
                            )}
                         </div>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
