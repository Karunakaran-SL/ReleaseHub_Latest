
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import Step1Specification from '@/app/platform-engineering/platform-builder/_components/step1-specification';
import Step2VmConfig from '@/app/platform-engineering/platform-builder/_components/step2-vm-config';
import Step3Kubernetes from '@/app/platform-engineering/platform-builder/_components/step3-kubernetes';
import Step4Summary from '@/app/platform-engineering/platform-builder/_components/step4-summary';
import { VisualBuilder } from '@/app/platform-engineering/platform-builder/_components/visual-builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EditPlatformFoundationPage() {
    const [user, setUser] = useState<User | null>(null);
    const [step, setStep] = useState(1);
    const [platformFoundation, setPlatformFoundation] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;
        
        async function fetchFoundation() {
            setLoading(true);
            try {
                const res = await fetch(`/api/platform-foundations/${id}`);
                if (!res.ok) throw new Error('Failed to fetch platform foundation');
                const data = await res.json();
                setPlatformFoundation(data);
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchFoundation();
    }, [id, toast]);
    
    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);
    
    const updateFoundation = (data: any) => {
        setPlatformFoundation((prev: any) => ({...prev, ...data}));
    };
    
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/platform-foundations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(platformFoundation)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update platform foundation.');
            }
            toast({ title: 'Success', description: 'Platform Foundation updated successfully.' });
            router.push('/platform-engineering/platform-foundations');
            router.refresh();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        if (loading || !platformFoundation) return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;

        switch (step) {
            case 1:
                return <Step1Specification data={platformFoundation} onUpdate={updateFoundation} />;
            case 2:
                return <Step2VmConfig data={platformFoundation} onUpdate={updateFoundation} />;
            case 3:
                return <Step3Kubernetes data={platformFoundation} onUpdate={updateFoundation} />;
            case 4:
                 return <Step4Summary data={platformFoundation} />;
            default:
                return null;
        }
    };
    
    const isNextDisabled = (): boolean => {
        if (!platformFoundation) return true;
        switch (step) {
            case 1:
                return !platformFoundation.specification;
            case 2:
                const needsHypervisor = platformFoundation.specification?.hw_type?.name === 'Blade' && platformFoundation.hypervisor;
                const isVirtual = platformFoundation.specification?.hw_type?.name === 'Virtual';
                if (needsHypervisor) {
                    return !platformFoundation.virtual_machines || platformFoundation.virtual_machines.length === 0;
                }
                if (isVirtual) return false;
                return true; 
            case 3:
                return !platformFoundation.kubernetes?.distribution;
            default:
                return false;
        }
    };

    if (loading || !platformFoundation) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10 flex flex-col h-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Edit Platform Foundation</h1>
                    <p className="text-muted-foreground">Modify the layers of your platform foundation.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Step {step}: {
                                ["Select Specification", "Configure VMs", "Setup Kubernetes", "Review & Finalize"][step - 1]
                            }</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {step === 1 && (
                                <div className="space-y-4 mb-6">
                                    <Label htmlFor="foundation-name">Platform Foundation Name</Label>
                                    <Input id="foundation-name" value={platformFoundation.name} onChange={(e) => updateFoundation({ name: e.target.value })}/>
                                </div>
                            )}
                            {renderStep()}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" onClick={handleBack} disabled={step === 1 || isSubmitting}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            {step < 4 ? (
                                <Button onClick={handleNext} disabled={isNextDisabled()}>
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                                    Update Platform Foundation
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                    
                    <VisualBuilder foundation={platformFoundation} />
                </div>
            </main>
        </DashboardLayout>
    );
}
