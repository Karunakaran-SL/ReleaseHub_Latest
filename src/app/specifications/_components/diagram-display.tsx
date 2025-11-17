
'use client';

import { cn } from "@/lib/utils";
import { Cpu, MemoryStick, Database, NetworkIcon, Server } from "lucide-react";

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

    if (isBlade) {
        const isSymmetric = spec.symmetric !== false; 
        const blades = isSymmetric 
            ? Array.from({ length: spec.bladeCount || 1 }).map((_, i) => ({
                name: `Blade ${i + 1}`,
                cpuType: spec.cpuType,
                memoryPerBlade: spec.memoryPerBlade,
                storageCapacity: spec.storage_gb, // Using total storage for symmetric view
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
                                <Server className="mx-auto h-6 w-6 text-gray-500"/>
                                <p className="text-xs font-mono text-center mt-1">{blade.name || `Blade ${i + 1}`}</p>
                                <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                                    <div className="flex items-center gap-1"><Cpu className="h-3 w-3"/><span>{blade.cpuType || 'N/A'}</span></div>
                                    <div className="flex items-center gap-1"><MemoryStick className="h-3 w-3"/><span>{blade.memoryPerBlade || 'N/A'} GB</span></div>
                                    <div className="flex items-center gap-1"><Database className="h-3 w-3"/><span>{blade.storageCapacity || 'N/A'} GB</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-around items-center text-center">
                         <div className="flex flex-col items-center gap-1">
                            <Database className="h-6 w-6 text-gray-600"/>
                            <p className="text-xs">{spec.storage_gb || 'N/A'} GB Total</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <NetworkIcon className="h-6 w-6 text-gray-600"/>
                             <p className="text-xs">{spec.network_cards?.map((n: any) => n.name).join(', ') || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-muted rounded-md flex items-center justify-center">
             <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 bg-background text-center">
                 <h4 className="font-bold">{spec.name || 'Specification'}</h4>
                 <p className="text-sm text-muted-foreground">{spec.hw_type?.name || 'Generic Hardware'}</p>
                 <div className="mt-4 flex justify-center gap-4 text-xs">
                    <span><Cpu className="inline mr-1 h-4 w-4"/> {spec.total_cpu || 'N/A'} Cores</span>
                    <span><MemoryStick className="inline mr-1 h-4 w-4"/> {spec.memory_gb || 'N/A'} GB RAM</span>
                    <span><Database className="inline mr-1 h-4 w-4"/> {spec.storage_gb || 'N/A'} GB Storage</span>
                 </div>
            </div>
        </div>
    );
}
