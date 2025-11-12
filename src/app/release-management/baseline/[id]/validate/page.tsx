
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Baseline, OnboardingConfiguration, OnboardingPhase } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ValidationPhaseComponent from './_components/validation-phase';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
    const [phasesState, setPhasesState] = useState<Record<string, any>>({});
    const [popupState, setPopupState] = useState<any | null>(null);


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
                const baselineRes = await fetch(`/api/baselines/${id}`);

                if (!baselineRes.ok) throw new Error('Failed to fetch baseline.');
                const currentBaseline: Baseline = await baselineRes.json();
                setBaseline(currentBaseline);

                if (!currentBaseline.validation_phases) {
                    throw new Error('No validation phases found in this baseline.');
                }
                
                const initialState: Record<string, any> = {};
                currentBaseline.validation_phases.forEach((phase: OnboardingPhase) => {
                    const phaseState: any = { status: phase.status || 'Not Started' };
                     phase.fields.forEach(field => {
                        phaseState[`${field.name}_value`] = field.value || '';
                        phaseState[`${field.name}_proofLink`] = field.proof?.link || '';
                    });
                    initialState[phase.id] = phaseState;
                });
                setPhasesState(initialState);
                
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
        setPopupState({ ...(phasesState[phaseId] || {}) });
    };

    const handleCancelPopup = () => {
        setExpandedPhase(null);
        setPopupState(null);
    };

    const handleSavePopup = async () => {
        if (!baseline || !expandedPhase || !popupState) return;

        setSaving(true);
        const updatedPhases = baseline.validation_phases.map(phaseConfig => {
            if (phaseConfig.id === expandedPhase) {
                const phaseData = popupState;
                 return {
                    ...phaseConfig,
                    status: phaseData.status,
                    fields: phaseConfig.fields.map(fieldConfig => ({
                        ...fieldConfig,
                        value: phaseData[`${fieldConfig.name}_value`] || '',
                        proof: { link: phaseData[`${fieldConfig.name}_proofLink`] || '' }
                    }))
                };
            }
            // For other phases, construct their state from the main `phasesState`
            const existingPhaseData = phasesState[phaseConfig.id] || {};
             return {
                ...phaseConfig,
                status: existingPhaseData.status,
                fields: phaseConfig.fields.map(fieldConfig => ({
                    ...fieldConfig,
                    value: existingPhaseData[`${fieldConfig.name}_value`] || '',
                    proof: { link: existingPhaseData[`${fieldConfig.name}_proofLink`] || '' }
                }))
            };
        });

        try {
             const response = await fetch(`/api/baselines/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: baseline.status, // Send current status
                    validation_phases: updatedPhases,
                    updateComment: `Updated validation phase: ${baseline.validation_phases.find(p => p.id === expandedPhase)?.name}`
                }),
            });
            if (!response.ok) {
                 const errorData = await response.json();
                 console.error(errorData);
                 throw new Error(errorData.message || 'Failed to save phase progress.');
            }

            const updatedBaseline = await response.json();
            setBaseline(updatedBaseline);

            // Update local state after successful save
            setPhasesState(prev => ({ ...prev, [expandedPhase]: popupState }));
            toast({ title: "Progress Saved", description: "Your changes to the validation phase have been saved."});

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setSaving(false);
        }
        
        handleCancelPopup();
    };
    
    const handlePopupStateChange = (fieldName: string, value: any) => {
        setPopupState((prev: any) => ({ ...prev, [fieldName]: value }));
    };
    
    const handlePopupStatusChange = (status: string) => {
        setPopupState((prev: any) => ({ ...prev, status }));
    };

    if (loading) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>
    }

    if (!baseline || !baseline.validation_phases) {
        return <DashboardLayout user={user}><div className="flex h-full items-center justify-center"><p>Could not load baseline or validation configuration.</p></div></DashboardLayout>
    }

    const isFinalized = ['RELEASED', 'REJECTED', 'ARCHIVED'].includes(baseline.status);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Validation Pipeline: {baseline.product.name} v{baseline.product.version}</h1>
                    <p className="text-muted-foreground">Execute and track all validation phases for this baseline.</p>
                </div>

                {isFinalized && (
                     <Alert variant="default" className="mb-8 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                        <Lock className="h-4 w-4" />
                        <AlertTitle>Read-Only</AlertTitle>
                        <AlertDescription>
                            This baseline has been finalized and can no longer be modified.
                        </AlertDescription>
                    </Alert>
                )}

                <div className={cn("relative flex flex-wrap items-center justify-center p-8 gap-y-8 gap-x-4", expandedPhase && 'z-30')}>
                    {baseline.validation_phases.map((phase, index) => (
                        <div key={phase.id} className="flex items-center">
                            <ValidationPhaseComponent
                                phase={phase}
                                phaseState={expandedPhase === phase.id ? popupState : phasesState[phase.id]}
                                onStateChange={handlePopupStateChange}
                                onStatusChange={handlePopupStatusChange}
                                isExpanded={expandedPhase === phase.id}
                                onExpand={() => !isFinalized && handleExpandPhase(phase.id)}
                                statusColor={statusColors[phasesState[phase.id]?.status] || 'bg-gray-200 text-gray-800'}
                                onSave={handleSavePopup}
                                onCancel={handleCancelPopup}
                                isReadOnly={isFinalized}
                            />
                            {index < baseline.validation_phases.length - 1 && (
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
                    <Button asChild size="lg" disabled={saving}>
                        <Link href={`/release-management/baseline/${id}/finalize`}>
                            <ArrowRight className="mr-2 h-5 w-5" />
                            Next: Finalize Release
                        </Link>
                    </Button>
                </div>
            </main>
        </DashboardLayout>
    )
}
