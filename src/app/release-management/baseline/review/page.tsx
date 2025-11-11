
'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, DependencyTree, CmdbTenant } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ValidationResult {
    isValid: boolean;
    corrections: {
        tenantId: string;
        tenantName: string;
        fromVersion: string;
        toVersion: string;
        reason: string;
    }[];
}

function validateDependencies(baselineData: any): ValidationResult {
    const corrections: ValidationResult['corrections'] = [];
    let isValid = true;
    
    const allBaselineTenants = baselineData.allTenants as CmdbTenant[];
    const selectedTenants = [...baselineData.tenants]; // Create a mutable copy

    for (const tenant of selectedTenants) {
        const fullTenantData = allBaselineTenants.find(t => t.name === tenant.name && t.version === tenant.version);
        if (!fullTenantData || !fullTenantData.dependent_tenants) continue;

        for (const dependency of fullTenantData.dependent_tenants) {
            const requiredTenantId = dependency.id;
            const requiredTenantName = dependency.name;
            const requiredTenantVersion = dependency.version; // Assuming version is in dependency object

            const actualTenantInBaseline = selectedTenants.find(t => t.name === requiredTenantName);

            if (actualTenantInBaseline && actualTenantInBaseline.version !== requiredTenantVersion) {
                isValid = false;
                const correction = {
                    tenantId: actualTenantInBaseline.id,
                    tenantName: actualTenantInBaseline.name,
                    fromVersion: actualTenantInBaseline.version,
                    toVersion: requiredTenantVersion,
                    reason: `Required by ${tenant.name} v${tenant.version}.`,
                };
                corrections.push(correction);
                // Apply correction to our mutable copy for subsequent checks
                actualTenantInBaseline.version = requiredTenantVersion;
            }
        }
    }
    
    // Update baseline data with corrections
    if (!isValid) {
        for (const correction of corrections) {
            const tenantToUpdate = baselineData.tenants.find((t: any) => t.id === correction.tenantId);
            if (tenantToUpdate) {
                tenantToUpdate.version = correction.toVersion;
            }
        }
    }

    return { isValid, corrections };
}


function BaselineReviewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [baselineData, setBaselineData] = useState<DependencyTree | null>(null);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
        const productId = searchParams.get('productId');

        if (productId) {
            try {
                const data = sessionStorage.getItem(`baseline-data-${productId}`);
                if (data) {
                    const parsedData = JSON.parse(data);
                    
                    const validation = validateDependencies(parsedData);
                    setValidationResult(validation);

                    setBaselineData(parsedData);
                    
                    if (!validation.isValid) {
                        toast({
                            variant: "default",
                            title: "Dependencies Corrected",
                            description: "Some tenant versions were automatically updated to satisfy dependencies.",
                        });
                    }

                } else {
                    throw new Error('Baseline data not found in session. Please start over.');
                }
            } catch (error: any) {
                console.error("Failed to parse baseline data", error);
                toast({
                    variant: 'destructive',
                    title: 'Error Loading Data',
                    description: error.message,
                });
                router.push('/release-management/baseline/create');
            }
        } else {
             toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'No product ID provided. Please start over.',
             });
             router.push('/release-management/baseline/create');
        }
    }, [searchParams, router, toast]);

    const compatibilityMatrixItems = useMemo(() => {
        if (!baselineData) return [];
        const items = [];
        for (const tenant of baselineData.tenants) {
            items.push({ type: 'Tenant', name: tenant.name, version: tenant.version });
            for (const comp of (tenant as any).components) {
                items.push({ type: 'Component', name: comp.name, version: comp.version });
            }
            for (const app of (tenant as any).applications) {
                items.push({ type: 'Application', name: app.name, version: app.version });
            }
        }
        return items;
    }, [baselineData]);

    if (!baselineData) {
        return (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-4 text-muted-foreground">Loading Baseline Data...</p>
            </div>
        );
    }
    
    const handleCreateBaseline = () => {
        setLoading(true);
        const finalBaselineData = { ...baselineData };
        delete (finalBaselineData as any).allTenants; // Clean up data before sending

        toast({
            title: "Creating Baseline...",
            description: "Submitting the new baseline for product: " + finalBaselineData.name,
        });

        setTimeout(() => {
             setLoading(false);
             // Clean up session storage
             sessionStorage.removeItem(`baseline-data-${searchParams.get('productId')}`);
             toast({
                title: "Success!",
                description: "Baseline created successfully.",
             });
             router.push('/release-management/baseline');
        }, 1500);
    }
    
    return (
         <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 flex justify-center items-start">
                <Card className="w-full max-w-6xl">
                    <CardHeader>
                        <CardTitle>Review New Baseline</CardTitle>
                        <CardDescription>Phase 2: Review and confirm the components of the new baseline for <strong>{baselineData.name}</strong>.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        
                        {validationResult && !validationResult.isValid && (
                            <Alert variant="default" className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <AlertTitle className="text-yellow-800 dark:text-yellow-300">Automatic Version Corrections</AlertTitle>
                                <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                                    The following tenant versions were automatically updated to maintain dependency integrity:
                                    <ul className="list-disc pl-5 mt-2 text-xs">
                                        {validationResult.corrections.map((c, i) => (
                                            <li key={i}>
                                                <strong>{c.tenantName}</strong> updated from v{c.fromVersion} to <strong>v{c.toVersion}</strong>. <span className="text-muted-foreground">{c.reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        <div>
                            <h3 className="text-lg font-semibold mb-2">Root Product</h3>
                            <p className="text-muted-foreground">{baselineData.name}</p>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Specifications ({baselineData.specifications.length})</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {baselineData.specifications.map(spec => (
                                    <div key={spec.id} className="text-sm p-2 bg-muted rounded-md">{spec.name} - v{spec.version || 'N/A'}</div>
                                ))}
                            </div>
                        </div>
                         <Separator />
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Tenants ({baselineData.tenants.length})</h3>
                            <div className="space-y-4">
                            {baselineData.tenants.map((tenant: any) => (
                                <Card key={tenant.id} className="bg-secondary/50">
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-md flex items-center">
                                            {tenant.name} - v{tenant.version}
                                            {validationResult?.corrections.some(c => c.tenantId === tenant.id) && (
                                                <span className="ml-2 text-xs font-normal text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">Auto-Corrected</span>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 space-y-2">
                                        <div>
                                            <h4 className="font-medium text-sm">Components ({tenant.components.length})</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                                            {tenant.components.map((comp: any) => <div key={comp.id} className="text-xs p-2 bg-background rounded">{comp.name} - v{comp.version}</div>)}
                                            </div>
                                        </div>
                                         <div>
                                            <h4 className="font-medium text-sm">Applications ({tenant.applications.length})</h4>
                                             <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                                            {tenant.applications.map((app: any) => <div key={app.id} className="text-xs p-2 bg-background rounded">{app.name} - v{app.version}</div>)}
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
                                        {compatibilityMatrixItems.map((item, index) => (
                                            <TableRow key={index}>
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
                    </CardContent>
                    <CardFooter className="flex justify-between">
                         <Button variant="outline" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Selection
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Validate Baseline
                            </Button>
                             <Button onClick={handleCreateBaseline} disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                Create Baseline
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}


export default function ReviewBaselinePage() {
    return (
        <Suspense fallback={<DashboardLayout user={null}><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>}>
            <BaselineReviewContent />
        </Suspense>
    );
}
