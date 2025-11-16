

'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Product, Specification, Deployment, Baseline, OnboardingConfiguration, OnboardingPhase } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, SlidersHorizontal, Package, FileText, Calendar as CalendarIcon, Upload, Users, ShieldCheck, FileCode, ChevronRight, Save } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import ApprovalPhaseComponent from './_components/approval-phase';


const statusColors: Record<string, string> = {
    'Not Started': 'bg-gray-200 text-gray-800',
    'In Progress': 'bg-blue-200 text-blue-800',
    'Passed': 'bg-green-200 text-green-800',
    'Failed': 'bg-red-200 text-red-800',
    'Pending': 'bg-yellow-200 text-yellow-800',
    'Completed': 'bg-green-200 text-green-800',
    'Approved': 'bg-green-200 text-green-800',
    'Rejected': 'bg-red-200 text-red-800',
    'Signed-off': 'bg-green-200 text-green-800',
};


export default function UpgradeWizardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    // Wizard state
    const [step, setStep] = useState(1);
    
    // Data for selections
    const [products, setProducts] = useState<Product[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [baselines, setBaselines] = useState<Baseline[]>([]);
    const [approvalConfig, setApprovalConfig] = useState<OnboardingConfiguration | null>(null);
    
    // User selections
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedSpecId, setSelectedSpecId] = useState('');
    const [productDeployments, setProductDeployments] = useState<Deployment[]>([]);
    const [selectedDeploymentIds, setSelectedDeploymentIds] = useState<Set<string>>(new Set());
    const [upgradeScope, setUpgradeScope] = useState<'baseline' | 'individual' | null>(null);
    const [selectedBaselineId, setSelectedBaselineId] = useState<string>('');
    const [releaseNotes, setReleaseNotes] = useState('Default release notes based on version changes.');
    const [fieldOperations, setFieldOperations] = useState('');
    const [maintenanceStart, setMaintenanceStart] = useState<Date | undefined>();
    const [maintenanceEnd, setMaintenanceEnd] = useState<Date | undefined>();
    const [approvers, setApprovers] = useState(['Release Owner', 'Product Owner', 'Product Manager']);
    
    // State for approval phases
    const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
    const [phasesState, setPhasesState] = useState<Record<string, any>>({});
    const [popupState, setPopupState] = useState<any | null>(null);


    useEffect(() => {
        getUser().then(setUser);
        async function fetchInitialData() {
            try {
                const [productsRes, specsRes, deploymentsRes, baselinesRes, approvalConfigRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/specifications'),
                    fetch('/api/deployments'),
                    fetch('/api/baselines'),
                    fetch('/api/settings/approvals/upgrade-approval'),
                ]);
                if (!productsRes.ok || !specsRes.ok || !deploymentsRes.ok || !baselinesRes.ok || !approvalConfigRes.ok) {
                    throw new Error('Failed to fetch initial data.');
                }
                const productsData = await productsRes.json();
                const specsData = await specsRes.json();
                
                setProducts(productsData);
                setSpecifications(specsData);
                setDeployments(await deploymentsRes.json());
                setBaselines(await baselinesRes.json());
                
                const approvalConfigs = await approvalConfigRes.json();
                if (approvalConfigs && approvalConfigs.length > 0) {
                    const latestConfig = approvalConfigs.reduce((latest: any, current: any) => current.version > latest.version ? current : latest);
                    setApprovalConfig(latestConfig);
                    // Initialize approval phases state
                    const initialPhaseState: Record<string, any> = {};
                    latestConfig.phases.forEach((phase: OnboardingPhase) => {
                        initialPhaseState[phase.id] = { status: 'Not Started' };
                        phase.fields.forEach(field => {
                            initialPhaseState[phase.id][`${field.name}_value`] = '';
                            initialPhaseState[phase.id][`${field.name}_proofLink`] = '';
                        });
                    });
                    setPhasesState(initialPhaseState);
                }


                if (productsData.length > 0) {
                    setSelectedProductId(productsData[0]._id);
                }
                if (specsData.length > 0) {
                    setSelectedSpecId(specsData[0]._id);
                }
                
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData();
    }, [toast]);
    
    useEffect(() => {
        if (selectedProductId) {
            const filteredDeployments = deployments.filter(d => d.productId === selectedProductId);
            setProductDeployments(filteredDeployments);
        } else {
            setProductDeployments([]);
        }
        setSelectedDeploymentIds(new Set());
    }, [selectedProductId, deployments]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);
    
    const toggleDeploymentSelection = (deploymentId: string) => {
        setSelectedDeploymentIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(deploymentId)) {
                newSet.delete(deploymentId);
            } else {
                newSet.add(deploymentId);
            }
            return newSet;
        });
    };
    
    const toggleAllDeployments = () => {
        if (selectedDeploymentIds.size === productDeployments.length) {
            setSelectedDeploymentIds(new Set());
        } else {
            setSelectedDeploymentIds(new Set(productDeployments.map(d => d._id)));
        }
    };
    
    const areAllApprovalsComplete = () => {
        if (!approvalConfig) return false;
        return approvalConfig.phases.every(phase => {
            const phaseStatus = phasesState[phase.id]?.status;
            return phaseStatus === 'Approved' || phaseStatus === 'Signed-off';
        });
    };

    const isNextDisabled = () => {
        switch (step) {
            case 1: return !selectedProductId || !selectedSpecId;
            case 2: return selectedDeploymentIds.size === 0;
            case 3: return !upgradeScope;
            case 4:
                if (upgradeScope === 'baseline') return !selectedBaselineId;
                return false;
            case 5: return false; // Dependency Analysis (Placeholder)
            case 6: return false; // Compatibility Summary (Placeholder)
            case 7: return releaseNotes.trim() === '';
            case 8: return false; // Field Operations (Optional)
            case 9: return false; // Custom Workflows (Optional)
            case 10: return !maintenanceStart || !maintenanceEnd;
            case 11: return !areAllApprovalsComplete();
            default: return false;
        }
    };
    
    const getStepDescription = (currentStep: number) => {
        const descriptions = [
            "Step 1: Select Product and Target Specification",
            "Step 2: List All Deployments",
            "Step 3: Choose Upgrade Scope",
            "Step 4: Configure Upgrade Scope",
            "Step 5: Dependency and Compliance Analysis",
            "Step 6: Baseline Compatibility Summary",
            "Step 7: Upgrade Summary and Release Notes",
            "Step 8: Field Operations and Additional Procedures",
            "Step 9: Custom Workflows",
            "Step 10: Maintenance Window Planning",
            "Step 11: Approval Process Setup",
            "Step 12: Package Creation for Deployment",
            "Step 13: Air-Gapped Environment Report Upload",
            "Step 14: Completion Summary",
        ];
        return descriptions[currentStep - 1] || "Upgrade Wizard";
    };

    const submitUpgrade = async (status: 'SCHEDULED' | 'APPROVAL_IN_PROGRESS') => {
        setIsSubmitting(true);
        try {
            if (!maintenanceStart || !maintenanceEnd || !upgradeScope || !approvalConfig) {
                throw new Error("Missing required information for scheduling.");
            }

            const finalApprovalPhases = approvalConfig.phases.map(phaseConfig => {
                const phaseState = phasesState[phaseConfig.id];
                return {
                    // From config
                    id: phaseConfig.id,
                    name: phaseConfig.name,
                    ownerName: phaseConfig.ownerName,
                    ownerEmail: phaseConfig.ownerEmail,
                    sendEmailOnComplete: !!phaseConfig.sendEmailOnComplete,
                    statusOptions: phaseConfig.statusOptions,
                    // From user state
                    status: phaseState?.status || "Not Started",
                    fields: phaseConfig.fields.map(fieldConfig => {
                        return {
                            type: fieldConfig.type,
                            name: fieldConfig.name,
                            label: fieldConfig.label,
                            options: fieldConfig.options,
                            helpText: fieldConfig.helpText,
                            proof: !!fieldConfig.proof,
                            value: phaseState[`${fieldConfig.name}_value`] || '',
                            proofLink: phaseState[`${fieldConfig.name}_proofLink`] || ''
                        };
                    })
                };
            });

            const payload = {
                deploymentIds: Array.from(selectedDeploymentIds),
                productId: selectedProductId,
                targetSpecificationId: selectedSpecId,
                upgradeScope: upgradeScope,
                baselineId: upgradeScope === 'baseline' ? selectedBaselineId : undefined,
                releaseNotes: releaseNotes,
                fieldOperations: fieldOperations,
                maintenanceWindow: {
                    start: maintenanceStart.toISOString(),
                    end: maintenanceEnd.toISOString(),
                },
                approvers: approvers,
                approval_phases: finalApprovalPhases,
                status,
            };

            const response = await fetch('/api/upgrade-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(errorData.errors);
                throw new Error(errorData.message || 'Failed to schedule upgrade.');
            }
            
            return await response.json();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinish = async () => {
        const result = await submitUpgrade('SCHEDULED');
        if (result) {
            toast({ title: "Upgrade Scheduled", description: result.message });
            setStep(14);
        }
    };

    const handleSaveProgress = async () => {
        const result = await submitUpgrade('APPROVAL_IN_PROGRESS');
        if (result) {
            toast({ title: "Progress Saved", description: "Approval progress has been saved." });
            router.push('/fleet-management/deployment');
        }
    };

    // Handlers for approval phase interactions
    const handleExpandPhase = (phaseId: string) => {
        setExpandedPhase(phaseId);
        setPopupState({ ...(phasesState[phaseId] || {}) });
    };
    const handleCancelPopup = () => {
        setExpandedPhase(null);
        setPopupState(null);
    };
     const handleSavePopup = () => {
        if (!expandedPhase || !popupState) return;
        setPhasesState(prev => ({ ...prev, [expandedPhase]: popupState }));
        handleCancelPopup();
        toast({ title: "Saved", description: "Approval state updated locally. It will be finalized when the wizard is completed." });
    };
     const handlePopupStateChange = (fieldName: string, value: any) => {
        setPopupState((prev: any) => ({ ...prev, [fieldName]: value }));
    };
    const handlePopupStatusChange = (status: string) => {
        setPopupState((prev: any) => ({ ...prev, status }));
    };
    
    
    const renderStepContent = () => {
        if (loading) return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;

        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="product-select">Product</Label>
                            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                <SelectTrigger id="product-select"><SelectValue placeholder="Select a product to upgrade..." /></SelectTrigger>
                                <SelectContent>{products.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="spec-select">Target Specification Version</Label>
                            <Select value={selectedSpecId} onValueChange={setSelectedSpecId}>
                                <SelectTrigger id="spec-select"><SelectValue placeholder="Select a target specification..." /></SelectTrigger>
                                <SelectContent>{specifications.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            case 2:
                 return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Deployments</CardTitle>
                            <CardDescription>Choose one or more deployments to include in this upgrade.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedDeploymentIds.size > 0 && selectedDeploymentIds.size === productDeployments.length}
                                                onCheckedChange={toggleAllDeployments}
                                            />
                                        </TableHead>
                                        <TableHead>Deployment ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Current Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productDeployments.length > 0 ? productDeployments.map(dep => (
                                        <TableRow key={dep._id} data-state={selectedDeploymentIds.has(dep._id) && "selected"}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedDeploymentIds.has(dep._id)}
                                                    onCheckedChange={() => toggleDeploymentSelection(dep._id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono">{dep.details.deploymentId}</TableCell>
                                            <TableCell>{dep.details.customer}</TableCell>
                                            <TableCell>{dep.details.country || 'N/A'}</TableCell>
                                            <TableCell>{dep.status}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24">No deployments found for this product.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                );
            case 3:
                return (
                     <div className="space-y-4">
                        <p className="text-muted-foreground">Decide how you want to perform the upgrade. You can use a consistent baseline for all selected deployments or customize the upgrade for individual entities.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card 
                                className={cn("cursor-pointer hover:shadow-lg transition-shadow", upgradeScope === 'baseline' && "ring-2 ring-primary")}
                                onClick={() => setUpgradeScope('baseline')}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><FileCode/> Baseline Upgrade</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Apply a global, consistent upgrade using a pre-defined baseline. This is the recommended path for most upgrades.</p>
                                </CardContent>
                            </Card>
                            <Card 
                                className={cn("cursor-pointer hover:shadow-lg transition-shadow", upgradeScope === 'individual' && "ring-2 ring-primary")}
                                onClick={() => setUpgradeScope('individual')}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><SlidersHorizontal /> Individual Upgrade</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Manually select specific tenants, components, or applications to upgrade. This offers more granular control.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );
            case 4:
                if (upgradeScope === 'baseline') {
                    const productBaselines = baselines.filter(b => b.product.id === selectedProductId && b.status === 'RELEASED');
                    return (
                        <div className="space-y-4">
                            <Label htmlFor="baseline-select" className="text-lg font-semibold">Choose Baseline</Label>
                            <Select value={selectedBaselineId} onValueChange={setSelectedBaselineId}>
                                <SelectTrigger id="baseline-select">
                                    <SelectValue placeholder="Select a baseline..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {productBaselines.length > 0 ? (
                                        productBaselines.map(b => <SelectItem key={b._id} value={b._id}>{b.product.name} - v{b.product.version}</SelectItem>)
                                    ) : (
                                        <div className="p-4 text-center text-sm text-muted-foreground">No released baselines for this product.</div>
                                    )}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">Select a released baseline to apply to the selected deployments.</p>
                        </div>
                    );
                }
                if (upgradeScope === 'individual') {
                    const selectedDeployments = deployments.filter(d => selectedDeploymentIds.has(d._id));
                    return (
                        <div className="space-y-4">
                             <h3 className="text-lg font-semibold">Individual Package Upgrade</h3>
                             <p className="text-sm text-muted-foreground">The following deployments will be targeted for an individual upgrade. You can further customize components in subsequent steps (placeholder).</p>
                             <Card>
                                 <Table>
                                     <TableHeader><TableRow><TableHead>Deployment ID</TableHead><TableHead>Customer</TableHead></TableRow></TableHeader>
                                     <TableBody>
                                         {selectedDeployments.map(d => (
                                             <TableRow key={d._id}><TableCell>{d.details.deploymentId}</TableCell><TableCell>{d.details.customer}</TableCell></TableRow>
                                         ))}
                                     </TableBody>
                                 </Table>
                             </Card>
                        </div>
                    )
                }
                return null;
            case 5:
                return (
                    <div className="text-center p-8 space-y-4">
                        <h3 className="font-semibold text-lg">Analyzing Dependencies & Compliance...</h3>
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="text-muted-foreground">Comparing current versions with target versions and identifying dependencies. This is a placeholder for the backend analysis.</p>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-4">
                         <h3 className="font-semibold text-lg">Baseline Compatibility Summary</h3>
                         <p className="text-muted-foreground">This summary shows which deployments are compatible. This is placeholder data.</p>
                         <Table>
                             <TableHeader><TableRow><TableHead>Deployment ID</TableHead><TableHead>Status</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
                             <TableBody>
                                 <TableRow><TableCell>DEP-001</TableCell><TableCell className="text-green-600">Compatible</TableCell><TableCell>Ready for baseline upgrade.</TableCell></TableRow>
                                 <TableRow><TableCell>DEP-002</TableCell><TableCell className="text-yellow-600">Requires Updates</TableCell><TableCell>Component `AuthZ` needs update from v2.4 to v2.5.</TableCell></TableRow>
                                  <TableRow><TableCell>DEP-003</TableCell><TableCell className="text-red-600">Incompatible</TableCell><TableCell>OS version mismatch. Manual intervention required.</TableCell></TableRow>
                             </TableBody>
                         </Table>
                    </div>
                )
            case 7:
                return (
                    <div className="space-y-4">
                        <Label htmlFor="release-notes" className="text-lg font-semibold">Upgrade Summary and Release Notes</Label>
                        <Textarea id="release-notes" value={releaseNotes} onChange={(e) => setReleaseNotes(e.target.value)} rows={15} />
                    </div>
                )
            case 8:
                 return (
                    <div className="space-y-4">
                        <Label htmlFor="field-ops" className="text-lg font-semibold">Field Operations and Additional Procedures</Label>
                        <p className="text-sm text-muted-foreground">Record any physical or manual field operations that must occur before or after the upgrade (optional).</p>
                        <Textarea id="field-ops" value={fieldOperations} onChange={(e) => setFieldOperations(e.target.value)} rows={8} />
                    </div>
                )
            case 9:
                 return (
                    <div className="text-center p-8 space-y-4">
                        <h3 className="font-semibold text-lg">Custom Workflows (Optional)</h3>
                        <p className="text-muted-foreground">This step for linking custom automation workflows is under construction.</p>
                        <Button>Link Default Workflow</Button>
                    </div>
                )
            case 10:
                 return (
                     <div className="space-y-4 flex flex-col items-center">
                        <Label className="text-lg font-semibold">Maintenance Window Planning</Label>
                        <p className="text-sm text-muted-foreground">Define the maintenance window for the upgrade.</p>
                        <div className="flex gap-8">
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal", !maintenanceStart && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {maintenanceStart ? format(maintenanceStart, "PPP") : <span>Pick a start date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={maintenanceStart} onSelect={setMaintenanceStart} initialFocus />
                                </PopoverContent>
                            </Popover>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal", !maintenanceEnd && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {maintenanceEnd ? format(maintenanceEnd, "PPP") : <span>Pick an end date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={maintenanceEnd} onSelect={setMaintenanceEnd} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                     </div>
                 )
            case 11:
                return (
                     <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Approval Process Setup</h3>
                            <p className="text-sm text-muted-foreground">Complete each approval phase for this upgrade.</p>
                         </div>
                        {approvalConfig ? (
                             <div className={cn("relative flex flex-wrap items-center justify-center p-8 gap-y-8 gap-x-4", expandedPhase && 'z-30')}>
                                {approvalConfig.phases.map((phase, index) => (
                                    <div key={phase.id} className="flex items-center">
                                        <ApprovalPhaseComponent
                                            phase={phase}
                                            phaseState={expandedPhase === phase.id ? popupState : phasesState[phase.id]}
                                            onStateChange={handlePopupStateChange}
                                            onStatusChange={handlePopupStatusChange}
                                            isExpanded={expandedPhase === phase.id}
                                            onExpand={() => handleExpandPhase(phase.id)}
                                            statusColor={statusColors[phasesState[phase.id]?.status] || 'bg-gray-200 text-gray-800'}
                                            onSave={handleSavePopup}
                                            onCancel={handleCancelPopup}
                                        />
                                        {index < approvalConfig.phases.length - 1 && (
                                            <ChevronRight className="h-8 w-8 text-muted-foreground mx-4" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground">No approval configuration found for upgrades.</p>
                        )}

                        {expandedPhase && (
                            <div className="fixed inset-0 bg-black/30 z-10" onClick={handleCancelPopup} />
                        )}
                    </div>
                );
             case 12:
                return (
                    <div className="text-center p-8 space-y-4">
                        <h3 className="font-semibold text-lg">Package Creation for Deployment</h3>
                        <p className="text-muted-foreground">A package will be created for each deployment with site-specific configurations.</p>
                        <Package className="h-16 w-16 text-primary mx-auto" />
                    </div>
                );
            case 13:
                 return (
                    <div className="text-center p-8 space-y-4">
                        <h3 className="font-semibold text-lg">Air-Gapped Environment Report Upload</h3>
                        <p className="text-muted-foreground">Provide a location for uploading deployment status reports from offline systems, or upload directly.</p>
                         <div className="flex justify-center items-center gap-4">
                             <Button variant="outline"><Upload className="mr-2 h-4 w-4"/> Upload Reports</Button>
                             <span className="text-muted-foreground">or</span>
                             <Input placeholder="Enter shared folder path..." className="max-w-xs" />
                         </div>
                    </div>
                 );
             case 14:
                 return (
                     <div className="text-center p-8 space-y-4">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto"/>
                        <h3 className="font-semibold text-lg">Upgrade Process Scheduled</h3>
                        <p className="text-muted-foreground">The upgrade for the selected deployments has been scheduled. The status of these deployments has been updated to "UPGRADING".</p>
                    </div>
                 )
            default:
                return <p>End of wizard.</p>;
        }
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 flex justify-center">
                <Card className="w-full max-w-4xl">
                    <CardHeader>
                        <CardTitle>Upgrade Wizard</CardTitle>
                        <CardDescription>{getStepDescription(step)}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>{renderStepContent()}</CardContent>

                    <CardFooter className="flex justify-between">
                         <div>
                            {step > 1 && step <= 13 && (
                                <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            )}
                         </div>
                         <div className="flex gap-2">
                            {step < 14 && <Button variant="outline" onClick={() => router.push('/fleet-management/deployment')} disabled={isSubmitting}>Cancel</Button>}
                            
                            {step === 11 && (
                                <Button variant="secondary" onClick={handleSaveProgress} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Progress & Exit
                                </Button>
                            )}

                            {step < 13 ? (
                                <Button onClick={handleNext} disabled={isNextDisabled() || isSubmitting}>
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : step === 13 ? (
                                <Button onClick={handleFinish} disabled={isSubmitting}>
                                   {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                   Finish & Schedule Upgrade
                                </Button>
                            ) : (
                               <Button onClick={() => router.push('/fleet-management/deployment')}>Return to Dashboard</Button>
                            )}
                         </div>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
