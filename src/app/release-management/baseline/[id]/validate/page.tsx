
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Baseline, OnboardingConfiguration } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ValidationPhaseComponent from './_components/validation-phase';
import { cn } from '@/lib/utils';

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


export default function ValidateBaselinePage() {
    const [user, setUser] = useState<User | null>(null);
    const [baseline, setBaseline] = useState<Baseline | null>(null);
    const [validationConfig, setValidationConfig] = useState<OnboardingConfiguration | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
    const [phasesState, setPhasesState] = useState<Record<string, any>>({});
    const [popupState, setPopupState] = useState<any>(null);


    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
        if (!id) {
            toast({ variant: "destructive", title: "Error", description: "No baseline ID found." });
            router.push('/release-management/baseline');
            return;
        }

        async function loadData() {
            setLoading(true);
            try {
                const [baselineRes, configRes] = await Promise.all([
                    fetch('/api/baselines'), // Fetch all and find, as there is no single GET endpoint
                    fetch('/api/settings/baseline-onboarding')
                ]);

                if (!baselineRes.ok) throw new Error('Failed to fetch baselines.');
                const allBaselines = await baselineRes.json();
                const currentBaseline = allBaselines.find((b: Baseline) => b._id === id);
                if (!currentBaseline) throw new Error('Baseline not found.');
                setBaseline(currentBaseline);

                if (!configRes.ok) throw new Error('Failed to fetch baseline validation configuration.');
                const configs = await configRes.json();
                if (configs && configs.length > 0) {
                     const latestConfig = configs.reduce((latest: any, current: any) => current.version > latest.version ? current : latest, configs[0]);
                     setValidationConfig(latestConfig);

                      // Initialize phase states
                    const initialState: Record<string, any> = {};
                    latestConfig.phases.forEach((phase: any) => {
                        initialState[phase.id] = { status: 'Not Started' };
                        phase.fields.forEach((field: any) => {
                            initialState[phase.id][field.name] = { value: '', proofLink: '' };
                        });
                    });
                    setPhasesState(initialState);
                } else {
                    throw new Error('No baseline validation configuration found.');
                }

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id, router, toast]);

    const handleExpandPhase = (phaseId: string) => {
        setExpandedPhase(phaseId);
        setPopupState(JSON.parse(JSON.stringify(phasesState[phaseId])));
    };

    const handleCancelPopup = () => {
        setExpandedPhase(null);
        setPopupState(null);
    };

    const handleSavePopup = () => {
        if (expandedPhase && popupState) {
            setPhasesState(prev => ({ ...prev, [expandedPhase]: popupState }));
        }
        handleCancelPopup();
    };
    
    const handlePopupStateChange = (fieldName: string, value: any) => {
        setPopupState((prev: any) => ({ ...prev, [fieldName]: value }));
    };
    
    const handlePopupStatusChange = (status: string) => {
        setPopupState((prev: any) => ({ ...prev, status }));
    };


    const handleFinish = async () => {
        setSaving(true);
        toast({ title: "Finishing Validation", description: "Saving final validation state... (not implemented)"});
        // In a real app, this would PATCH the baseline with the validation results
        // and likely change its status.
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSaving(false);
        router.push('/release-management/baseline');
    };

    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>
    }

    if (!baseline || !validationConfig) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center">Could not load baseline or validation configuration.</div></DashboardLayout>
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Validation Pipeline: {baseline.product.name} v{baseline.product.version}</h1>
                    <p className="text-muted-foreground">Execute and track all validation phases for this baseline.</p>
                </div>

                <div className={cn("relative flex flex-wrap items-center justify-center p-8 gap-y-8 gap-x-4", expandedPhase && 'z-30')}>
                    {validationConfig.phases.map((phase, index) => (
                        <div key={phase.id} className="flex items-center">
                            <ValidationPhaseComponent
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
                            {index < validationConfig.phases.length - 1 && (
                                <ChevronRight className="h-8 w-8 text-muted-foreground mx-4" />
                            )}
                        </div>
                    ))}
                </div>
                 {expandedPhase && (
                    <div 
                        className="fixed inset-0 bg-black/30 z-10" 
                        onClick={handleCancelPopup}
                    />
                )}

                 <div className="mt-12 flex justify-end">
                    <Button onClick={handleFinish} size="lg" disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <CheckCircle className="mr-2 h-5 w-5" />
                        FINISH VALIDATION
                    </Button>
                </div>
            </main>
        </DashboardLayout>
    )
}
