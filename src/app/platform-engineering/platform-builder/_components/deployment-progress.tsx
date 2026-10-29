'use client';
import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface ProgressStep {
    id: number;
    label: string;
    status: 'pending' | 'loading' | 'completed' | 'error';
}

export function DeploymentProgress() {
    const [steps, setSteps] = useState<ProgressStep[]>([
        { id: 1, label: 'Connectivity Check', status: 'loading' },
        { id: 2, label: 'Namespace Provisioning', status: 'pending' },
        { id: 3, label: 'ArgoCD Deployment', status: 'pending' },
        { id: 4, label: 'Harbor Deployment', status: 'pending' },
        { id: 5, label: 'Finalizing Foundation', status: 'pending' },
    ]);

    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];

        // Simulating the backend steps for UX
        const updateStep = (id: number, status: ProgressStep['status']) => {
            setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
        };

        timers.push(setTimeout(() => {
            updateStep(1, 'completed');
            updateStep(2, 'loading');
        }, 1500));

        timers.push(setTimeout(() => {
            updateStep(2, 'completed');
            updateStep(3, 'loading');
        }, 3000));

        timers.push(setTimeout(() => {
            updateStep(3, 'completed');
            updateStep(4, 'loading');
        }, 5000));

        timers.push(setTimeout(() => {
            updateStep(4, 'completed');
            updateStep(5, 'loading');
        }, 7000));

        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-card mt-6">
            <h3 className="font-semibold text-lg">Platform Deployment Progress</h3>
            <div className="space-y-3">
                {steps.map((step) => (
                    <div key={step.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {step.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                            {step.status === 'loading' && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
                            {step.status === 'pending' && <Circle className="h-5 w-5 text-muted-foreground" />}
                            <span className={step.status === 'pending' ? 'text-muted-foreground' : 'font-medium'}>
                                {step.label}
                            </span>
                        </div>
                        <span className="text-xs uppercase font-bold text-muted-foreground">
                            {step.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
