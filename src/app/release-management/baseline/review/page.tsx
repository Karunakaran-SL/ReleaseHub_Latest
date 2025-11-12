
'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, CmdbTenant } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Package as PackageIcon, Loader2, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

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

function validateDependencies(baselineData: any, allTenants: CmdbTenant[]): ValidationResult {
    const corrections: ValidationResult['corrections'] = [];
    let isValid = true;
    
    if (!baselineData || !allTenants || !baselineData.tenants) {
        return { isValid: true, corrections: [] };
    }
    
    const selectedTenants = [...baselineData.tenants]; 

    for (const tenant of selectedTenants) {
        const fullTenantData = allTenants.find(t => t.name === tenant.name && t.version === tenant.version);
        if (!fullTenantData || !fullTenantData.dependent_tenants) continue;

        for (const dependency of fullTenantData.dependent_tenants) {
            const requiredTenantName = dependency.name;
            const requiredTenantVersion = dependency.version; 

            const actualTenantInBaseline = selectedTenants.find(t => t.name === requiredTenantName);
            
            if (actualTenantInBaseline && requiredTenantVersion && actualTenantInBaseline.version !== requiredTenantVersion) {
                const isAlreadyCorrected = corrections.some(c => c.tenantId === actualTenantInBaseline.id && c.toVersion === requiredTenantVersion);

                if (!isAlreadyCorrected) {
                    isValid = false;
                    const correction = {
                        tenantId: actualTenantInBaseline.id,
                        tenantName: actualTenantInBaseline.name,
                        fromVersion: actualTenantInBaseline.version,
                        toVersion: requiredTenantVersion,
                        reason: `Required by ${tenant.name} v${tenant.version}.`,
                    };
                    corrections.push(correction);
                    actualTenantInBaseline.version = requiredTenantVersion; // Apply correction for subsequent checks
                }
            }
        }
    }

    return { isValid, corrections };
}


function BaselineReviewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [baselineData, setBaselineData] = useState<any | null>(null);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [versionIncrementType, setVersionIncrementType] = useState<'major' | 'minor' | 'patch'>('patch');
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const applyCorrections = useCallback((data: any, corrections: ValidationResult['corrections']) => {
        if (!corrections || corrections.length === 0) return data;
        const correctedData = JSON.parse(JSON.stringify(data));
        corrections.forEach(correction => {
            const tenantToUpdate = correctedData.tenants.find((t: any) => t.id === correction.tenantId);
            if (tenantToUpdate) {
                tenantToUpdate.version = correction.toVersion;
            }
        });
        return correctedData;
    }, []);

    useEffect(() => {
        getUser().then(setUser);
        const productId = searchParams.get('productId');

        if (!productId) {
             toast({ variant: 'destructive', title: 'Missing Information', description: 'No product ID provided. Please start over.' });
             router.push('/release-management/baseline/create');
             return;
        }

        async function loadAndValidateData() {
            setLoading(true);
            try {
                const selectionsData = sessionStorage.getItem(`baseline-selections-${productId}`);
                if (!selectionsData) {
                     throw new Error('Baseline selection data not found in session. Please start over.');
                }
                const selections = JSON.parse(selectionsData);

                const [treeRes, allTenantsRes] = await Promise.all([
                    fetch(`/api/dependency-tree/product/${productId}`),
                    fetch('/api/cmdb/tenants'),
                ]);

                if (!treeRes.ok) throw new Error('Failed to fetch dependency tree.');
                if (!allTenantsRes.ok) throw new Error('Failed to fetch tenant data.');

                const tree = await treeRes.json();
                const allTenants = await allTenantsRes.json();

                // Apply user's selected versions to the freshly fetched tree
                tree.tenants.forEach((tenant: any) => {
                    if (selections.tenantVersions[tenant.id]) {
                        tenant.version = selections.tenantVersions[tenant.id];
                    }
                });
                tree.version = selections.productVersion;


                const validation = validateDependencies(tree, allTenants);
                const finalData = applyCorrections(tree, validation.corrections);

                setValidationResult(validation);
                setBaselineData(finalData);

                if (!validation.isValid) {
                    toast({
                        variant: "default",
                        title: "Dependencies Corrected",
                        description: "Some tenant versions were automatically updated to satisfy dependencies.",
                    });
                }
            } catch(error: any) {
                 toast({ variant: 'destructive', title: 'Error Loading Data', description: error.message });
                 router.push('/release-management/baseline/create');
            } finally {
                setLoading(false);
            }
        }

        loadAndValidateData();

    }, [searchParams, router, toast, applyCorrections]);

    const handleBuildPackage = async () => {
        setLoading(true);
        // We already have the corrected data in `baselineData` state
        const finalBaselineData = { 
            product: {
                id: baselineData.id,
                name: baselineData.name,
            },
            specifications: baselineData.specifications,
            tenants: baselineData.tenants,
            versionIncrementType: versionIncrementType
        };

        try {
            const response = await fetch('/api/baselines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalBaselineData),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create baseline package.');
            }
            
            const newBaseline = await response.json();
            
            toast({
                title: "Baseline Created",
                description: `Successfully created baseline for product: ${finalBaselineData.product.name}`,
            });

            sessionStorage.removeItem(`baseline-selections-${searchParams.get('productId')}`);
            router.push(`/release-management/baseline/${newBaseline._id}/summary`);
            
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    }
    
    if (loading || !baselineData || !baselineData.name) {
        return (
             <DashboardLayout user={user}>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="ml-4 text-muted-foreground">Loading Baseline Data...</p>
                </div>
            </DashboardLayout>
        );
    }

    const compatibilityMatrixItems = baselineData ? [
        ...baselineData.tenants.map((t: any) => ({ type: 'Tenant', ...t})),
        ...baselineData.tenants.flatMap((t: any) => t.components.map((c: any) => ({ type: 'Component', ...c}))),
        ...baselineData.tenants.flatMap((t: any) => t.applications.map((a: any) => ({ type: 'Application', ...a}))),
    ] : [];

    return (
         <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 flex justify-center items-start">
                <Card className="w-full max-w-6xl">
                    <CardHeader>
                        <CardTitle>Review New Baseline: {baselineData.name}</CardTitle>
                        <CardDescription>Phase 2: Review and confirm the components of the new baseline.</CardDescription>
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

                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold">Root Product</h3>
                                <p className="text-muted-foreground">{baselineData.name}</p>
                            </div>
                            <div>
                                <Label>New Version Increment</Label>
                                <RadioGroup defaultValue="patch" value={versionIncrementType} onValueChange={(value: 'major' | 'minor' | 'patch') => setVersionIncrementType(value)} className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="major" id="major" />
                                        <Label htmlFor="major">Major</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="minor" id="minor" />
                                        <Label htmlFor="minor">Minor</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="patch" id="patch" />
                                        <Label htmlFor="patch">Patch</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        <Separator />
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Specifications ({baselineData.specifications.length})</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {baselineData.specifications.map((spec: any) => (
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
                    </CardContent>
                    <CardFooter className="flex justify-between">
                         <Button variant="outline" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Selection
                        </Button>
                        <Button onClick={handleBuildPackage} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackageIcon className="mr-2 h-4 w-4" />}
                            Build Test Baseline Package
                        </Button>
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
