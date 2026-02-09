
'use client';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Product, Specification, Deployment, Baseline, OnboardingConfiguration, OnboardingPhase, CmdbTenant, CmdbComponent, CmdbApplication, DependencyTree } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, CheckCircle, SlidersHorizontal, Package, FileText, Calendar as CalendarIcon, Upload, Users, ShieldCheck, FileCode, ChevronRight, Save, Warehouse, Puzzle, AppWindow, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import ApprovalPhaseComponent from './_components/approval-phase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { VisualBuilder } from '@/app/platform-engineering/platform-builder/_components/visual-builder';

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

function UpgradeWizardPageComponent() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const resumeDeploymentId = searchParams.get('resume');


    // Wizard state
    const [step, setStep] = useState(1);

    // Data for selections
    const [products, setProducts] = useState<Product[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [baselines, setBaselines] = useState<Baseline[]>([]);
    const [approvalConfig, setApprovalConfig] = useState<OnboardingConfiguration | null>(null);
    const [dependencyTree, setDependencyTree] = useState<DependencyTree | null>(null);

    // New State for Step 2 & 3
    const [platformFoundations, setPlatformFoundations] = useState<any[]>([]);

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
    const [selectedIndividualItems, setSelectedIndividualItems] = useState<{ tenants: Set<string>; components: Set<string>; applications: Set<string> }>({ tenants: new Set(), components: new Set(), applications: new Set() });


    // State for approval phases
    const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
    const [phasesState, setPhasesState] = useState<Record<string, any>>({});
    const [popupState, setPopupState] = useState<any | null>(null);

    // Visual Builder State
    const [visualFoundation, setVisualFoundation] = useState<any>(null);
    const [baselineVisualData, setBaselineVisualData] = useState<any>(null);


    useEffect(() => {
        getUser().then((u: any) => setUser(u));
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
                const deploymentsData = await deploymentsRes.json();
                setDeployments(deploymentsData);
                setBaselines(await baselinesRes.json());

                // Fetch new resources
                const foundationsRes = await fetch('/api/platform-foundations');

                if (foundationsRes.ok) setPlatformFoundations(await foundationsRes.json());


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


                if (resumeDeploymentId) {
                    const resumeDeployment = deploymentsData.find((d: Deployment) => d._id === resumeDeploymentId);
                    if (resumeDeployment && resumeDeployment.status === 'UPGRADE_APPROVAL') {
                        const historyRes = await fetch(`/api/upgrade-history/${resumeDeploymentId}`);
                        if (historyRes.ok) {
                            const historyData = await historyRes.json();
                            const latestHistory = historyData[0];
                            if (latestHistory) {
                                setSelectedProductId(latestHistory.productId);
                                setSelectedSpecId(latestHistory.targetSpecificationId);
                                setSelectedDeploymentIds(new Set([resumeDeploymentId]));
                                setUpgradeScope(latestHistory.upgradeScope);
                                setSelectedBaselineId(latestHistory.baselineId || '');
                                setReleaseNotes(latestHistory.releaseNotes);
                                setFieldOperations(latestHistory.fieldOperations);
                                setMaintenanceStart(new Date(latestHistory.maintenanceWindow.start));
                                setMaintenanceEnd(new Date(latestHistory.maintenanceWindow.end));
                                setApprovers(latestHistory.approvers);

                                const resumedPhaseState: Record<string, any> = {};
                                (latestHistory.approval_phases || []).forEach((phase: OnboardingPhase) => {
                                    resumedPhaseState[phase.id] = { status: (phase as any).status || 'Not Started' };
                                    phase.fields.forEach(field => {
                                        resumedPhaseState[phase.id][`${field.name}_value`] = (field as any).value || '';
                                        resumedPhaseState[phase.id][`${field.name}_proofLink`] = (field as any).proofLink || '';
                                    });
                                });
                                setPhasesState(resumedPhaseState);
                                setStep(11); // Jump to approval step
                                toast({ title: 'Resuming Upgrade Approval', description: `Loaded saved approval state for deployment ${resumeDeployment.details.deploymentId}.` });
                            }
                        }
                    }
                } else if (productsData.length > 0) {
                    setSelectedProductId(productsData[0]._id);
                }



            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData();
    }, [toast, resumeDeploymentId]);

    useEffect(() => {
        if (selectedProductId) {
            const filteredDeployments = deployments.filter(d => d.productId === selectedProductId);
            setProductDeployments(filteredDeployments);
            // Fetch dependency tree for the product
            fetch(`/api/dependency-tree/product/${selectedProductId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.message) {
                        setDependencyTree(data);
                    } else {
                        setDependencyTree(null);
                    }
                })
                .catch(() => setDependencyTree(null));
        } else {
            setProductDeployments([]);
            setDependencyTree(null);
        }
        if (!resumeDeploymentId) {
            setSelectedDeploymentIds(new Set());
        }
    }, [selectedProductId, deployments, resumeDeploymentId]);

    // Construct Visual Foundation from Selected Deployment
    useEffect(() => {
        if (!selectedProductId || !selectedSpecId) {
            setVisualFoundation(null);
            return;
        }

        async function fetchSpecAndBuildVisual() {
            try {
                const spec = specifications.find(s => s._id === selectedSpecId);
                const product = products.find(p => p._id === selectedProductId);

                // Derive Foundation from Selected Deployment (if any)
                let foundation = null;
                if (selectedDeploymentIds.size > 0) {
                    const firstDeploymentId = Array.from(selectedDeploymentIds)[0];
                    const deployment = deployments.find(d => d._id === firstDeploymentId);
                    if (deployment && deployment.foundationId) {
                        foundation = platformFoundations.find(f => f._id === deployment.foundationId);
                    }
                }

                if (!spec || !product) return;

                // Base Visual Data from Spec + Product (Partial Preview)
                const nodes = (spec as any).nodes || [];
                const controlPlaneNodes = nodes.filter((n: any) => n.role === 'Control Plane').map((n: any) => ({ id: n.vmName }));
                const workerNodes = nodes.filter((n: any) => n.role === 'Worker').map((n: any) => ({ id: n.vmName }));

                // Base Visual Data construction with Deep Merge
                // Priority: Product (Target) > Spec (Target) > Foundation (Base)

                const foundationK8s = foundation?.kubernetes || {};
                const foundationSpec = foundation?.specification || {};

                const visualData = {
                    // Start with Foundation as base (if exists)
                    ...(foundation || {}),

                    // Override with Product (Target)
                    product: product,

                    // Override with Specification (Target)
                    // We merge spec onto foundationSpec to keep any extra foundation fields (like bios) 
                    // but ensure Target Spec values take precedence
                    specification: {
                        ...foundationSpec,
                        ...spec,
                        name: spec.name, // Ensure target spec name is used
                        vendor: (spec as any).vendor || foundationSpec.vendor || "Generic",
                        hw_type: (spec as any).hw_type || foundationSpec.hw_type || { name: "Standard" },
                    },

                    // Nodes: Target Spec defines the nodes
                    virtual_machines: nodes.length > 0 ? nodes : (foundation?.virtual_machines),

                    // Kubernetes: Merge Foundation components with Target Versions/Nodes
                    kubernetes: {
                        ...foundationK8s, // Base (Distro, CNI, Platform Components)

                        // Overrides
                        version: (spec as any).version || foundationK8s.version || "v1.27.x",
                        platformVersion: `v${product.version}`, // Target Product Version

                        // Ensure Nodes match the Target Spec
                        controlPlaneNodes: controlPlaneNodes.length > 0 ? controlPlaneNodes : foundationK8s.controlPlaneNodes,
                        workerNodes: workerNodes.length > 0 ? workerNodes : foundationK8s.workerNodes,
                    }
                };

                setVisualFoundation(visualData);
            } catch (error) {
                console.error("Failed to build visual foundation", error);
            }
        }
        fetchSpecAndBuildVisual();
    }, [selectedProductId, selectedSpecId, selectedDeploymentIds, products, specifications, platformFoundations, deployments]);

    // Build Baseline Visual Data for Step 5
    useEffect(() => {
        if (!selectedBaselineId || upgradeScope !== 'baseline') {
            setBaselineVisualData(null);
            return;
        }

        const selectedBaseline = baselines.find(b => b._id === selectedBaselineId);
        if (!selectedBaseline) {
            setBaselineVisualData(null);
            return;
        }

        // Get the Product details
        const product = products.find(p => p._id === selectedProductId);
        const spec = specifications.find(s => s._id === selectedSpecId);

        // Get Foundation from selected deployment (if available)
        let foundation = null;
        if (selectedDeploymentIds.size > 0) {
            const firstDeploymentId = Array.from(selectedDeploymentIds)[0];
            const deployment = deployments.find(d => d._id === firstDeploymentId);
            if (deployment && deployment.foundationId) {
                foundation = platformFoundations.find(f => f._id === deployment.foundationId);
            }
        }

        // Build comprehensive visual data similar to Step 3, but with baseline tenants
        const foundationK8s = foundation?.kubernetes || {};
        const foundationSpec = foundation?.specification || {};

        const visualData = {
            // Include foundation structure if available
            ...(foundation || {}),

            // Product from baseline (override with actual product object if available)
            product: product || {
                name: selectedBaseline.product.name,
                version: selectedBaseline.product.version,
            },

            // Specification details
            specification: spec ? {
                ...foundationSpec,
                ...spec,
                name: spec.name,
                vendor: (spec as any).vendor || foundationSpec.vendor || "Generic",
                hw_type: (spec as any).hw_type || foundationSpec.hw_type || { name: "Standard" },
            } : foundationSpec,

            // Kubernetes details
            kubernetes: {
                ...foundationK8s,
                version: (spec as any)?.version || foundationK8s.version || "v1.27.x",
                platformVersion: `v${selectedBaseline.product.version}`,
            },

            // Platform Foundation name/description
            name: foundation?.name || `${selectedBaseline.product.name} Platform`,
            description: `Baseline v${selectedBaseline.product.version} with complete tenant configuration`,
            version: selectedBaseline.product.version,

            // Add baseline-specific type and tenant data
            type: 'baseline',
            tenants: selectedBaseline.tenants || [],

            // Keep original structure for JSON view
            _raw: selectedBaseline
        };

        setBaselineVisualData(visualData);
    }, [selectedBaselineId, upgradeScope, baselines, selectedProductId, selectedSpecId, products, specifications, selectedDeploymentIds, deployments, platformFoundations]);



    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleProductChange = (productId: string) => {
        setSelectedProductId(productId);
        setSelectedSpecId('');
        const relevantDeployments = deployments.filter(d => d.productId === productId);
        setProductDeployments(relevantDeployments);
        setSelectedDeploymentIds(new Set());
    };

    const toggleDeploymentSelection = (deploymentId: string, foundationId?: string) => {
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

    const handleIndividualSelection = (type: 'tenants' | 'components' | 'applications', id: string) => {
        setSelectedIndividualItems(prev => {
            const newSet = new Set(prev[type]);
            if (newSet.has(id)) {
                newSet.delete(id);
                // If a tenant is deselected, deselect all its children
                if (type === 'tenants') {
                    const tenant = dependencyTree?.tenants.find(t => t.id === id);
                    tenant?.components.forEach(c => prev.components.delete(c.id));
                    tenant?.applications.forEach(a => prev.applications.delete(a.id));
                }
            } else {
                newSet.add(id);
                // If a child is selected, ensure its parent tenant is selected
                if (type === 'components' || type === 'applications') {
                    const parentTenant = dependencyTree?.tenants.find(t =>
                        t.components.some(c => c.id === id) || t.applications.some(a => a.id === id)
                    );
                    if (parentTenant) {
                        prev.tenants.add(parentTenant.id);
                    }
                }
            }
            return { ...prev, [type]: newSet };
        });
    };

    const handleTenantSelection = (tenantId: string, checked: boolean) => {
        const tenant = dependencyTree?.tenants.find(t => t.id === tenantId);
        if (!tenant) return;

        setSelectedIndividualItems(prev => {
            const newTenants = new Set(prev.tenants);
            const newComponents = new Set(prev.components);
            const newApps = new Set(prev.applications);

            if (checked) {
                newTenants.add(tenantId);
                tenant.components.forEach(c => newComponents.add(c.id));
                tenant.applications.forEach(a => newApps.add(a.id));
            } else {
                newTenants.delete(tenantId);
                tenant.components.forEach(c => newComponents.delete(c.id));
                tenant.applications.forEach(a => newApps.delete(a.id));
            }
            return { tenants: newTenants, components: newComponents, applications: newApps };
        });
    };

    const selectedIndividualSummary = useMemo(() => {
        if (!dependencyTree) return [];
        const items = [];
        for (const tenant of dependencyTree.tenants) {
            if (selectedIndividualItems.tenants.has(tenant.id)) {
                items.push({ type: 'Tenant', ...tenant });
                for (const component of tenant.components) {
                    if (selectedIndividualItems.components.has(component.id)) {
                        items.push({ type: 'Component', ...component });
                    }
                }
                for (const app of tenant.applications) {
                    if (selectedIndividualItems.applications.has(app.id)) {
                        items.push({ type: 'Application', ...app });
                    }
                }
            }
        }
        return items;
    }, [selectedIndividualItems, dependencyTree]);


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
            case 2: return selectedDeploymentIds.size === 0; // Select Deployments
            case 3: return false; // Visual Preview (always valid to proceed)
            case 4: return !upgradeScope; // Scope
            case 5:
                if (upgradeScope === 'baseline') return !selectedBaselineId;
                if (upgradeScope === 'individual') return selectedIndividualItems.components.size === 0 && selectedIndividualItems.applications.size === 0;
                return true;
            case 6:
                if (upgradeScope === 'individual') return selectedIndividualSummary.length === 0;
                return false;
            case 7: return false; // Baseline Compatibility
            case 8: return releaseNotes.trim() === '';
            case 9: return false;
            case 10: return false;
            case 11: return !maintenanceStart || !maintenanceEnd;
            case 12: return !areAllApprovalsComplete();
            default: return false;
        }
    };

    const getStepDescription = (currentStep: number) => {
        const descriptions = [
            "Step 1: Select Product and Target Specification",
            "Step 2: Select Deployments",
            "Step 3: Platform Preview",
            "Step 4: Choose Upgrade Scope",
            "Step 5: Configure Upgrade Scope",
            "Step 6: Dependency and Compliance Analysis",
            "Step 7: Baseline Compatibility Summary",
            "Step 8: Upgrade Summary and Release Notes",
            "Step 9: Field Operations and Additional Procedures",
            "Step 10: Custom Workflows",
            "Step 11: Maintenance Window Planning",
            "Step 12: Approval Process Setup",
            "Step 13: Package Creation for Deployment",
            "Step 14: Air-Gapped Environment Report Upload",
            "Step 15: Upgrade Scheduled",
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
                    id: phaseConfig.id,
                    name: phaseConfig.name,
                    ownerName: phaseConfig.ownerName,
                    ownerEmail: phaseConfig.ownerEmail,
                    sendEmailOnComplete: phaseConfig.sendEmailOnComplete,
                    statusOptions: phaseConfig.statusOptions,
                    status: phaseState?.status || "Not Started",
                    fields: phaseConfig.fields.map(fieldConfig => {
                        return {
                            type: fieldConfig.type,
                            name: fieldConfig.name,
                            label: fieldConfig.label,
                            options: fieldConfig.options,
                            helpText: fieldConfig.helpText,
                            proof: fieldConfig.proof,
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
                    type: 'Upgrade'
                },
                approvers: [], // Simplified for now
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
            setStep(16);
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
                            <Select value={selectedProductId} onValueChange={handleProductChange}>
                                <SelectTrigger id="product-select"><SelectValue placeholder="Select a product..." /></SelectTrigger>
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
                        {visualFoundation && (
                            <div className="mt-8 border-t pt-6">
                                <Label className="block mb-4 text-base">Target Platform Preview</Label>
                                <VisualBuilder foundation={visualFoundation} autoHeight={true} />
                            </div>
                        )}
                    </div>
                );
            case 2:
                // Step 2: Select Deployments (Moved back from Step 4)
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Deployments to Upgrade</CardTitle>
                            <CardDescription>Choose the active deployments you wish to upgrade to the selected specification.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {deployments.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">Select</TableHead>
                                            <TableHead>Deployment ID</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Current Version</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Region</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deployments.map(d => (
                                            <TableRow key={d._id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedDeploymentIds.has(d._id)}
                                                        onCheckedChange={() => toggleDeploymentSelection(d._id, d.foundationId)}
                                                    />
                                                </TableCell>
                                                <TableCell>{d.details.deploymentId}</TableCell>
                                                <TableCell>{d.details.customer}</TableCell>
                                                <TableCell>{d.foundationSummary?.status || 'Unknown'}</TableCell>
                                                <TableCell><span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">{d.status}</span></TableCell>
                                                <TableCell>{d.details.region || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">No active deployments found for this product.</div>
                            )}
                        </CardContent>
                    </Card>
                );
            case 3:
                // Step 3: Platform Preview (VisualBuilder with Foundation Data from Selected Deployment)
                return (
                    <div className="space-y-4">
                        <div className="border-t pt-6">
                            <Label className="block mb-4 text-base">Platform Foundation Details</Label>
                            <p className="text-sm text-muted-foreground mb-4">
                                This preview shows the target platform configuration based on your selected specification and the foundation of the selected deployment(s).
                            </p>
                            {visualFoundation ? (
                                <VisualBuilder foundation={visualFoundation} autoHeight={true} />
                            ) : (
                                <div className="p-8 text-center text-muted-foreground bg-muted rounded-md">
                                    No preview available. Ensure Deployment and Specification are selected.
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">Decide how you want to perform the upgrade. You can use a consistent baseline for all selected deployments or customize the upgrade for individual entities.</p>
                        <RadioGroup value={upgradeScope || undefined} onValueChange={(val: any) => setUpgradeScope(val)}>
                            <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value="baseline" id="baseline" />
                                <Label htmlFor="baseline" className="flex-1 cursor-pointer">
                                    <span className="block font-semibold">Baseline Upgrade</span>
                                    <span className="block text-sm text-muted-foreground">Upgrade entire platform using a pre-validated baseline configuration. Best for consistency.</span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value="individual" id="individual" />
                                <Label htmlFor="individual" className="flex-1 cursor-pointer">
                                    <span className="block font-semibold">Individual Component Upgrade</span>
                                    <span className="block text-sm text-muted-foreground">Select specific components or applications to upgrade. Useful for hotfixes or partial rollouts.</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                );
            case 5:
                if (upgradeScope === 'baseline') {
                    const productBaselines = baselines.filter(b => b.product.id === selectedProductId && b.status === 'RELEASED');
                    return (
                        <div className="space-y-4">
                            <Label htmlFor="baseline-select">Select Baseline Version</Label>
                            <Select value={selectedBaselineId} onValueChange={setSelectedBaselineId}>
                                <SelectTrigger id="baseline-select"><SelectValue placeholder="Select a baseline..." /></SelectTrigger>
                                <SelectContent>
                                    {productBaselines.length > 0 ?
                                        productBaselines.map(b => <SelectItem key={b._id} value={b._id}>{b.product.name} - Version {b.product.version}</SelectItem>)
                                        : <SelectItem value="none" disabled>No released baselines found</SelectItem>
                                    }
                                </SelectContent>
                            </Select>
                            {selectedBaselineId && (
                                <>
                                    <Alert className="bg-blue-50 border-blue-200">
                                        <Info className="h-4 w-4 text-blue-600" />
                                        <AlertTitle className="text-blue-800">Baseline Selected</AlertTitle>
                                        <AlertDescription className="text-blue-700">
                                            This will upgrade strictly to the definition in the selected baseline.
                                            Any deviations in the current deployment will be overwritten.
                                        </AlertDescription>
                                    </Alert>

                                    {baselineVisualData && (
                                        <div className="mt-4">
                                            <h3 className="text-lg font-semibold mb-2">Baseline Configuration Preview</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Visual and JSON representation of all Tenants, Components, Applications, and Interfaces included in this baseline.
                                            </p>
                                            <VisualBuilder foundation={baselineVisualData} autoHeight={true} />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                } else if (upgradeScope === 'individual') {
                    if (!dependencyTree) {
                        return <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading dependency data...</div>
                    }
                    return (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Select Items for Upgrade</h3>
                            <p className="text-sm text-muted-foreground">Select the specific tenants, components, and applications you want to include in the upgrade package.</p>
                            <Accordion type="multiple" defaultValue={dependencyTree.tenants.map(t => t.id)} className="w-full">
                                {dependencyTree.tenants.map(tenant => (
                                    <AccordionItem value={tenant.id} key={tenant.id}>
                                        <div className="flex items-center bg-muted/50 rounded-t-md px-2">
                                            <Checkbox
                                                id={`tenant-${tenant.id}`}
                                                checked={selectedIndividualItems.tenants.has(tenant.id)}
                                                onCheckedChange={(checked) => handleTenantSelection(tenant.id, !!checked)}
                                            />
                                            <AccordionTrigger className="flex-1 p-2">
                                                <div className="flex items-center gap-2 ml-2">
                                                    <Warehouse className="h-5 w-5" />
                                                    <span>{tenant.name}</span>
                                                </div>
                                            </AccordionTrigger>
                                        </div>
                                        <AccordionContent className="p-4 border border-t-0 rounded-b-md space-y-4">
                                            <div>
                                                <h4 className="font-semibold mb-2">Components</h4>
                                                <div className="space-y-2">
                                                    {tenant.components.map(comp => (
                                                        <div key={comp.id} className="flex items-center space-x-2"><Checkbox id={`comp-${comp.id}`} checked={selectedIndividualItems.components.has(comp.id)} onCheckedChange={(checked) => handleIndividualSelection('components', comp.id)} /><Label htmlFor={`comp-${comp.id}`}>{comp.name} (v{comp.version})</Label></div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2">Applications</h4>
                                                <div className="space-y-2">
                                                    {tenant.applications.map(app => (
                                                        <div key={app.id} className="flex items-center space-x-2"><Checkbox id={`app-${app.id}`} checked={selectedIndividualItems.applications.has(app.id)} onCheckedChange={(checked) => handleIndividualSelection('applications', app.id)} /><Label htmlFor={`app-${app.id}`}>{app.name} (v{app.version})</Label></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    );
                }
                return null;
            case 6:
                const itemsToShow = upgradeScope === 'individual' ? selectedIndividualSummary : [];
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Dependency & Compliance Analysis</h3>
                        <p className="text-muted-foreground">The following items will be included in the upgrade package. The system is analyzing dependencies and compliance status.</p>
                        <Card>
                            <Table>
                                <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Name</TableHead><TableHead>Version</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {itemsToShow.length > 0 ? itemsToShow.map(item => (
                                        <TableRow key={`${item.type}-${item.id}`}>
                                            <TableCell>{item.type}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.version}</TableCell>
                                            <TableCell className="flex items-center text-green-600"><CheckCircle className="h-4 w-4 mr-1" /> Compliant</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                                <p className="mt-2">Analyzing baseline dependencies...</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                );
            case 7:
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
            case 8:
                return (
                    <div className="space-y-4">
                        <Label htmlFor="release-notes" className="text-lg font-semibold">Upgrade Summary and Release Notes</Label>
                        <Textarea id="release-notes" value={releaseNotes} onChange={(e) => setReleaseNotes(e.target.value)} rows={15} />
                    </div>
                )
            case 9:
                return (
                    <div className="space-y-4">
                        <Label htmlFor="field-ops" className="text-lg font-semibold">Field Operations and Additional Procedures</Label>
                        <p className="text-sm text-muted-foreground">Record any physical or manual field operations that must occur before or after the upgrade (optional).</p>
                        <Textarea id="field-ops" value={fieldOperations} onChange={(e) => setFieldOperations(e.target.value)} rows={8} />
                    </div>
                )
            case 10:
                return (
                    <div className="text-center p-8 space-y-4">
                        <h3 className="font-semibold text-lg">Custom Workflows (Optional)</h3>
                        <p className="text-muted-foreground">This step for linking custom automation workflows is under construction.</p>
                        <Button>Link Default Workflow</Button>
                    </div>
                )
            case 11:
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
            case 12:
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
            case 13:
                return (
                    <div className="text-center p-8 space-y-4">
                        <h3 className="font-semibold text-lg">Package Creation for Deployment</h3>
                        <p className="text-muted-foreground">A package will be created for each deployment with site-specific configurations.</p>
                        <Package className="h-16 w-16 text-primary mx-auto" />
                    </div>
                );
            case 14:
                return (
                    <div className="text-center p-8 space-y-4">
                        <h3 className="font-semibold text-lg">Air-Gapped Environment Report Upload</h3>
                        <p className="text-muted-foreground">Provide a location for uploading deployment status reports from offline systems, or upload directly.</p>
                        <div className="flex justify-center items-center gap-4">
                            <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Upload Reports</Button>
                            <span className="text-muted-foreground">or</span>
                            <Input placeholder="Enter shared folder path..." className="max-w-xs" />
                        </div>
                    </div>
                );
            case 15:
                return (
                    <div className="text-center p-8 space-y-4">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                        <h3 className="font-semibold text-lg">Upgrade Process Scheduled</h3>
                        <p className="text-muted-foreground">The upgrade for the selected deployments has been scheduled. The status of these deployments has been updated to "UPGRADING".</p>
                    </div>
                )
            default:
                return <p>End of wizard.</p>;
        }
    };

    return (
        <DashboardLayout user={user} >
            <main className="flex-1 p-6 md:p-10 flex justify-center">
                <Card className="w-full max-w-4xl">
                    <CardHeader>
                        <CardTitle>Upgrade Wizard</CardTitle>
                        <CardDescription>{getStepDescription(step)}</CardDescription>
                    </CardHeader>

                    <CardContent>{renderStepContent()}</CardContent>

                    <CardFooter className="flex justify-between">
                        <div>
                            {step > 1 && step <= 13 && !resumeDeploymentId && (
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
        </DashboardLayout >
    );
}

export default function UpgradeWizardPage() {
    return (
        <Suspense fallback={<DashboardLayout user={null}><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>}>
            <UpgradeWizardPageComponent />
        </Suspense>
    )
}
