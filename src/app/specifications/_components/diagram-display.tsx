

'use client';

import { cn } from "@/lib/utils";
import { Cpu, MemoryStick, Database, NetworkIcon, Server, Zap, Monitor, HardDrive } from "lucide-react";

export function DiagramDisplay({ specJson }: { specJson: string }) {
    let spec;
    try {
        spec = JSON.parse(specJson);
    } catch (e) {
        return (
            <div className="h-full bg-muted rounded-md flex items-center justify-center p-4">
                <p className="text-destructive">Invalid JSON format</p>
            </div>
        );
    }

    const isBlade = spec.hw_type?.name === 'Blade';
    const isVirtual = spec.hw_type?.name === 'Virtual';
    const isManagedK8s = isVirtual && spec.clusterType === 'Managed Kubernetes';

    if (isManagedK8s) {
        const namespaces = spec.managedConfig?.namespaces || [];
        const workloads = spec.managedConfig?.workloads || [];

        const workloadsByNamespace: Record<string, any[]> = {};
        namespaces.forEach((ns: string) => {
            workloadsByNamespace[ns] = workloads.filter((w: any) => w.namespace === ns);
        });

        return (
            <div className="h-full bg-muted rounded-md p-4 space-y-4 overflow-auto">
                <h4 className="font-bold text-center">{spec.clusterName || 'Managed Kubernetes Cluster'}</h4>
                <div className="flex justify-center gap-4 text-xs mt-2 mb-4">
                    <span><Cpu className="inline mr-1 h-4 w-4" /> {spec.managedConfig?.cpuCores || 'N/A'} Cores</span>
                    <span><MemoryStick className="inline mr-1 h-4 w-4" /> {spec.managedConfig?.memoryGb || 'N/A'} GB RAM</span>
                    <span><HardDrive className="inline mr-1 h-4 w-4" /> {spec.managedConfig?.diskSizeGb || 'N/A'} GB Disk</span>
                    <span className="font-mono bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded">{spec.managedConfig?.kubernetesVersion || 'K8s'}</span>
                </div>

                <div className="space-y-4">
                    {namespaces.map((ns: string) => {
                        const nsWorkloads = workloadsByNamespace[ns];
                        if (!nsWorkloads || nsWorkloads.length === 0) return null;

                        return (
                            <div key={ns} className="border border-dashed border-primary/40 rounded-lg p-3 bg-background relative pt-4">
                                <span className="absolute -top-3 left-4 bg-background px-2 text-xs font-semibold text-primary">ns: {ns}</span>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                                    {nsWorkloads.map((w: any, i: number) => {
                                        const Icon = w.type === 'StatefulSet' ? Database : w.type === 'DaemonSet' ? Server : Zap;
                                        return (
                                            <div key={i} className="border rounded-md p-2 bg-secondary/10 flex flex-col items-center justify-center text-center hover:bg-secondary/30 transition-colors">
                                                <Icon className="h-5 w-5 text-muted-foreground mb-1" />
                                                <p className="text-[10px] font-mono leading-tight break-all truncate w-full" title={w.name}>{w.name}</p>
                                                <div className="mt-2 flex items-center justify-between w-full px-1 border-t pt-1 border-muted/50">
                                                    <span className="text-[9px] text-muted-foreground">{w.type}</span>
                                                    <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 rounded-full" title="Ready Replicas">{w.readyReplicas}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (isVirtual) {
        const controlPlaneNodes = spec.nodes?.filter((n: any) => n.role === 'Control Plane') || [];
        const workerNodes = spec.nodes?.filter((n: any) => n.role === 'Worker') || [];

        return (
            <div className="h-full bg-muted rounded-md p-4 space-y-4 overflow-auto">
                <h4 className="font-bold text-center">{spec.clusterName || 'Virtual Cluster'}</h4>
                <div className="border-2 border-dashed border-gray-400 rounded-lg p-4 bg-background space-y-4">
                    <div>
                        <p className="text-sm font-semibold mb-2">Control Plane ({spec.nodeCount?.controlPlane || 0})</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {controlPlaneNodes.map((node: any, i: number) => (
                                <div key={i} className="border rounded-md p-2 bg-blue-50 dark:bg-blue-900/30">
                                    <Monitor className="mx-auto h-6 w-6 text-blue-500" />
                                    <p className="text-xs font-mono text-center mt-1">{node.vmName || 'Control Node'}</p>
                                    <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                                        <div className="flex items-center gap-1"><Cpu className="h-3 w-3" /><span>{node.cpuCores || 'N/A'} Cores</span></div>
                                        <div className="flex items-center gap-1"><MemoryStick className="h-3 w-3" /><span>{node.memory || 'N/A'} GB</span></div>
                                        <div className="flex items-center gap-1"><HardDrive className="h-3 w-3" /><span>{node.diskSize || 'N/A'} GB</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold mb-2">Worker Nodes ({spec.nodeCount?.worker || 0})</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {workerNodes.map((node: any, i: number) => (
                                <div key={i} className="border rounded-md p-2 bg-green-50 dark:bg-green-900/30">
                                    <Server className="mx-auto h-6 w-6 text-green-600" />
                                    <p className="text-xs font-mono text-center mt-1">{node.vmName || 'Worker Node'}</p>
                                    <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                                        <div className="flex items-center gap-1"><Cpu className="h-3 w-3" /><span>{node.cpuCores || 'N/A'} Cores</span></div>
                                        <div className="flex items-center gap-1"><MemoryStick className="h-3 w-3" /><span>{node.memory || 'N/A'} GB</span></div>
                                        <div className="flex items-center gap-1"><HardDrive className="h-3 w-3" /><span>{node.diskSize || 'N/A'} GB</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (isBlade) {
        const isSymmetric = spec.symmetric !== false;
        const blades = isSymmetric
            ? Array.from({ length: spec.bladeCount || 1 }).map((_, i) => ({
                name: `Blade ${i + 1}`,
                ...spec.blades?.[0],
            }))
            : spec.blades || [];

        return (
            <div className="h-full bg-muted rounded-md p-4 space-y-4 overflow-auto">
                <h4 className="font-bold text-center">{spec.name || `Blade Specification`}</h4>
                <div className="border-2 border-dashed border-gray-400 rounded-lg p-4 bg-background">
                    <p className="text-sm text-center font-semibold mb-2">{spec.vendor || 'Generic'} Chassis</p>
                    <div className={cn("grid gap-2", {
                        'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5': blades.length > 1,
                        'grid-cols-1': blades.length === 1,
                    })}>
                        {blades.map((blade: any, i: number) => (
                            <div key={i} className="border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
                                <Server className="mx-auto h-6 w-6 text-gray-500" />
                                <p className="text-xs font-mono text-center mt-1">{blade.name || `Blade ${i + 1}`}</p>
                                <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                                    <div className="flex items-center gap-1"><Cpu className="h-3 w-3" /><span>{blade.cpuType || 'N/A'} ({blade.cpuCores || 'N/A'}c)</span></div>
                                    <div className="flex items-center gap-1"><MemoryStick className="h-3 w-3" /><span>{blade.memory || 'N/A'} GB</span></div>
                                    <div className="flex items-center gap-1"><Database className="h-3 w-3" /><span>{blade.diskCapacity || 'N/A'} GB ({blade.diskType})</span></div>
                                    {blade.hasGpu && (
                                        <div className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-500" /><span>{blade.gpuType || 'GPU'} ({blade.gpuCores || 'N/A'}c)</span></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-around items-center text-center">
                        <div className="flex flex-col items-center gap-1">
                            <Database className="h-6 w-6 text-gray-600" />
                            <p className="text-xs">{spec.storage_gb || 'N/A'} GB Total</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <NetworkIcon className="h-6 w-6 text-gray-600" />
                            <p className="text-xs">{spec.network_cards?.map((n: any) => n.name).join(', ') || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default Rack or other non-blade/virtual types
    return (
        <div className="h-full bg-muted rounded-md flex items-center justify-center">
            <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 bg-background text-center">
                <h4 className="font-bold">{spec.name || 'Specification'}</h4>
                <p className="text-sm text-muted-foreground">{spec.hw_type?.name || 'Generic Hardware'}</p>
                <div className="mt-4 flex justify-center gap-4 text-xs">
                    <span><Cpu className="inline mr-1 h-4 w-4" /> {spec.total_cpu || 'N/A'} Cores</span>
                    <span><MemoryStick className="inline mr-1 h-4 w-4" /> {spec.memory_gb || 'N/A'} GB RAM</span>
                    <span><Database className="inline mr-1 h-4 w-4" /> {spec.storage_gb || 'N/A'} GB Storage</span>
                </div>
            </div>
        </div>
    );
}
