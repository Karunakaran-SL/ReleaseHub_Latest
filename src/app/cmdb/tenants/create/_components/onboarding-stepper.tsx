'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import OnboardingPhaseComponent from './onboarding-phase';
import type { OnboardingConfiguration, CmdbTenant } from '@/lib/definitions';
import { ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStepperProps {
    config: OnboardingConfiguration;
    tenant: CmdbTenant;
    entityType: 'tenant' | 'component' | 'application';
}

const statusColors: Record<string, string> = {
    'Not Started': 'bg-gray-200 text-gray-800',
    'In Progress': 'bg-blue-200 text-blue-800',
    'Done': 'bg-green-200 text-green-800',
    'Cancelled': 'bg-red-200 text-red-800',
    'Skipped': 'bg-yellow-200 text-yellow-800',
};


export default function OnboardingStepper({ config, tenant, entityType }: OnboardingStepperProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
    const [phasesState, setPhasesState] = useState<Record<string, any>>({});
    
    // Initialize state from config
    useEffect(() => {
        const initialState: Record<string, any> = {};
        config.phases.forEach(phase => {
            initialState[phase.id] = { status: 'Not Started' };
            phase.fields.forEach(field => {
                 initialState[phase.id][field.name] = { value: '', proofLink: '' };
            });
        });
        setPhasesState(initialState);
    }, [config]);


    const handlePhaseStateChange = (phaseId: string, fieldName: string, value: any) => {
        setPhasesState(prev => ({
            ...prev,
            [phaseId]: {
                ...prev[phaseId],
                [fieldName]: value
            }
        }));
    };

    const handleStatusChange = (phaseId: string, status: string) => {
         setPhasesState(prev => ({
            ...prev,
            [phaseId]: { ...prev[phaseId], status }
        }));
    };

    const handleFinish = async () => {
        setLoading(true);
        
        const tenantPhases = config.phases.map(phaseConfig => {
            const phaseData = phasesState[phaseConfig.id];
            return {
                id: phaseConfig.id,
                name: phaseConfig.name,
                version: "1.0", // This could be dynamic based on config version
                status: phaseData.status || "Not Started",
                fields: phaseConfig.fields.map(fieldConfig => {
                    const fieldData = phaseData[fieldConfig.name];
                    return {
                        name: fieldConfig.name,
                        value: fieldData?.value || '',
                        proof: { link: fieldData?.proofLink || '' },
                    };
                }),
            };
        });

        const updatePayload = {
            phases: tenantPhases,
            updateComment: "Completed initial onboarding process."
        };
        
        try {
            const response = await fetch(`/api/cmdb/tenants/${tenant._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save onboarding status.');
            }
            toast({ title: 'Onboarding Completed', description: `${tenant.name} has been onboarded successfully.` });
            router.push(`/cmdb/${entityType}s`);
            router.refresh();
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    }


    return (
        <main className="flex-1 p-6 md:p-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Onboarding: {tenant.name}</h1>
                <p className="text-muted-foreground">Follow the steps below to complete the onboarding process.</p>
            </div>
            
            <div className="relative flex flex-wrap items-center justify-center p-8 gap-y-8">
                {config.phases.map((phase, index) => (
                    <div key={phase.id} className="flex items-center">
                        <OnboardingPhaseComponent 
                            phase={phase}
                            phaseState={phasesState[phase.id] || {}}
                            onStateChange={(fieldName, value) => handlePhaseStateChange(phase.id, fieldName, value)}
                            onStatusChange={(status) => handleStatusChange(phase.id, status)}
                            isExpanded={expandedPhase === phase.id}
                            onExpand={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                            statusColor={statusColors[phasesState[phase.id]?.status] || 'bg-gray-200 text-gray-800'}
                        />
                        {index < config.phases.length - 1 && (
                            <ChevronRight className="h-8 w-8 text-muted-foreground mx-4" />
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-12 flex justify-end">
                 <Button onClick={handleFinish} size="lg" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <CheckCircle className="mr-2 h-5 w-5" />
                    FINISH ONBOARDING
                </Button>
            </div>

             {/* Backdrop for expanded phase */}
            {expandedPhase && (
                <div 
                    className="fixed inset-0 bg-black/30 z-0" 
                    onClick={() => setExpandedPhase(null)}
                />
            )}
        </main>
    );
}
