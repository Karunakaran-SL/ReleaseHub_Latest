'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, CmdbTenant, OnboardingConfiguration } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, ArrowRight } from 'lucide-react';
import OnboardingStepper from './_components/onboarding-stepper';

type NewTenantFormState = Omit<CmdbTenant, '_id' | 'onboarding_status'>;

export default function CreateTenantPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [formState, setFormState] = useState<Partial<NewTenantFormState>>({});
    const router = useRouter();
    const { toast } = useToast();

    const [step, setStep] = useState(1);
    const [onboardingConfig, setOnboardingConfig] = useState<OnboardingConfiguration | null>(null);
    const [newTenant, setNewTenant] = useState<CmdbTenant | null>(null);


    useEffect(() => {
        getUser().then(setUser);
        async function fetchConfig() {
            try {
                const res = await fetch('/api/settings/tenant-onboarding');
                if (res.ok) {
                    const configs = await res.json();
                    const latestConfig = configs.reduce((latest: OnboardingConfiguration, current: OnboardingConfiguration) => 
                        current.version > latest.version ? current : latest
                    , configs[0]);
                    setOnboardingConfig(latestConfig);
                } else {
                     toast({ variant: 'destructive', title: 'Error', description: 'Failed to load onboarding configuration.' });
                }
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Error', description: 'Could not load onboarding settings.' });
            }
        }
        fetchConfig();
    }, [toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };

    const handleFirstStepSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/cmdb/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState),
            });

            if (response.ok) {
                const createdTenant = await response.json();
                setNewTenant(createdTenant);
                toast({ title: 'Success', description: 'Tenant created. Proceeding to onboarding.' });
                setStep(2);
            } else {
                const errorData = await response.json();
                toast({ variant: 'destructive', title: 'Error', description: errorData.message || 'Failed to create tenant.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };
    
    if (step === 2 && onboardingConfig && newTenant) {
        return (
            <DashboardLayout user={user}>
                <OnboardingStepper 
                    config={onboardingConfig} 
                    entityId={newTenant._id} 
                    entityType="tenant"
                    entityName={newTenant.name}
                />
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <form onSubmit={handleFirstStepSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Onboard a New Tenant - Step 1: Basic Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Tenant Name *</Label>
                                <Input id="name" value={formState.name || ''} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <Label htmlFor="id">Tenant ID *</Label>
                                <Input id="id" value={formState.id || ''} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={formState.description || ''} onChange={handleInputChange} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()}>CANCEL</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                                NEXT
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </DashboardLayout>
    );
}
