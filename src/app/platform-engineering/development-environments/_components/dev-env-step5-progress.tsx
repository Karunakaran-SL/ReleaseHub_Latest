'use client';
import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Loader2, PartyPopper, Terminal, ChevronRight, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExecutionLog {
    command: string;
    status: 'Success' | 'Exists' | 'Failed';
    message: string;
    timestamp: string;
}

interface DevEnvStep5ProgressProps {
    logs: ExecutionLog[];
    status: 'PROVISIONING' | 'ACTIVE' | 'DEGRADED' | 'FAILED';
}

export default function DevEnvStep5Progress({ logs: initialLogs, status }: DevEnvStep5ProgressProps) {
    const [visibleLogs, setVisibleLogs] = useState<ExecutionLog[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const router = useRouter();

    useEffect(() => {
        if (initialLogs.length > 0 && currentIndex < initialLogs.length) {
            const timer = setTimeout(() => {
                setVisibleLogs(prev => [...prev, initialLogs[currentIndex]]);
                setCurrentIndex(prev => prev + 1);
            }, 800); // Simulate "real-time" flow
            return () => clearTimeout(timer);
        }
    }, [initialLogs, currentIndex]);

    const isComplete = status !== 'PROVISIONING' && currentIndex >= initialLogs.length;

    return (
        <div className="space-y-6 py-4">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Provisioning Development Environment</h2>
                <p className="text-muted-foreground">Detailed orchestration workflow and execution status.</p>
            </div>

            <Card className="border-primary/20 bg-zinc-950 text-zinc-300 shadow-2xl overflow-hidden">
                <CardHeader className="border-b border-zinc-800 bg-zinc-900/50 py-3 px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-mono">
                            <Terminal className="h-4 w-4 text-primary" />
                            <span>deployment-workflow.sh</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                            <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                            <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[400px] w-full">
                        <div className="p-4 font-mono text-xs space-y-4">
                            {visibleLogs.map((log, index) => (
                                <div key={index} className="animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {log.status === 'Success' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                            {log.status === 'Exists' && <AlertCircle className="h-3.5 w-3.5 text-blue-400" />}
                                            {log.status === 'Failed' && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-zinc-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                                <span className="text-primary">$</span>
                                                <span className="text-zinc-100">{log.command}</span>
                                            </div>
                                            <div className={`pl-6 ${log.status === 'Failed' ? 'text-red-400' : 'text-zinc-400'}`}>
                                                <ChevronRight className="inline h-3 w-3 mr-1" />
                                                {log.message}
                                            </div>
                                        </div>
                                        <div className="text-[10px] uppercase font-bold text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                                            {log.status}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {!isComplete && status === 'PROVISIONING' && (
                                <div className="flex items-center gap-3 animate-pulse">
                                    <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                                    <span className="text-zinc-500 italic">Executing next command...</span>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {isComplete && (
                <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-700">
                    <div className={`flex items-center gap-2 font-semibold text-lg ${status === 'FAILED' ? 'text-red-500' : 'text-green-600'}`}>
                        {status === 'FAILED' ? <XCircle className="h-6 w-6" /> : <PartyPopper className="h-6 w-6" />}
                        {status === 'FAILED' ? 'Provisioning Failed' : 'Environment Successfully Provisioned!'}
                    </div>
                    <Button size="lg" className="px-8 shadow-lg" onClick={() => router.push('/platform-engineering/development-environments')}>
                        {status === 'FAILED' ? 'Go to List' : 'Finish & Launch Environment'}
                    </Button>
                </div>
            )}
        </div>
    );
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`rounded-xl border ${className}`}>{children}</div>;
}
function CardHeader({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}
function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}
