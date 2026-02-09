
'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { HardDrive, Server, Monitor, Layers, Box, GitBranch, Cpu, MemoryStick, Database, Zap, User, Tag, Lock, ShieldCheck } from 'lucide-react';

function Layer({ icon, title, subtitle, color, children }: { icon: React.ReactNode, title: string, subtitle?: string, color: string, children?: React.ReactNode }) {
    return (
        <div className={`p-4 border-2 border-dashed rounded-lg bg-background`} style={{ borderColor: color }}>
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-md" style={{ backgroundColor: `${color}20` }}>
                    {icon}
                </div>
                <div>
                    <p className="font-semibold">{title}</p>
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
            </div>
            {children && <div className="mt-2 pl-4">{children}</div>}
        </div>
    );
}

function VmNode({ node }: { node: any }) {
    return (
        <div className="flex items-start gap-2 p-2 border rounded-md bg-white dark:bg-gray-900/50">
            {node.role === 'Control Plane' ? <Monitor className="h-5 w-5 text-blue-500 mt-1" /> : <Server className="h-5 w-5 text-green-600 mt-1" />}
            <div className="flex-1">
                <p className="font-semibold text-sm">{node.vmName}</p>
                <p className="text-xs text-muted-foreground">
                    {node.cpuCores} cores, {node.memory}GB RAM, {node.diskSize}GB Disk
                </p>
            </div>
        </div>
    );
}



