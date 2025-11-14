
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Deployment, Product, Specification, CmdbComponent, UpgradeHistory } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, History } from 'lucide-react';
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
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectListBox } from '@/components/ui/multi-select-list-box';
import { locations } from '@/lib/locations';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const statusColors: Record<string, string> = {
    PROVISIONING: 'bg-yellow-200 text-yellow-800',
    ACTIVE: 'bg-green-200 text-green-800',
    FAILED: 'bg-red-200 text-red-800',
    UPGRADING: 'bg-blue-200 text-blue-800',
    DECOMMISSIONED: 'bg-gray-300 text-gray-900',
};


interface Hypervisor {
    _id: string;
    name: string;
}

export default function ViewDeploymentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    
    // State for data
    const [deployment, setDeployment] = useState<Deployment | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [hypervisors, setHypervisors] = useState<Hypervisor[]>([]);
    const [allComponents, setAllComponents] = useState<CmdbComponent[]>([]);
    const [upgradeHistory, setUpgradeHistory] = useState<UpgradeHistory[]>([]);

    // State for UI control
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formState, setFormState] = useState<Partial<Deployment> & { updateComment?: string }>({});

    // State for location dropdowns
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    
    // State for delete dialog
    const [deleteComment, setDeleteComment] = useState('');
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const countriesInRegion = locations.find(r => r.name === selectedRegion)?.countries || [];
    const zonesInCountry = countriesInRegion.find(c => c.name === selectedCountry)?.zones || [];


    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;

        async function fetchDetails() {
            setLoading(true);
            try {
                const results = await Promise.allSettled([
                    fetch(`/api/deployments/${id}`),
                    fetch('/api/products'),
                    fetch('/api/specifications'),
                    fetch('/api/settings/specifications/hypervisors'),
                    fetch('/api/cmdb/components'),
                    fetch(`/api/upgrade-history/${id}`),
                ]);

                // Deployment data is critical
                if (results[0].status === 'rejected' || !results[0].value.ok) {
                    throw new Error('Failed to fetch deployment details.');
                }
                const deploymentData: Deployment = await results[0].value.json();
                setDeployment(deploymentData);
                setFormState(deploymentData);
                setSelectedRegion(deploymentData.details.region || '');
                setSelectedCountry(deploymentData.details.country || '');

                // Handle other promises gracefully
                if (results[1].status === 'fulfilled' && results[1].value.ok) setProducts(await results[1].value.json());
                else toast({ variant: 'destructive', title: 'Warning', description: 'Could not load products list.' });
                
                if (results[2].status === 'fulfilled' && results[2].value.ok) setSpecifications(await results[2].value.json());
                else toast({ variant: 'destructive', title: 'Warning', description: 'Could not load specifications list.' });
                
                if (results[3].status === 'fulfilled' && results[3].value.ok) setHypervisors(await results[3].value.json());
                else toast({ variant: 'destructive', title: 'Warning', description: 'Could not load hypervisors list.' });

                if (results[4].status === 'fulfilled' && results[4].value.ok) setAllComponents(await results[4].value.json());
                else toast({ variant: 'destructive', title: 'Warning', description: 'Could not load components list.' });
                
                if (results[5].status === 'fulfilled' && results[5].value.ok) setUpgradeHistory(await results[5].value.json());
                // Don't toast for history, it's ok if it's empty

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
                router.push('/fleet-management/deployment');
            } finally {
                setLoading(false);
            }
        }
        fetchDetails();
    }, [id, router, toast]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, group?: 'security' | 'details') => {
        const { id, value } = e.target;
        if (group) {
            setFormState(prev => ({ ...prev, [group]: { ...prev[group], [id]: value } }));
        } else {
            setFormState(prev => ({ ...prev, [id]: value }));
        }
    };
    
    const handleSelectChange = (field: 'productId' | 'specificationId' | 'hypervisorId' | 'status' | 'details.region' | 'details.country' | 'details.availabilityZone', value: string) => {
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

    const handleSave = async () => {
        if (!formState.updateComment) {
            toast({ variant: 'destructive', title: 'Error', description: 'An update reason is required for auditing.' });
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/deployments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState),
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 console.error("Update error:", errorData);
                 throw new Error(errorData.message || 'Failed to update deployment.');
            }

            const updatedDeployment = await response.json();
            setDeployment(updatedDeployment);
            setFormState(updatedDeployment);
            setIsEditing(false);
            toast({ title: 'Success', description: 'Deployment updated successfully.' });
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleCancelEdit = () => {
        if (deployment) setFormState(deployment);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (deleteConfirmationText !== 'delete' || !deleteComment) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please type "delete" and provide a comment to confirm deletion.' });
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/deployments/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: deleteComment }),
            });

            if (response.ok) {
                toast({ title: "Success", description: "Deployment deleted successfully." });
                router.push('/fleet-management/deployment');
                router.refresh();
            } else {
                const errorData = await response.json();
                toast({ variant: "destructive", title: "Error", description: errorData.message || "Failed to delete deployment." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }

    if (!deployment) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><p>Deployment not found.</p></div></DashboardLayout>;
    }

    const isDeleteButtonDisabled = deleteConfirmationText !== 'delete' || !deleteComment || isDeleting;

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>View Deployment: {deployment.details.deploymentId}</CardTitle>
                                <CardDescription>For customer: {deployment.details.customer}</CardDescription>
                            </div>
                            {isEditing ? (
                                 <Select value={formState.status} onValueChange={(v) => handleSelectChange('status', v)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Set status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(statusColors).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Badge className={cn("text-base", statusColors[deployment.status] || 'bg-gray-200')}>
                                    {deployment.status}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Configuration</h3>
                            <div><Label>Product</Label>
                                <Select value={formState.productId} onValueChange={v => handleSelectChange('productId', v)} disabled={!isEditing}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{products.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                             <div><Label>Specification</Label>
                                <Select value={formState.specificationId} onValueChange={v => handleSelectChange('specificationId', v)} disabled={!isEditing}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{specifications.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                             <div><Label>Hypervisor</Label>
                                <Select value={formState.hypervisorId} onValueChange={v => handleSelectChange('hypervisorId', v)} disabled={!isEditing}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{hypervisors.map(h => <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Foundation Components</Label>
                                 <MultiSelectListBox
                                    available={allComponents.filter(c => !(formState.foundationComponentIds || []).includes(c._id)).map(c => ({ id: c._id, label: c.name }))}
                                    chosen={(formState.foundationComponentIds || []).map(id => ({ id: id, label: allComponents.find(c=>c._id === id)?.name || 'Unknown' }))}
                                    onMoveToChosen={(ids) => setFormState(p => ({ ...p, foundationComponentIds: [...(p.foundationComponentIds || []), ...ids] }))}
                                    onMoveToAvailable={(ids) => setFormState(p => ({...p, foundationComponentIds: (p.foundationComponentIds || []).filter(id => !ids.includes(id)) }))}
                                    onMoveAllToChosen={() => setFormState(p => ({...p, foundationComponentIds: allComponents.map(c => c._id)}))}
                                    onMoveAllToAvailable={() => setFormState(p => ({...p, foundationComponentIds: []}))}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                             <h3 className="font-semibold text-lg border-b pb-2">Details</h3>
                             <div><Label>Deployment ID</Label><Input value={formState.details?.deploymentId || ''} disabled /></div>
                             <div><Label>Customer</Label><Input id="customer" value={formState.details?.customer || ''} onChange={(e) => handleInputChange(e, 'details')} disabled={!isEditing} /></div>
                             <div><Label>Factory</Label><Input id="factory" value={formState.details?.factory || ''} onChange={(e) => handleInputChange(e, 'details')} disabled={!isEditing} /></div>
                             <div>
                                <Label>Location</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                     <Select value={formState.details?.region} onValueChange={(v) => handleSelectChange('details.region', v)} disabled={!isEditing}>
                                         <SelectTrigger><SelectValue placeholder="Select Region..." /></SelectTrigger>
                                         <SelectContent>{locations.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
                                     </Select>
                                     <Select value={formState.details?.country} onValueChange={(v) => handleSelectChange('details.country', v)} disabled={!isEditing || !selectedRegion}>
                                         <SelectTrigger><SelectValue placeholder="Select Country..." /></SelectTrigger>
                                         <SelectContent>{countriesInRegion.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                                     </Select>
                                     <Select value={formState.details?.availabilityZone} onValueChange={(v) => handleSelectChange('details.availabilityZone', v)} disabled={!isEditing || !selectedCountry}>
                                         <SelectTrigger><SelectValue placeholder="Select Zone..." /></SelectTrigger>
                                         <SelectContent>{zonesInCountry.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
                                     </Select>
                                 </div>
                             </div>
                             <div><Label>Created By</Label><Input value={`${deployment.createdBy} on ${format(new Date(deployment.createdAt), 'PPP')}`} disabled /></div>
                        </div>
                         <div className="md:col-span-2 space-y-4">
                             <h3 className="font-semibold text-lg border-b pb-2">Security Details</h3>
                             <div><Label>Encryption Key</Label><Textarea id="encryptionKey" value={formState.security?.encryptionKey || ''} onChange={(e) => handleInputChange(e, 'security')} disabled={!isEditing} /></div>
                             <div><Label>Signing Certificate</Label><Textarea id="signingCert" value={formState.security?.signingCert || ''} onChange={(e) => handleInputChange(e, 'security')} disabled={!isEditing} /></div>
                             <div><Label>PKI Details</Label><Textarea id="pkiDetails" value={formState.security?.pkiDetails || ''} onChange={(e) => handleInputChange(e, 'security')} disabled={!isEditing} /></div>
                             <div><Label>IAM Token</Label><Input id="iamToken" value={formState.security?.iamToken || ''} onChange={(e) => handleInputChange(e, 'security')} disabled={!isEditing} /></div>
                        </div>
                         <div className="md:col-span-2 space-y-4">
                             <h3 className="font-semibold text-lg border-b pb-2">Deployment Package</h3>
                              <div className="p-4 bg-muted rounded-lg text-left">
                                <p className="font-semibold">Package Contents:</p>
                                <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                                    <li>Installer binaries for selected components</li>
                                    <li>Site-specific configuration files</li>
                                    <li>Encryption keys and certificates</li>
                                    <li>Deployment runbook and release notes</li>
                                </ul>
                                <p className="mt-4 font-mono text-xs bg-background p-2 rounded">
                                    Package Location: /var/deploy/packages/{deployment.details?.deploymentId || 'deployment-id'}.tar.gz
                                </p>
                            </div>
                        </div>
                         {isEditing && (
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="updateComment" className="text-base font-semibold">Update Reason *</Label>
                                <Textarea id="updateComment" value={formState.updateComment || ''} onChange={(e) => handleInputChange(e)} placeholder="Provide a reason for this update for auditing purposes." />
                            </div>
                        )}
                    </CardContent>
                     <CardFooter className="flex justify-end gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                                <Button onClick={handleSave} disabled={isSubmitting || !formState.updateComment}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Re-Generate Package
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(true)}>UPDATE</Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">DELETE</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this deployment.
                                            Please type <strong>delete</strong> to confirm.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="delete-comment">Reason for Deletion *</Label>
                                                <Textarea 
                                                    id="delete-comment"
                                                    placeholder="Provide a comment for auditing purposes."
                                                    value={deleteComment}
                                                    onChange={(e) => setDeleteComment(e.target.value)}
                                                />
                                            </div>
                                             <div className="space-y-2">
                                                <Label htmlFor="delete-confirmation">Type "delete" to confirm *</Label>
                                                <Input 
                                                    id="delete-confirmation"
                                                    value={deleteConfirmationText}
                                                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={handleDelete}
                                            disabled={isDeleteButtonDisabled}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                             {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Continue
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                    </CardFooter>
                </Card>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                             <div className="flex items-center gap-2 text-lg font-semibold">
                                <History className="h-5 w-5" />
                                Upgrade History
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <Card className="mt-4">
                               <CardContent className="p-0">
                                   <Table>
                                       <TableHeader>
                                           <TableRow>
                                               <TableHead>Date</TableHead>
                                               <TableHead>Product</TableHead>
                                               <TableHead>Target Spec</TableHead>
                                               <TableHead>Status</TableHead>
                                               <TableHead>Initiated By</TableHead>
                                           </TableRow>
                                       </TableHeader>
                                       <TableBody>
                                           {upgradeHistory.length > 0 ? upgradeHistory.map(h => (
                                               <TableRow key={h._id}>
                                                   <TableCell>{format(new Date(h.initiatedAt), 'PPp')}</TableCell>
                                                   <TableCell>{products.find(p => p._id === h.productId)?.name || h.productId}</TableCell>
                                                   <TableCell>{specifications.find(s => s._id === h.targetSpecificationId)?.name || h.targetSpecificationId}</TableCell>
                                                   <TableCell>{h.status}</TableCell>
                                                   <TableCell>{h.initiatedBy}</TableCell>
                                               </TableRow>
                                           )) : (
                                               <TableRow>
                                                   <TableCell colSpan={5} className="text-center h-24">No upgrade history found for this deployment.</TableCell>
                                               </TableRow>
                                           )}
                                       </TableBody>
                                   </Table>
                               </CardContent>
                           </Card>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </main>
        </DashboardLayout>
    );
}

