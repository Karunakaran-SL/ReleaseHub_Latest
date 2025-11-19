

'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Specification, VirtualNode } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { PlusCircle, Trash2, Loader2, Server, Monitor } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelectListBox } from '@/components/ui/multi-select-list-box';
import { DiagramDisplay } from '../../_components/diagram-display';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Option {
    _id: string;
    name: string;
}

export default function EditSpecificationPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [formState, setFormState] = useState<any>({});
    const [jsonString, setJsonString] = useState('');
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();

    const [options, setOptions] = useState({
        hwTypes: [] as Option[],
        vendors: [] as Option[],
        hypervisors: [] as Option[],
        serviceContracts: [] as Option[],
        networkCards: [] as Option[],
        plugPowerCords: [] as Option[],
        cpuTypes: [] as Option[],
        gpuTypes: [] as Option[],
        diskTypes: [] as Option[],
    });

    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;
        
        async function fetchData() {
            setLoading(true);
            try {
                const [specRes, hwTypesRes, vendorsRes, hypervisorsRes, contractsRes, networkCardsRes, plugPowerCordsRes, cpuTypesRes, gpuTypesRes, diskTypesRes] = await Promise.all([
                    fetch(`/api/specifications/${id}`),
                    fetch('/api/settings/specifications/hw-types'),
                    fetch('/api/settings/specifications/vendors'),
                    fetch('/api/settings/specifications/hypervisors'),
                    fetch('/api/documents/service-contracts'),
                    fetch('/api/settings/specifications/network-cards'),
                    fetch('/api/settings/specifications/plug-power-cords'),
                    fetch('/api/settings/specifications/cpu-types'),
                    fetch('/api/settings/specifications/gpu-types'),
                    fetch('/api/settings/specifications/disk-types'),
                ]);

                if (!specRes.ok) throw new Error('Failed to fetch specification');
                const specData = await specRes.json();
                
                setFormState(specData);

                setOptions({
                    hwTypes: await hwTypesRes.json(),
                    vendors: await vendorsRes.json(),
                    hypervisors: await hypervisorsRes.json(),
                    serviceContracts: await contractsRes.json(),
                    networkCards: await networkCardsRes.json(),
                    plugPowerCords: await plugPowerCordsRes.json(),
                    cpuTypes: await cpuTypesRes.json(),
                    gpuTypes: await gpuTypesRes.json(),
                    diskTypes: await diskTypesRes.json(),
                });

            } catch (err: any) {
                toast({ variant: 'destructive', title: 'Error', description: err.message });
                router.push('/specifications');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, router, toast]);

    // Update JSON string whenever formState changes
    useEffect(() => {
        setJsonString(JSON.stringify(formState, null, 2));
    }, [formState]);
    
    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newJsonString = e.target.value;
        setJsonString(newJsonString);
        try {
            const newFormState = JSON.parse(newJsonString);
            setFormState(newFormState);
        } catch (error) {
            // Invalid JSON, don't update the form state, maybe show an error
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        setFormState(prev => ({ ...prev, [id]: type === 'number' ? Number(value) : value }));
    };

    const handleNodeCountChange = (role: 'controlPlane' | 'worker', count: number) => {
        const newCount = Math.max(0, count);
        const newTotal = role === 'controlPlane' ? newCount + (formState.nodeCount?.worker || 0) : (formState.nodeCount?.controlPlane || 0) + newCount;
        
        const currentNodes = formState.nodes || [];
        const newNodes: VirtualNode[] = Array.from({ length: newTotal }).map((_, i) => {
            if (currentNodes[i]) return currentNodes[i];
            const isControlPlane = i < (role === 'controlPlane' ? newCount : (formState.nodeCount?.controlPlane || 0));
            return {
                vmName: `${isControlPlane ? 'cp' : 'w'}-${i+1}`,
                role: isControlPlane ? 'Control Plane' : 'Worker',
                cpuCores: 0, memory: 0, diskSize: 0, osType: 'Ubuntu 22.04',
                networkInterface: '', connectivity: 'Private', dns: '', ssh: {username: 'admin', sshKey: ''}
            }
        });

        setFormState((prev: any) => ({
            ...prev,
            nodeCount: {
                ...prev.nodeCount,
                [role]: newCount,
            },
            nodes: newNodes.slice(0, newTotal),
        }));
    };
    
    const handleNodeChange = (index: number, field: string, value: any) => {
        const newNodes = [...(formState.nodes || [])];
        if (field.startsWith('ssh.')) {
            const sshField = field.split('.')[1];
            newNodes[index] = { ...newNodes[index], ssh: { ...newNodes[index].ssh, [sshField]: value } };
        } else {
            newNodes[index] = { ...newNodes[index], [field]: value } as VirtualNode;
        }
        setFormState((prev: any) => ({...prev, nodes: newNodes}));
    };
    
    const handleSelectChange = (field: keyof Specification | string, value: string) => {
        const listMap: Record<string, Option[]> = {
            'hw_type': options.hwTypes,
            'hypervisor': options.hypervisors,
            'service_contract_type': options.serviceContracts,
            'cpuType': options.cpuTypes,
        }
        
        if (field === 'vendor') {
            setFormState((prev: any) => ({...prev, vendor: value}));
        } else if (listMap[field as string]) {
            const list = listMap[field as string];
            const selectedOption = list.find(opt => opt._id === value || opt.name === value);
            if (selectedOption) {
                setFormState((prev: any) => ({ ...prev, [field]: { id: selectedOption._id, name: selectedOption.name } }));
            }
        }
    };
    
    const handleBladeCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const count = parseInt(e.target.value, 10);
        setFormState((prev: any) => ({ ...prev, bladeCount: count, blades: Array.from({length: count}).map((_, i) => prev.blades?.[i] || {name: `Blade ${i+1}`, networkInterfaces: []}) }));
    }

    const handleAsymmetricBladeChange = (index: number, field: string, value: any) => {
        const newBlades = [...(formState.blades || [])];
        newBlades[index] = {...newBlades[index], [field]: value };
        setFormState((prev: any) => ({...prev, blades: newBlades}));
    }
    
    const handleSymmetricBladeChange = (field: string, value: any) => {
        const templateBlade = formState.blades?.[0] || { networkInterfaces: [] };
        const updatedBlade = { ...templateBlade, [field]: value };
        setFormState((prev: any) => ({ ...prev, blades: [updatedBlade] }));
    };
    
    const handleBladeNetworkInterfaceChange = (bladeIndex: number, ifaceIndex: number, field: 'name' | 'type' | 'speed', value: string) => {
        const newBlades = [...(formState.blades || [])];
        const newInterfaces = [...(newBlades[bladeIndex].networkInterfaces || [])];
        newInterfaces[ifaceIndex] = { ...newInterfaces[ifaceIndex], [field]: value };
        newBlades[bladeIndex] = { ...newBlades[bladeIndex], networkInterfaces: newInterfaces };
        setFormState((prev: any) => ({ ...prev, blades: newBlades }));
    };

    const addBladeNetworkInterface = (bladeIndex: number) => {
        const newBlades = [...(formState.blades || [])];
        const newInterfaces = [...(newBlades[bladeIndex].networkInterfaces || []), { name: '', type: '', speed: '' }];
        newBlades[bladeIndex] = { ...newBlades[bladeIndex], networkInterfaces: newInterfaces };
        setFormState((prev: any) => ({ ...prev, blades: newBlades }));
    };

    const removeBladeNetworkInterface = (bladeIndex: number, ifaceIndex: number) => {
        const newBlades = [...(formState.blades || [])];
        const newInterfaces = (newBlades[bladeIndex].networkInterfaces || []).filter((_: any, i: number) => i !== ifaceIndex);
        newBlades[bladeIndex] = { ...newBlades[bladeIndex], networkInterfaces: newInterfaces };
        setFormState((prev: any) => ({ ...prev, blades: newBlades }));
    };


    const handleMultiSelectChange = (field: 'network_cards' | 'plug_power_cords', selectedItems: { id: string; name: string }[]) => {
        setFormState(prev => ({ ...prev, [field]: selectedItems }));
    };
    
    const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
        const newFields = [...(formState.custom_fields || [])];
        newFields[index] = { ...newFields[index], [field]: value };
        setFormState(prev => ({ ...prev, custom_fields: newFields }));
    };

    const addCustomField = () => {
        const newFields = [...(formState.custom_fields || []), { key: '', value: '' }];
        setFormState(prev => ({ ...prev, custom_fields: newFields }));
    };

    const removeCustomField = (index: number) => {
        const newFields = (formState.custom_fields || []).filter((_: any, i: number) => i !== index);
        setFormState(prev => ({ ...prev, custom_fields: newFields }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.updateComment) {
            toast({ variant: 'destructive', title: 'Error', description: 'Update Reason is required.' });
            return;
        }

        let parsedJson;
        try {
            parsedJson = JSON.parse(jsonString);
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'The JSON in the editor is invalid. Please correct it before saving.' });
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch(`/api/specifications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsedJson),
            });
            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update specification');
            }
            toast({ title: 'Success', description: 'Specification updated successfully.' });
            router.push('/specifications');
            router.refresh();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const isBladeSelected = useMemo(() => {
        return formState.hw_type?.name === 'Blade';
    }, [formState.hw_type]);

    const isVirtualSelected = useMemo(() => {
        return formState.hw_type?.name === 'Virtual';
    }, [formState.hw_type]);
    
    if (loading) {
        return <DashboardLayout user={user}><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
    }
    
    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Update Specification: {formState.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Basic Information</h3>
                                    <div><Label htmlFor="name">HW Name *</Label><Input id="name" value={formState.name || ''} onChange={handleInputChange} required /></div>
                                    <div>
                                        <Label>HW Type</Label>
                                        <Select value={formState.hw_type?.id} onValueChange={(value) => handleSelectChange('hw_type', value)}>
                                            <SelectTrigger><SelectValue placeholder="Select HW Type" /></SelectTrigger>
                                            <SelectContent>{options.hwTypes.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                     <div>
                                        <Label>Vendor *</Label>
                                        <Select value={formState.vendor} onValueChange={(value) => handleSelectChange('vendor', value)} required>
                                            <SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                                            <SelectContent>{options.vendors.map(v => <SelectItem key={v._id} value={v.name}>{v.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div><Label>Image URL</Label><Input id="image" value={formState.image || ''} onChange={handleInputChange} /></div>
                                     <div>
                                        <Label>Service Contract Type</Label>
                                        <Select value={formState.service_contract_type?.id} onValueChange={(value) => handleSelectChange('service_contract_type', value)}>
                                            <SelectTrigger><SelectValue placeholder="Select Contract Type" /></SelectTrigger>
                                            <SelectContent>{options.serviceContracts.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><Label>Contact Email</Label><Input id="contact_point_email" type="email" value={formState.contact_point_email || ''} onChange={handleInputChange} /></div>
                                        <div><Label>Contact Phone</Label><Input id="contact_point_phone" type="tel" value={formState.contact_point_phone || ''} onChange={handleInputChange} /></div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mt-6">Custom Fields</h3>
                                        <div className="space-y-2">
                                            {(formState.custom_fields || []).map((field: any, index: number) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input placeholder="Key" value={field.key} onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)} />
                                                    <Input placeholder="Value" value={field.value} onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)} />
                                                    <Button variant="ghost" size="icon" onClick={() => removeCustomField(index)} type="button"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </div>
                                            ))}
                                        </div>
                                        <Button variant="link" size="sm" onClick={addCustomField} type="button" className="mt-2 px-0"><PlusCircle className="mr-2 h-4 w-4" />ADD CUSTOM FIELD</Button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                     <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Hardware Specification</h3>
                                        {isVirtualSelected && (
                                            <div className="space-y-4 p-4 border rounded-md">
                                                <h4 className="font-semibold">Cluster Basics</h4>
                                                <div className="space-y-2"><Label htmlFor="clusterName">Cluster Name</Label><Input id="clusterName" value={formState.clusterName || ''} onChange={handleInputChange}/></div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><Label>Control Plane Nodes</Label><Input type="number" min="0" value={formState.nodeCount?.controlPlane || 0} onChange={(e) => handleNodeCountChange('controlPlane', Number(e.target.value))} /></div>
                                                    <div><Label>Worker Nodes</Label><Input type="number" min="0" value={formState.nodeCount?.worker || 0} onChange={(e) => handleNodeCountChange('worker', Number(e.target.value))} /></div>
                                                </div>
                                                {(formState.nodes || []).map((node: VirtualNode, index: number) => (
                                                    <Accordion type="single" collapsible key={index}>
                                                        <AccordionItem value={`node-${index}`}>
                                                            <AccordionTrigger>
                                                                <div className="flex items-center gap-2">
                                                                    {node.role === 'Control Plane' ? <Monitor className="h-5 w-5 text-blue-500" /> : <Server className="h-5 w-5 text-green-600" />}
                                                                    <span>{node.vmName || `${node.role} ${index + 1}`}</span>
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="p-4 space-y-4">
                                                                <div><Label>VM Name</Label><Input value={node.vmName} onChange={(e) => handleNodeChange(index, 'vmName', e.target.value)} /></div>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <div><Label>CPU Cores</Label><Input type="number" value={node.cpuCores} onChange={(e) => handleNodeChange(index, 'cpuCores', Number(e.target.value))} /></div>
                                                                    <div><Label>Memory (GB)</Label><Input type="number" value={node.memory} onChange={(e) => handleNodeChange(index, 'memory', Number(e.target.value))} /></div>
                                                                    <div><Label>Disk (GB)</Label><Input type="number" value={node.diskSize} onChange={(e) => handleNodeChange(index, 'diskSize', Number(e.target.value))} /></div>
                                                                </div>
                                                                <div><Label>OS Type & Version</Label><Input value={node.osType} onChange={(e) => handleNodeChange(index, 'osType', e.target.value)} /></div>
                                                                <div><Label>Network Interface</Label>
                                                                    <Select value={node.networkInterface} onValueChange={(v) => handleNodeChange(index, 'networkInterface', v)}>
                                                                        <SelectTrigger><SelectValue placeholder="Select network type..." /></SelectTrigger>
                                                                        <SelectContent>{options.networkCards.map(nc => <SelectItem key={nc._id} value={nc.name}>{nc.name}</SelectItem>)}</SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div><Label>Connectivity</Label>
                                                                    <RadioGroup value={node.connectivity} onValueChange={(v) => handleNodeChange(index, 'connectivity', v)} className="flex gap-4">
                                                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Private" id={`private-${index}`} /><Label htmlFor={`private-${index}`}>Private IP</Label></div>
                                                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Public" id={`public-${index}`} /><Label htmlFor={`public-${index}`}>Public IP</Label></div>
                                                                    </RadioGroup>
                                                                </div>
                                                                <div><Label>DNS Settings</Label><Input value={node.dns} onChange={(e) => handleNodeChange(index, 'dns', e.target.value)} /></div>
                                                                <div><Label>SSH Username</Label><Input value={node.ssh.username} onChange={(e) => handleNodeChange(index, 'ssh.username', e.target.value)} /></div>
                                                                <div><Label>SSH Public Key</Label><Textarea value={node.ssh.sshKey} onChange={(e) => handleNodeChange(index, 'ssh.sshKey', e.target.value)} /></div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                ))}
                                            </div>
                                        )}
                                        {isBladeSelected ? (
                                             <></>
                                        ): (
                                            !isVirtualSelected && (
                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md">
                                                <div><Label htmlFor="total_cpu">Total CPU *</Label><Input id="total_cpu" type="number" value={formState.total_cpu || ''} onChange={handleInputChange} required /></div>
                                                <div><Label htmlFor="memory_gb">Memory (GB) *</Label><Input id="memory_gb" type="number" value={formState.memory_gb || ''} onChange={handleInputChange} required /></div>
                                                <div><Label htmlFor="storage_gb">Total Storage (GB) *</Label><Input id="storage_gb" type="number" value={formState.storage_gb || ''} onChange={handleInputChange} required /></div>
                                             </div>
                                            )
                                        )}
                                    </div>
                                    {!isVirtualSelected && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg pt-4 border-t">Firmware &amp; OS</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><Label htmlFor="biosVersion">BIOS Version</Label><Input id="biosVersion" value={formState.biosVersion || ''} onChange={handleInputChange} /></div>
                                            <div><Label htmlFor="firmwareVersion">Firmware Version</Label><Input id="firmwareVersion" value={formState.firmwareVersion || ''} onChange={handleInputChange} /></div>
                                            <div><Label htmlFor="cpuArchitecture">CPU Architecture</Label><Input id="cpuArchitecture" value={formState.cpuArchitecture || ''} onChange={handleInputChange} /></div>
                                            <div className="flex items-center space-x-2 pt-6">
                                                <Checkbox id="virtualizationSupport" checked={formState.virtualizationSupport} onCheckedChange={(checked) => setFormState(p => ({...p, virtualizationSupport: !!checked}))} />
                                                <Label htmlFor="virtualizationSupport">Virtualization Support</Label>
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-lg pt-4 border-t">Remote Management</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><Label htmlFor="username">iLO Username</Label><Input data-group="iloCredentials" id="username" value={formState.iloCredentials?.username || ''} onChange={handleInputChange} /></div>
                                            <div><Label htmlFor="password">iLO Password</Label><Input data-group="iloCredentials" id="password" type="password" value={formState.iloCredentials?.password || ''} onChange={handleInputChange} /></div>
                                        </div>

                                        <h3 className="font-semibold text-lg pt-4 border-t">Network &amp; Storage</h3>
                                        <div><Label>Time Sync (NTP Server)</Label><Input id="timeSync" value={formState.timeSync || ''} onChange={handleInputChange} /></div>
                                        <div>
                                            <Label>Disk Layout</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input data-group="diskLayout" id="osDisk" placeholder="OS Disk (e.g., 200GB SSD)" value={formState.diskLayout?.osDisk || ''} onChange={handleInputChange} />
                                                <Input data-group="diskLayout" id="dataDisk" placeholder="Data Disk (e.g., 1TB NVMe)" value={formState.diskLayout?.dataDisk || ''} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div><Label>RAID Configuration</Label><Input id="raidConfiguration" value={formState.raidConfiguration || ''} onChange={handleInputChange} placeholder="e.g., RAID 10"/></div>
                                        <div>
                                            <Label>SSH Keys</Label>
                                            <Textarea id="sshKeys" value={formState.sshKeys || ''} onChange={handleInputChange} placeholder="Paste public SSH keys for access..."/>
                                        </div>
                                        <div>
                                            <Label>Hypervisor</Label>
                                            <Select value={formState.hypervisor?.id} onValueChange={(value) => handleSelectChange('hypervisor', value)}>
                                                <SelectTrigger><SelectValue placeholder="N/A" /></SelectTrigger>
                                                <SelectContent>{options.hypervisors.map(h => <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    )}
                                </div>
                            </div>
                             <div className="space-y-4 md:col-span-2">
                                <h3 className="font-semibold text-lg">Visualization & JSON</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="h-[30rem]"><DiagramDisplay specJson={jsonString} /></div>
                                    <div>
                                        <Label htmlFor="json-output">Specification JSON</Label>
                                        <Textarea id="json-output" value={jsonString} onChange={handleJsonChange} rows={24} className="font-mono text-xs"/>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 mt-8 md:col-span-2">
                                <Label htmlFor="updateComment">Update Reason *</Label>
                                <Textarea id="updateComment" placeholder="Please provide a reason for this update." value={formState.updateComment || ''} onChange={handleInputChange} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()}>CANCEL</Button>
                            <Button type="submit" disabled={loading || !formState.updateComment}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} UPDATE
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </DashboardLayout>
    );
}
