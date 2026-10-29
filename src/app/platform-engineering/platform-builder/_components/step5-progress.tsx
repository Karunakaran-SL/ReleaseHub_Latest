'use client';
import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Loader2, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ProgressStep {
    id: number;
    label: string;
    status: 'pending' | 'loading' | 'completed' | 'error';
}

export default function Step5Progress() {
    const [steps, setSteps] = useState<ProgressStep[]>([
        { id: 1, label: 'Connectivity Check', status: 'loading' },
        { id: 2, label: 'Namespace Provisioning', status: 'pending' },
        { id: 3, label: 'ArgoCD Deployment', status: 'pending' },
        { id: 4, label: 'Harbor Deployment', status: 'pending' },
        { id: 5, label: 'Finalizing Foundation', status: 'pending' },
    ]);
    const [isComplete, setIsComplete] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];

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

        timers.push(setTimeout(() => {
            updateStep(5, 'completed');
            setIsComplete(true);
        }, 8500));

        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="space-y-8 py-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Deploying Platform Foundation</h2>
                <p className="text-muted-foreground">Orchestrating resources on the Managed Kubernetes cluster.</p>
            </div>

            <div className="max-w-md mx-auto space-y-4 p-6 border rounded-xl bg-card shadow-sm">
                {steps.map((step) => (
                    <div key={step.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {step.status === 'completed' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                            {step.status === 'loading' && <Loader2 className="h-6 w-6 text-primary animate-spin" />}
                            {step.status === 'pending' && <Circle className="h-6 w-6 text-muted-foreground" />}
                            <span className={`text-lg ${step.status === 'pending' ? 'text-muted-foreground' : 'font-medium'}`}>
                                {step.label}
                            </span>
                        </div>
                        <span className="text-xs uppercase font-bold px-2 py-1 rounded bg-muted text-muted-foreground">
                            {step.status}
                        </span>
                    </div>
                ))}
            </div>

            {isComplete && (
                <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                    <div className="flex items-center gap-2 text-green-600 font-semibold text-lg">
                        <PartyPopper className="h-6 w-6" />
                        Platform Successfully Provisioned!
                    </div>
                    <Button size="lg" onClick={() => router.push('/platform-engineering/platform-foundations')}>
                        Finish & View Foundation
                    </Button>
                </div>
            )}
        </div>
    );
}
