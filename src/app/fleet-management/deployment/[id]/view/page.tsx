
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Deployment, Product, Specification, CmdbComponent, UpgradeHistory, Baseline, DeploymentSummary, UpgradeSummary } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, History, Edit, Package, FileUp, Info } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const statusColors: Record<string, string> = {
    PROVISIONING: 'bg-yellow-200 text-yellow-800',
    ACTIVE: 'bg-green-200 text-green-800',
    FAILED: 'bg-red-200 text-red-800',
    UPGRADING: 'bg-blue-200 text-blue-800',
    UPGRADE_APPROVAL: 'bg-orange-200 text-orange-800',
    DECOMMISSIONED: 'bg-gray-300 text-gray-900',
    SCHEDULED: 'bg-blue-200 text-blue-800',
    COMPLETED: 'bg-green-200 text-green-800',
};

interface Hypervisor {
    _id: string;
    name: string;
}

function SummaryCard({ title, summary, reportUploadPath }: { title: string, summary: any, reportUploadPath?: string }) {
    if (!summary) return null;

    const isUpgrade = !!summary.targetSpecificationId;

    return (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Info className="h-5 w-5"/>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm bg-muted/50 p-4 rounded-b-lg">
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <p className="font-mono text-xs break-all">Package: {summary.packageLocation}</p>
                </div>
                 <div className="flex items-center gap-2">
                    <FileUp className="h-4 w-4 text-muted-foreground" />
                    <p className="font-mono text-xs break-all">Report: {reportUploadPath}</p>
                </div>
                <p><strong className="text-muted-foreground w-24 inline-block">ID:</strong> {summary.deploymentId}</p>
                <p><strong className="text-muted-foreground w-24 inline-block">Status:</strong> {summary.status}</p>
                {isUpgrade && (
                    <p><strong className="text-muted-foreground w-24 inline-block">Target Spec:</strong> {summary.targetSpecificationId}</p>
                )}
            </CardContent>
        </Card>
    )
}

