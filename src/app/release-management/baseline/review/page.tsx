
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, DependencyTree } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

function BaselineReviewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [baselineData, setBaselineData] = useState<DependencyTree | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getUser().then(setUser);
        const data = searchParams.get('data');
        if (data) {
            try {
                setBaselineData(JSON.parse(data));
            } catch (error) {
                console.error("Failed to parse baseline data", error);
                router.push('/release-management/baseline/create');
            }
        } else {
             router.push('/release-management/baseline/create');
        }
    }, [searchParams, router]);

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
        // Placeholder for API call
        console.log("Creating baseline...", baselineData);
        setTimeout(() => {
             setLoading(false);
             router.push('/release-management/baseline');
        }, 1500);
    }
    
    return (
         <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 flex justify-center items-start">
                <Card className="w-full max-w-6xl">
                    <CardHeader>
                        <CardTitle>Review New Baseline</CardTitle>
                        <CardDescription>Phase 2: Review and confirm the components of the new baseline for <strong>{baselineData.name} v{baselineData.version}</strong>.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Root Product</h3>
                            <p className="text-muted-foreground">{baselineData.name} - v{baselineData.version}</p>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Specifications ({baselineData.specifications.length})</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {baselineData.specifications.map(spec => (
                                    <div key={spec.id} className="text-sm p-2 bg-muted rounded-md">{spec.name} - v{spec.version}</div>
                                ))}
                            </div>
                        </div>
                         <Separator />
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Tenants ({baselineData.tenants.length})</h3>
                            <div className="space-y-4">
                            {baselineData.tenants.map(tenant => (
                                <Card key={tenant.id} className="bg-secondary/50">
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-md">{tenant.name} - v{tenant.version}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 space-y-2">
                                        <div>
                                            <h4 className="font-medium text-sm">Components ({tenant.components.length})</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                                            {tenant.components.map(comp => <div key={comp.id} className="text-xs p-2 bg-background rounded">{comp.name} - v{comp.version}</div>)}
                                            </div>
                                        </div>
                                         <div>
                                            <h4 className="font-medium text-sm">Applications ({tenant.applications.length})</h4>
                                             <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                                            {tenant.applications.map(app => <div key={app.id} className="text-xs p-2 bg-background rounded">{app.name} - v{app.version}</div>)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            </div>
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
        <Suspense fallback={<div>Loading...</div>}>
            <BaselineReviewContent />
        </Suspense>
    );
}

