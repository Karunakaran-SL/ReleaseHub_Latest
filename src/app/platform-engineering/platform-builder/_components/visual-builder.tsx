
'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { HardDrive, Server, Monitor, Layers, Box, GitBranch } from 'lucide-react';

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


export function VisualBuilder({ foundation }: { foundation: any }) {
    const jsonString = JSON.stringify(foundation, null, 2);

    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>Platform Visualizer & JSON</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <Tabs defaultValue="visual" className="flex flex-col h-full">
                    <TabsList>
                        <TabsTrigger value="visual">Visual</TabsTrigger>
                        <TabsTrigger value="json">JSON</TabsTrigger>
                    </TabsList>
                    <TabsContent value="visual" className="flex-1 mt-4">
                        <div className="p-4 bg-muted rounded-lg space-y-2 h-full overflow-auto">
                            {!foundation.specification && (
                                <div className="text-center text-muted-foreground p-8 h-full flex flex-col justify-center items-center">
                                    <Box className="mx-auto h-12 w-12" />
                                    <p>No specification defined.</p>
                                </div>
                            )}

                            {foundation.specification && (
                                <Layer icon={<HardDrive className="text-gray-500" />} title="Hardware Specification" subtitle={`${foundation.specification.name} (${foundation.specification.vendor})`} color="#6b7280">
                                    {foundation.hypervisor && (
                                        <Layer icon={<Layers className="text-purple-500" />} title="Hypervisor" subtitle={foundation.hypervisor.name} color="#8b5cf6">
                                            {foundation.virtual_machines && (
                                                <Layer icon={<Server className="text-green-500" />} title="Virtual Machines" subtitle={`${foundation.virtual_machines.length} Nodes`} color="#22c55e">
                                                    {foundation.kubernetes && (
                                                        <Layer icon={<GitBranch className="text-blue-500" />} title="Kubernetes" subtitle={`${foundation.kubernetes.distribution} (${foundation.kubernetes.cniPlugin})`} color="#3b82f6" />
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
                                                    {foundation.virtual_machines.filter((n:any) => n.role === 'Control Plane').map((node: any, i: number) => <VmNode key={i} node={node} />)}
                                                </div>
                                                <p className="text-sm font-medium mt-2">Workers:</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {foundation.virtual_machines.filter((n:any) => n.role === 'Worker').map((node: any, i: number) => <VmNode key={i} node={node} />)}
                                                </div>
                                            </div>
                                            {foundation.kubernetes && (
                                                <Layer icon={<GitBranch className="text-blue-500" />} title="Kubernetes" subtitle={`${foundation.kubernetes.distribution} (${foundation.kubernetes.cniPlugin})`} color="#3b82f6" />
                                            )}
                                        </Layer>
                                    )}
                                </Layer>
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