export function VisualBuilder({ foundation, autoHeight = false }: { foundation: any, autoHeight?: boolean }) {
    const jsonString = JSON.stringify(foundation, null, 2);

    return (
        <Card className={`flex flex-col ${autoHeight ? 'h-auto' : 'h-full'}`}>
            <CardHeader>
                <CardTitle>Platform Visualizer & JSON</CardTitle>
            </CardHeader>
            <CardContent className={`flex-1 min-h-0 ${autoHeight ? '' : 'overflow-hidden'}`}>
                <Tabs defaultValue="visual" className={`flex flex-col ${autoHeight ? 'h-auto' : 'h-full'}`}>
                    <TabsList>
                        <TabsTrigger value="visual">Visual</TabsTrigger>
                        <TabsTrigger value="json">JSON</TabsTrigger>
                    </TabsList>
                    <TabsContent value="visual" className={`flex-1 mt-4 ${autoHeight ? 'h-auto' : 'h-full'}`}>
                        <div className={`p-4 bg-muted rounded-lg space-y-2 ${autoHeight ? '' : 'h-full overflow-auto'}`}>
                            {!foundation.specification && (
                                <div className={`text-center text-muted-foreground p-8 flex flex-col justify-center items-center ${autoHeight ? 'py-12' : 'h-full'}`}>
                                    <Box className="mx-auto h-12 w-12" />
                                    <p>No specification defined.</p>
                                </div>
                            )}

                            {foundation.product && (
                                <Layer icon={<Box className="text-indigo-500" />} title="Product Details" subtitle={`${foundation.product.name} (v${foundation.product.version})`} color="#6366f1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                                        <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> <span>Owner: {foundation.product.owner}</span></div>
                                        <div className="flex items-center gap-2 text-muted-foreground"><Tag className="h-4 w-4" /> <span>Deployment: {foundation.product.deployment_type?.name}</span></div>
                                        <div className="flex items-center gap-2 text-muted-foreground"><Lock className="h-4 w-4" /> <span>Approval: {foundation.product.approval_needed ? 'Required' : 'Not Required'}</span></div>
                                        <div className="flex items-center gap-2 text-muted-foreground"><GitBranch className="h-4 w-4" /> <span>Pipeline: {foundation.product.pipeline || 'Standard'}</span></div>
                                    </div>
                                    {foundation.product.compliance_checks?.length > 0 && (
                                        <div className="mt-2 flex gap-1 flex-wrap">
                                            {foundation.product.compliance_checks.map((check: any, i: number) => (
                                                <span key={i} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                                                    <ShieldCheck className="h-3 w-3" /> {check.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </Layer>
                            )}

                            {foundation.name && (
                                <Layer icon={<Box className="text-orange-500" />} title="Platform Foundation" subtitle={`${foundation.name} (v${foundation.version || 'N/A'})`} color="#f97316">
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {foundation.description && <p className="mb-2 italic">{foundation.description}</p>}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <div className="flex items-center gap-2"><Tag className="h-3 w-3" /> Type: {foundation.type || 'Standard'}</div>
                                            <div className="flex items-center gap-2"><User className="h-3 w-3" /> Owner: {foundation.createdBy || 'System'}</div>
                                        </div>
                                    </div>
                                </Layer>
                            )}

                            {foundation.specification && (
                                <Layer icon={<HardDrive className="text-gray-500" />} title="Hardware Specification" subtitle={`${foundation.specification.name} (${foundation.specification.vendor})`} color="#6b7280">
                                    {/* Physical Hardware Details - Enhanced Grid View */}
                                    <div className="mb-4 space-y-4">
                                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground bg-muted/50 p-2 rounded justify-between">
                                            <div className="flex gap-4">
                                                {foundation.specification.biosVersion && <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> BIOS: {foundation.specification.biosVersion}</span>}
                                                {foundation.specification.firmwareVersion && <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> FW: {foundation.specification.firmwareVersion}</span>}
                                            </div>
                                            {foundation.specification.symmetric && (
                                                <div className="flex gap-4">
                                                    <span className="font-semibold flex items-center gap-1"><Cpu className="h-3 w-3" /> {foundation.specification.total_cpu} Cores</span>
                                                    <span className="font-semibold flex items-center gap-1"><MemoryStick className="h-3 w-3" /> {foundation.specification.memory_gb} GB</span>
                                                    <span className="font-semibold flex items-center gap-1"><Database className="h-3 w-3" /> {foundation.specification.storage_gb} GB</span>
                                                </div>
                                            )}
                                        </div>

                                        {foundation.specification.blades && foundation.specification.blades.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-sm font-medium mb-2">Compute Nodes / Blades ({foundation.specification.bladeCount || foundation.specification.blades.length})</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                    {foundation.specification.blades.map((blade: any, i: number) => (
                                                        <div key={i} className="border rounded-md p-2 bg-gray-50 dark:bg-gray-800 flex flex-col gap-1">
                                                            <div className="flex justify-between items-center">
                                                                <Server className="h-5 w-5 text-gray-500" />
                                                                <span className="text-xs font-mono font-semibold">{blade.name}</span>
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground mt-1 space-y-1">
                                                                <div className="flex items-center gap-1 bg-white dark:bg-black/20 p-1 rounded"><Cpu className="h-3 w-3 text-blue-500" /><span>{blade.cpuType} ({blade.cpuCores}c)</span></div>
                                                                <div className="flex items-center gap-1 bg-white dark:bg-black/20 p-1 rounded"><MemoryStick className="h-3 w-3 text-green-500" /><span>{blade.memory}GB RAM</span></div>
                                                                <div className="flex items-center gap-1 bg-white dark:bg-black/20 p-1 rounded"><Database className="h-3 w-3 text-purple-500" /><span>{blade.diskCapacity}GB {blade.diskType}</span></div>
                                                            </div>
                                                            {blade.hasGpu && (
                                                                <div className="mt-1 text-[10px] flex items-center gap-1 bg-orange-50 text-orange-700 p-1 rounded border border-orange-100">
                                                                    <Zap className="h-3 w-3" /> {blade.gpuType} ({blade.gpuCores}c)
                                                                </div>
                                                            )}
                                                            {blade.networkInterfaces && (
                                                                <div className="mt-1 flex gap-1 flex-wrap">
                                                                    {blade.networkInterfaces.map((ni: any, k: number) => (
                                                                        <span key={k} className="text-[9px] border px-1 rounded bg-muted whitespace-nowrap">{ni.name}: {ni.speed}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {foundation.hypervisor && (
                                        <Layer icon={<Layers className="text-purple-500" />} title="Hypervisor" subtitle={foundation.hypervisor.name} color="#8b5cf6">
                                            {foundation.virtual_machines && (
                                                <Layer icon={<Server className="text-green-500" />} title="Virtual Machines" subtitle={`${foundation.virtual_machines.length} Nodes`} color="#22c55e">
                                                    {foundation.kubernetes && (
                                                        <Layer icon={<GitBranch className="text-blue-500" />} title="Kubernetes" subtitle={`${foundation.kubernetes.distribution} (${foundation.kubernetes.cniPlugin})`} color="#3b82f6">
                                                            <div className="space-y-2">
                                                                {foundation.kubernetes.controlPlaneNodes?.length > 0 && (
                                                                    <>
                                                                        <p className="text-sm font-medium">Control Plane:</p>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                            {foundation.kubernetes.controlPlaneNodes.map((n: any, i: number) => {
                                                                                const vm = foundation.virtual_machines?.find((v: any) => v.vmName === n.id);
                                                                                return vm ? <VmNode key={`cp-${i}`} node={{ ...vm, role: 'Control Plane' }} /> : null;
                                                                            })}
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {foundation.kubernetes.workerNodes?.length > 0 && (
                                                                    <>
                                                                        <p className="text-sm font-medium mt-2">Workers:</p>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                            {foundation.kubernetes.workerNodes.map((n: any, i: number) => {
                                                                                const vm = foundation.virtual_machines?.find((v: any) => v.vmName === n.id);
                                                                                return vm ? <VmNode key={`w-${i}`} node={{ ...vm, role: 'Worker' }} /> : null;
                                                                            })}
                                                                        </div>
                                                                    </>
                                                                )}

                                                                {foundation.kubernetes.platformComponents && (
                                                                    <div className="mt-4 border-t border-dashed border-blue-300 pt-4">
                                                                        <div className="flex items-center gap-2 mb-2 justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                <Box className="h-4 w-4 text-blue-600" />
                                                                                <span className="font-semibold text-sm">Tenant: Platform Foundation</span>
                                                                            </div>
                                                                            {foundation.kubernetes.platformVersion && (
                                                                                <span className="text-xs text-muted-foreground bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">{foundation.kubernetes.platformVersion}</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                                            {foundation.kubernetes.platformComponents.map((comp: any, i: number) => (
                                                                                <div key={i} className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-2 rounded text-xs border border-blue-200 dark:border-blue-800 flex flex-col gap-1">
                                                                                    <div className="font-semibold truncate" title={comp.name || comp}>{comp.name || comp}</div>
                                                                                    {typeof comp === 'object' && (
                                                                                        <>
                                                                                            <div className="text-[10px] opacity-80">ver: {comp.version}</div>
                                                                                            <div className="text-[10px] opacity-70 flex gap-1 flex-wrap">
                                                                                                <span>CPU: {comp.cpu}</span>
                                                                                                <span>RAM: {comp.memory}</span>
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Layer>
                                                    )}
                                                </Layer>
                                            )}
                                        </Layer>
                                    )}

                                    {foundation.specification?.hw_type?.name === 'Virtual' && foundation.virtual_machines && (
                                        <Layer icon={<Server className="text-green-500" />} title="Virtual Machines" subtitle={`${foundation.virtual_machines.length} Nodes`} color="#22c55e">
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">Control Plane:</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {foundation.virtual_machines.filter((n: any) => n.role === 'Control Plane').map((node: any, i: number) => <VmNode key={i} node={node} />)}
                                                </div>
                                                <p className="text-sm font-medium mt-2">Workers:</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {foundation.virtual_machines.filter((n: any) => n.role === 'Worker').map((node: any, i: number) => <VmNode key={i} node={node} />)}
                                                </div>
                                            </div>
                                            {foundation.kubernetes && (
                                                <Layer icon={<GitBranch className="text-blue-500" />} title="Kubernetes" subtitle={`${foundation.kubernetes.distribution} (${foundation.kubernetes.cniPlugin})`} color="#3b82f6">
                                                    <div className="space-y-2">
                                                        {foundation.kubernetes.controlPlaneNodes?.length > 0 && (
                                                            <>
                                                                <p className="text-sm font-medium">Control Plane:</p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {foundation.kubernetes.controlPlaneNodes.map((n: any, i: number) => {
                                                                        const vm = foundation.virtual_machines?.find((v: any) => v.vmName === n.id);
                                                                        return vm ? <VmNode key={`cp-${i}`} node={{ ...vm, role: 'Control Plane' }} /> : null;
                                                                    })}
                                                                </div>
                                                            </>
                                                        )}
                                                        {foundation.kubernetes.workerNodes?.length > 0 && (
                                                            <>
                                                                <p className="text-sm font-medium mt-2">Workers:</p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {foundation.kubernetes.workerNodes.map((n: any, i: number) => {
                                                                        const vm = foundation.virtual_machines?.find((v: any) => v.vmName === n.id);
                                                                        return vm ? <VmNode key={`w-${i}`} node={{ ...vm, role: 'Worker' }} /> : null;
                                                                    })}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    {foundation.kubernetes.platformComponents && (
                                                        <div className="mt-4 border-t border-dashed border-blue-300 pt-4">
                                                            <div className="flex items-center gap-2 mb-2 justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Box className="h-4 w-4 text-blue-600" />
                                                                    <span className="font-semibold text-sm">Tenant: Platform Foundation</span>
                                                                </div>
                                                                {foundation.kubernetes.platformVersion && (
                                                                    <span className="text-xs text-muted-foreground bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">{foundation.kubernetes.platformVersion}</span>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                                {foundation.kubernetes.platformComponents.map((comp: any, i: number) => (
                                                                    <div key={i} className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-2 rounded text-xs border border-blue-200 dark:border-blue-800 flex flex-col gap-1">
                                                                        <div className="font-semibold truncate" title={comp.name || comp}>{comp.name || comp}</div>
                                                                        {typeof comp === 'object' && (
                                                                            <>
                                                                                <div className="text-[10px] opacity-80">ver: {comp.version}</div>
                                                                                <div className="text-[10px] opacity-70 flex gap-1 flex-wrap">
                                                                                    <span>CPU: {comp.cpu}</span>
                                                                                    <span>RAM: {comp.memory}</span>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Layer>
                                            )}
                                        </Layer>
                                    )}
                                </Layer>
                            )}

                            {/* Baseline/Tenant-based Visualization */}
                            {foundation.type === 'baseline' && foundation.tenants && foundation.tenants.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <h3 className="font-semibold text-sm flex items-center gap-2">
                                        <Box className="h-4 w-4" /> Tenants ({foundation.tenants.length})
                                    </h3>
                                    {foundation.tenants.map((tenant: any, idx: number) => (
                                        <Layer
                                            key={idx}
                                            icon={<Server className="text-purple-500" />}
                                            title={tenant.name || `Tenant ${idx + 1}`}
                                            subtitle={tenant.description || undefined}
                                            color="#a855f7"
                                        >
                                            {/* Components as Boxes */}
                                            {tenant.components && tenant.components.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-xs font-semibold mb-3 flex items-center gap-2">
                                                        <Box className="h-3 w-3" />
                                                        Components ({tenant.components.length})
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {tenant.components.map((comp: any, i: number) => (
                                                            <div
                                                                key={i}
                                                                className="p-3 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900/50 border-2 border-purple-200 dark:border-purple-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                                            >
                                                                <div className="flex items-start gap-2">
                                                                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded">
                                                                        <Box className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-semibold text-sm truncate">{comp.name}</p>
                                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                                            Version: <span className="font-mono bg-purple-100 dark:bg-purple-900/30 px-1 py-0.5 rounded">v{comp.version}</span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Applications as Boxes */}
                                            {tenant.applications && tenant.applications.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-xs font-semibold mb-3 flex items-center gap-2">
                                                        <Monitor className="h-3 w-3" />
                                                        Applications ({tenant.applications.length})
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {tenant.applications.map((app: any, i: number) => (
                                                            <div
                                                                key={i}
                                                                className="p-3 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900/50 border-2 border-blue-200 dark:border-blue-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                                            >
                                                                <div className="flex items-start gap-2">
                                                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded">
                                                                        <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-semibold text-sm truncate">{app.name}</p>
                                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                                            Version: <span className="font-mono bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded">v{app.version}</span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Interfaces */}
                                            {tenant.interfaces && tenant.interfaces.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold mb-3 flex items-center gap-2">
                                                        <GitBranch className="h-3 w-3" />
                                                        Interfaces ({tenant.interfaces.length})
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {tenant.interfaces.map((intf: any, i: number) => (
                                                            <div
                                                                key={i}
                                                                className="p-3 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-gray-900/50 border-2 border-green-200 dark:border-green-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                                            >
                                                                <div className="flex items-start gap-2">
                                                                    <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded">
                                                                        <GitBranch className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-semibold text-sm truncate">{intf.name}</p>
                                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                                            Version: <span className="font-mono bg-green-100 dark:bg-green-900/30 px-1 py-0.5 rounded">{intf.version}</span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </Layer>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="json" className="flex-1 mt-4">
                        <Textarea readOnly value={jsonString} className="h-full font-mono text-xs" />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