export default function ViewDeploymentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [deployment, setDeployment] = useState<Deployment | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [hypervisors, setHypervisors] = useState<Hypervisor[]>([]);
    const [allComponents, setAllComponents] = useState<CmdbComponent[]>([]);
    const [upgradeHistory, setUpgradeHistory] = useState<UpgradeHistory[]>([]);
    const [baselines, setBaselines] = useState<Baseline[]>([]);
    
    const [deleteComment, setDeleteComment] = useState('');
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [selectedHistory, setSelectedHistory] = useState<UpgradeHistory | null>(null);

    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;

        async function fetchAllData() {
            setLoading(true);
            try {
                const results = await Promise.allSettled([
                    fetch(`/api/deployments/${id}`),
                    fetch('/api/products'),
                    fetch('/api/specifications'),
                    fetch('/api/settings/specifications/hypervisors'),
                    fetch('/api/cmdb/components'),
                    fetch(`/api/upgrade-history/${id}`),
                    fetch('/api/baselines'),
                ]);

                const [
                    deploymentResult,
                    productsResult,
                    specsResult,
                    hypervisorsResult,
                    componentsResult,
                    historyResult,
                    baselinesResult
                ] = results;

                if (deploymentResult.status === 'fulfilled' && deploymentResult.value.ok) {
                    setDeployment(await deploymentResult.value.json());
                } else {
                    throw new Error('Failed to fetch deployment details.');
                }
                
                if (productsResult.status === 'fulfilled' && productsResult.value.ok) setProducts(await productsResult.value.json());
                if (specsResult.status === 'fulfilled' && specsResult.value.ok) setSpecifications(await specsResult.value.json());
                if (hypervisorsResult.status === 'fulfilled' && hypervisorsResult.value.ok) setHypervisors(await hypervisorsResult.value.json());
                if (componentsResult.status === 'fulfilled' && componentsResult.value.ok) setAllComponents(await componentsResult.value.json());
                if (baselinesResult.status === 'fulfilled' && baselinesResult.value.ok) setBaselines(await baselinesResult.value.json());
                if (historyResult.status === 'fulfilled' && historyResult.value.ok) setUpgradeHistory(await historyResult.value.json());

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
                router.push('/fleet-management/deployment');
            } finally {
                 setLoading(false);
            }
        }
        fetchAllData();
    }, [id, router, toast]);
    
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
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete deployment.");
            }
            toast({ title: "Success", description: "Deployment deleted successfully." });
            router.push('/fleet-management/deployment');
            router.refresh();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsDeleting(false);
        }
    };
    
    const displayData = useMemo(() => {
        if (!deployment) return null;

        return {
            productName: products.find(p => p._id === deployment.productId)?.name || 'Unknown Product',
            specName: specifications.find(s => s._id === deployment.specificationId)?.name || 'Unknown Spec',
            hypervisorName: hypervisors.find(h => h._id === deployment.hypervisorId)?.name || 'Unknown Hypervisor',
            foundationComponentNames: deployment.foundationComponentIds?.map(id => allComponents.find(c => c._id === id)?.name || id).join(', ') || 'N/A',
        }
    }, [deployment, products, specifications, hypervisors, allComponents]);


    if (loading || !deployment || !displayData) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }
    
    const isDeleteButtonDisabled = deleteConfirmationText !== 'delete' || !deleteComment || isDeleting;
    const latestUpgradeHistory = upgradeHistory.length > 0 ? upgradeHistory[0] : null;

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
                            <Badge className={cn("text-base", statusColors[deployment.status] || 'bg-gray-200')}>
                                {deployment.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">Configuration</h3>
                                <div><Label>Product</Label><Input value={displayData.productName} disabled /></div>
                                <div><Label>Specification</Label><Input value={displayData.specName} disabled /></div>
                                <div><Label>Hypervisor</Label><Input value={displayData.hypervisorName} disabled /></div>
                                <div><Label>Foundation Components</Label><Textarea value={displayData.foundationComponentNames} disabled rows={4} /></div>
                            </div>
                             <div className="lg:col-span-1 space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">Details</h3>
                                <div><Label>Deployment ID</Label><Input value={deployment.details.deploymentId || ''} disabled /></div>
                                <div><Label>Customer</Label><Input value={deployment.details.customer || ''} disabled /></div>
                                <div><Label>Factory</Label><Input value={deployment.details.factory || 'N/A'} disabled /></div>
                                <div><Label>Location</Label><Input value={`${deployment.details.region || 'N/A'} / ${deployment.details.country || 'N/A'} / ${deployment.details.availabilityZone || 'N/A'}`} disabled /></div>
                                <div><Label>Created By</Label><Input value={`${deployment.createdBy} on ${format(new Date(deployment.createdAt), 'PPP')}`} disabled /></div>
                            </div>
                             <div className="lg:col-span-1 space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">Security Details</h3>
                                <div><Label>Encryption Key</Label><Textarea value={deployment.security?.encryptionKey || 'Not Provided'} disabled rows={2} /></div>
                                <div><Label>Signing Certificate</Label><Textarea value={deployment.security?.signingCert || 'Not Provided'} disabled rows={2} /></div>
                                <div><Label>PKI Details</Label><Textarea value={deployment.security?.pkiDetails || 'Not Provided'} disabled rows={2} /></div>
                                <div><Label>IAM Token</Label><Input value={deployment.security?.iamToken || 'Not Provided'} disabled /></div>
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                            <SummaryCard 
                                title="Foundation Provisioning Summary" 
                                summary={deployment.foundationSummary}
                                reportUploadPath={deployment.foundationSummary?.reportUploadPath}
                            />
                            <SummaryCard 
                                title="Latest Upgrade Summary" 
                                summary={latestUpgradeHistory?.summary}
                                reportUploadPath={latestUpgradeHistory?.reportUploadUrl}
                            />
                        </div>

                    </CardContent>
                     <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" asChild>
                           <Link href={`/fleet-management/deployment/${id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Update
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">DELETE</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will permanently delete this deployment. This cannot be undone.
                                    Please type <strong>delete</strong> to confirm.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="delete-comment">Reason for Deletion *</Label>
                                        <Textarea id="delete-comment" value={deleteComment} onChange={(e) => setDeleteComment(e.target.value)} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="delete-confirmation">Type "delete" to confirm *</Label>
                                        <Input id="delete-confirmation" value={deleteConfirmationText} onChange={(e) => setDeleteConfirmationText(e.target.value)} />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} disabled={isDeleteButtonDisabled} className="bg-destructive hover:bg-destructive/90">
                                     {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Delete Deployment
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
                
                <Dialog>
                    <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-lg font-semibold">
                                    <History className="h-5 w-5" />
                                    Upgrade History ({upgradeHistory.length})
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                            <Card className="mt-4">
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Target Spec</TableHead>
                                                <TableHead>Scope</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Initiated By</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {upgradeHistory.length > 0 ? upgradeHistory.map(h => (
                                                <DialogTrigger asChild key={h._id}>
                                                    <TableRow onClick={() => setSelectedHistory(h)} className="cursor-pointer">
                                                        <TableCell>{format(parseISO(h.initiatedAt), 'PPp')}</TableCell>
                                                        <TableCell>{specifications.find(s => s._id === h.targetSpecificationId)?.name || h.targetSpecificationId}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize">
                                                                {h.upgradeScope}
                                                                {h.upgradeScope === 'baseline' && h.baselineId && ` (${baselines.find(b => b._id === h.baselineId)?.product.version || 'unknown'})`}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{h.status}</TableCell>
                                                        <TableCell>{h.initiatedBy}</TableCell>
                                                    </TableRow>
                                                </DialogTrigger>
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
                     <DialogContent className="max-w-3xl">
                        {selectedHistory && (
                            <>
                                <DialogHeader>
                                <DialogTitle>Upgrade Details</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><Label>Initiated At</Label><Input value={format(parseISO(selectedHistory.initiatedAt), 'PPpp')} disabled /></div>
                                        <div><Label>Initiated By</Label><Input value={selectedHistory.initiatedBy} disabled /></div>
                                        <div><Label>Status</Label><Input value={selectedHistory.status} disabled /></div>
                                        <div><Label>Product</Label><Input value={products.find(p => p._id === selectedHistory.productId)?.name || 'N/A'} disabled /></div>
                                        <div><Label>Target Specification</Label><Input value={specifications.find(s => s._id === selectedHistory.targetSpecificationId)?.name || 'N/A'} disabled /></div>
                                        <div><Label>Scope</Label><Input value={selectedHistory.upgradeScope} disabled /></div>
                                    </div>
                                    {selectedHistory.upgradeScope === 'baseline' && (
                                        <div><Label>Baseline</Label><Input value={baselines.find(b => b._id === selectedHistory.baselineId)?.product.version || 'N/A'} disabled /></div>
                                    )}
                                    <div>
                                        <Label>Maintenance Window</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                             <Input value={`Start: ${format(parseISO(selectedHistory.maintenanceWindow.start), 'PPp')}`} disabled />
                                             <Input value={`End: ${format(parseISO(selectedHistory.maintenanceWindow.end), 'PPp')}`} disabled />
                                        </div>
                                    </div>
                                    <div><Label>Approvers</Label><Input value={selectedHistory.approvers.join(', ')} disabled /></div>
                                    <div><Label>Release Notes</Label><Textarea value={selectedHistory.releaseNotes} readOnly rows={5} /></div>
                                    <div><Label>Field Operations</Label><Textarea value={selectedHistory.fieldOperations || 'N/A'} readOnly rows={3} /></div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </main>
        </DashboardLayout>
    );
}
