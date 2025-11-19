
'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { VirtualNode } from '@/lib/definitions';
import { Server, Monitor } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Step2Props {
    data: any;
    onUpdate: (data: any) => void;
}

export default function Step2VmConfig({ data, onUpdate }: Step2Props) {
    const [localVms, setLocalVms] = useState<VirtualNode[]>(data.virtual_machines || []);
    const [nodeCounts, setNodeCounts] = useState({
        controlPlane: data.virtual_machines?.filter((v: VirtualNode) => v.role === 'Control Plane').length || 1,
        worker: data.virtual_machines?.filter((v: VirtualNode) => v.role === 'Worker').length || 1,
    });
    
    // Pre-populate from specification if HW type is 'Virtual'
    useEffect(() => {
        if (data.specification?.hw_type?.name === 'Virtual' && !data.virtual_machines) {
            const specVms = data.specification.nodes || [];
            setLocalVms(specVms);
            onUpdate({ virtual_machines: specVms });
            setNodeCounts({
                controlPlane: specVms.filter((v: VirtualNode) => v.role === 'Control Plane').length,
                worker: specVms.filter((v: VirtualNode) => v.role === 'Worker').length
            });
        }
    }, [data.specification, data.virtual_machines, onUpdate]);

    const handleNodeCountChange = (role: 'controlPlane' | 'worker', count: number) => {
        const newCount = Math.max(0, count);
        const newCounts = { ...nodeCounts, [role]: newCount };
        setNodeCounts(newCounts);
        
        const newTotal = newCounts.controlPlane + newCounts.worker;
        
        const newVms: VirtualNode[] = Array.from({ length: newTotal }).map((_, i) => {
            if (localVms[i]) return localVms[i];
            const isControlPlane = i < newCounts.controlPlane;
            return {
                vmName: `${isControlPlane ? 'cp' : 'w'}-${i+1}`,
                role: isControlPlane ? 'Control Plane' : 'Worker',
                cpuCores: 2, memory: 4, diskSize: 20, osType: 'Ubuntu 22.04',
                networkInterface: 'eth0', connectivity: 'Private', dns: 'cluster.local', ssh: {username: 'admin', sshKey: ''}
            };
        });
        
        setLocalVms(newVms.slice(0, newTotal));
        onUpdate({ virtual_machines: newVms.slice(0, newTotal) });
    };

    const handleNodeChange = (index: number, field: string, value: any) => {
        const newVms = [...localVms];
        if (field.startsWith('ssh.')) {
            const sshField = field.split('.')[1];
            newVms[index] = { ...newVms[index], ssh: { ...newVms[index].ssh, [sshField]: value } };
        } else {
            newVms[index] = { ...newVms[index], [field]: value } as VirtualNode;
        }
        setLocalVms(newVms);
        onUpdate({ virtual_machines: newVms });
    };
    
    if (data.specification?.hw_type?.name === 'Virtual') {
        return (
             <div>
                <h3 className="font-semibold mb-2">Virtual Machines from Specification</h3>
                <p className="text-sm text-muted-foreground mb-4">These VMs are defined by the selected 'Virtual' specification and cannot be modified here.</p>
                <div className="space-y-2">
                    {(data.specification.nodes || []).map((node: VirtualNode, index: number) => (
                         <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                            {node.role === 'Control Plane' ? <Monitor className="h-5 w-5 text-blue-500" /> : <Server className="h-5 w-5 text-green-600" />}
                            <span>{node.vmName}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{node.cpuCores} cores, {node.memory}GB RAM, {node.diskSize}GB Disk</span>
                         </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
             <div>
                <Label>Define the cluster and its nodes. These VMs will be provisioned on the selected hypervisor.</Label>
             </div>
             <div className="grid grid-cols-2 gap-4">
                 <div><Label>Control Plane Nodes</Label><Input type="number" min="1" value={nodeCounts.controlPlane} onChange={(e) => handleNodeCountChange('controlPlane', parseInt(e.target.value))} /></div>
                 <div><Label>Worker Nodes</Label><Input type="number" min="0" value={nodeCounts.worker} onChange={(e) => handleNodeCountChange('worker', parseInt(e.target.value))} /></div>
             </div>
             <Accordion type="multiple" className="space-y-2">
                {localVms.map((node, index) => (
                     <AccordionItem value={`node-${index}`} key={index}>
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                                {node.role === 'Control Plane' ? <Monitor className="h-5 w-5 text-blue-500" /> : <Server className="h-5 w-5 text-green-600" />}
                                <span>{node.vmName}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 space-y-4 bg-muted/50">
                             <div><Label>VM Name</Label><Input value={node.vmName} onChange={(e) => handleNodeChange(index, 'vmName', e.target.value)} /></div>
                            <div className="grid grid-cols-3 gap-2">
                                <div><Label>CPU Cores</Label><Input type="number" value={node.cpuCores} onChange={(e) => handleNodeChange(index, 'cpuCores', Number(e.target.value))} /></div>
                                <div><Label>Memory (GB)</Label><Input type="number" value={node.memory} onChange={(e) => handleNodeChange(index, 'memory', Number(e.target.value))} /></div>
                                <div><Label>Disk (GB)</Label><Input type="number" value={node.diskSize} onChange={(e) => handleNodeChange(index, 'diskSize', Number(e.target.value))} /></div>
                            </div>
                            <div><Label>OS Type & Version</Label><Input value={node.osType} onChange={(e) => handleNodeChange(index, 'osType', e.target.value)} /></div>
                            <div><Label>Connectivity</Label>
                                <RadioGroup value={node.connectivity} onValueChange={(v) => handleNodeChange(index, 'connectivity', v)} className="flex gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Private" id={`private-${index}`} /><Label htmlFor={`private-${index}`}>Private IP</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Public" id={`public-${index}`} /><Label htmlFor={`public-${index}`}>Public IP</Label></div>
                                </RadioGroup>
                            </div>
                            <div><Label>SSH Username</Label><Input value={node.ssh.username} onChange={(e) => handleNodeChange(index, 'ssh.username', e.target.value)} /></div>
                            <div><Label>SSH Public Key</Label><Textarea value={node.ssh.sshKey} onChange={(e) => handleNodeChange(index, 'ssh.sshKey', e.target.value)} /></div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
             </Accordion>
        </div>
    );
}
