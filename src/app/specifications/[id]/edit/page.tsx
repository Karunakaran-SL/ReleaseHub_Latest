

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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HelpCircle } from 'lucide-react';

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
    const [isSyncingRancher, setIsSyncingRancher] = useState(false);
    const [showSyncForm, setShowSyncForm] = useState(false);

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
        setFormState((prev: any) => ({ ...prev, [id]: type === 'number' ? Number(value) : value }));
    };

    const handleNodeCountChange = (role: 'controlPlane' | 'worker', count: number) => {
        const newCount = Math.max(0, count);
        setFormState((prev: any) => {
            const currentNodes = prev.nodes || [];
            const controlPlaneCount = role === 'controlPlane' ? newCount : (prev.nodeCount?.controlPlane || 0);
            const workerCount = role === 'worker' ? newCount : (prev.nodeCount?.worker || 0);
            const newTotal = controlPlaneCount + workerCount;

            const newNodes: VirtualNode[] = Array.from({ length: newTotal }).map((_, i) => {
                if (currentNodes[i]) return currentNodes[i];
                const isControlPlane = i < controlPlaneCount;
                return {
                    vmName: `${isControlPlane ? 'cp' : 'w'}-${i + 1}`,
                    role: isControlPlane ? 'Control Plane' : 'Worker',
                    cpuCores: 0, memory: 0, diskSize: 0, osType: 'Ubuntu 22.04',
                    networkInterface: '', connectivity: 'Private', dns: '', ssh: { username: 'admin', sshKey: '' }
                }
            });

            return {
                ...prev,
                nodeCount: {
                    ...prev.nodeCount,
                    [role]: newCount,
                },
                nodes: newNodes.slice(0, newTotal),
            };
        });
    };

    const handleNodeChange = (index: number, field: string, value: any) => {
        const newNodes = [...(formState.nodes || [])];
        if (field.startsWith('ssh.')) {
            const sshField = field.split('.')[1];
            newNodes[index] = { ...newNodes[index], ssh: { ...newNodes[index].ssh, [sshField]: value } };
        } else {
            newNodes[index] = { ...newNodes[index], [field]: value } as VirtualNode;
        }
        setFormState((prev: any) => ({ ...prev, nodes: newNodes }));
    };

    const handleSelectChange = (field: keyof Specification | string, value: string) => {
        const listMap: Record<string, Option[]> = {
            'hw_type': options.hwTypes,
            'hypervisor': options.hypervisors,
            'service_contract_type': options.serviceContracts,
            'cpuType': options.cpuTypes,
        }

        if (field === 'vendor') {
            setFormState((prev: any) => ({ ...prev, vendor: value }));
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
        setFormState((prev: any) => ({ ...prev, bladeCount: count, blades: Array.from({ length: count }).map((_, i) => prev.blades?.[i] || { name: `Blade ${i + 1}`, networkInterfaces: [] }) }));
    }

    const handleAsymmetricBladeChange = (index: number, field: string, value: any) => {
        const newBlades = [...(formState.blades || [])];
        newBlades[index] = { ...newBlades[index], [field]: value };
        setFormState((prev: any) => ({ ...prev, blades: newBlades }));
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
        setFormState((prev: any) => ({ ...prev, [field]: selectedItems }));
    };

    const handleRadioChange = (id: string, value: string) => {
        if (id === 'clusterType') {
            setFormState((prev: any) => {
                const updated = { ...prev, [id]: value };
                if (value === 'Managed Kubernetes' && !updated.managedConfig) {
                    updated.managedConfig = {
                        cpuCores: 4,
                        memoryGb: 8,
                        diskSizeGb: 100,
                        containerEngine: 'containerd',
                        kubernetesVersion: 'v1.28.4+k3s2',
                        namespaces: [],
                        workloads: []
                    };
                }
                return updated;
            });
        } else {
            setFormState((prev: any) => ({ ...prev, [id]: value === 'true' }));
        }
    };

    const handleSyncRancher = async () => {
        setIsSyncingRancher(true);
        try {
            const res = await fetch('/api/specifications/rancher-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiUrl: formState.managedConfig?.apiUrl,
                    token: formState.managedConfig?.token
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to fetch cluster settings.");
            }
            const data = await res.json();

            setFormState((prev: any) => ({
                ...prev,
                managedConfig: {
                    ...prev.managedConfig,
                    cpuCores: data.cpuCores,
                    memoryGb: data.memoryGb,
                    diskSizeGb: data.diskSizeGb,
                    containerEngine: data.containerEngine,
                    kubernetesVersion: data.kubernetesVersion,
                    namespaces: data.namespaces || [],
                    workloads: data.workloads || []
                }
            }));
            toast({ title: 'Success', description: 'Cluster configurations applied successfully.' });
            setShowSyncForm(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Sync Failed', description: error.message });
        } finally {
            setIsSyncingRancher(false);
        }
    };

    const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
        const newFields = [...(formState.custom_fields || [])];
        newFields[index] = { ...newFields[index], [field]: value };
        setFormState((prev: any) => ({ ...prev, custom_fields: newFields }));
    };

    const addCustomField = () => {
        setFormState((prev: any) => ({ ...prev, custom_fields: [...(prev.custom_fields || []), { key: '', value: '' }] }));
    };

    const removeCustomField = (index: number) => {
        const newFields = (formState.custom_fields || []).filter((_: any, i: number) => i !== index);
        setFormState((prev: any) => ({ ...prev, custom_fields: newFields }));
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
        return options.hwTypes.find(o => o._id === formState.hw_type?.id)?.name === 'Virtual';
    }, [formState.hw_type, options.hwTypes]);

    const isManagedK8s = useMemo(() => {
        return isVirtualSelected && formState.clusterType === 'Managed Kubernetes';
    }, [isVirtualSelected, formState.clusterType]);

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
                                                <div className="flex items-center space-x-2 mb-4 pb-4 border-b">
                                                    <RadioGroup value={formState.clusterType || 'Standard'} onValueChange={(v) => handleRadioChange('clusterType', v)} className="flex gap-4">
                                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Standard" id="cluster-standard" /><Label htmlFor="cluster-standard">Standard Cluster</Label></div>
                                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Managed Kubernetes" id="cluster-managed" /><Label htmlFor="cluster-managed">Managed Kubernetes</Label></div>
                                                    </RadioGroup>
                                                </div>

                                                <div className="flex flex-col space-y-2 mt-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold">{isManagedK8s ? 'Managed Kubernetes Configurations' : 'Cluster Basics'}</h4>
                                                        {isManagedK8s && (
                                                            <Button variant="secondary" size="sm" type="button" onClick={() => setShowSyncForm(!showSyncForm)}>
                                                                {showSyncForm ? 'Cancel Sync' : 'Auto-fill from Cluster'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                    {isManagedK8s && showSyncForm && (
                                                        <div className="p-4 border rounded-md bg-muted/20 space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm text-muted-foreground">Connect to your Kubernetes API (e.g. K3s, Rancher, or EKS) to automatically summarize the cluster configurations.</p>
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon" title="How to connect?"><HelpCircle className="h-5 w-5 text-muted-foreground" /></Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="max-w-2xl">
                                                                        <DialogHeader>
                                                                            <DialogTitle>How to connect to Managed Kubernetes / K3s</DialogTitle>
                                                                            <DialogDescription>Run the following kubectl commands in your local terminal to securely fetch your cluster credentials.</DialogDescription>
                                                                        </DialogHeader>
                                                                        <div className="space-y-4 pt-4">
                                                                            <div className="space-y-2">
                                                                                <h4 className="font-semibold text-sm">1. Get the Cluster API URL</h4>
                                                                                <div className="text-xs text-muted-foreground space-y-2">
                                                                                    <p>Open your terminal and run:</p>
                                                                                    <pre className="bg-muted p-2 rounded-md overflow-x-auto"><code>kubectl config view --minify -o jsonpath='{"{.clusters[0].cluster.server}"}'</code></pre>
                                                                                    <p className="text-xs text-muted-foreground">Copy the output (e.g., https://127.0.0.1:6443) and paste it into the Cluster API URL field.</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <h4 className="font-semibold text-sm">2. Generate the API Bearer Token</h4>
                                                                                <div className="space-y-2 text-xs text-muted-foreground">
                                                                                    <p>Run these three commands to generate a ServiceAccount token:</p>
                                                                                    <p className="font-semibold mt-2">A. Create a Service Account:</p>
                                                                                    <pre className="bg-muted p-2 rounded-md overflow-x-auto"><code>kubectl create serviceaccount spec-fetcher-sa</code></pre>

                                                                                    <p className="font-semibold mt-2">B. Give it permission to read cluster details:</p>
                                                                                    <pre className="bg-muted p-2 rounded-md overflow-x-auto"><code>{"kubectl create clusterrolebinding spec-fetcher-binding \\\n  --clusterrole=cluster-admin \\\n  --serviceaccount=default:spec-fetcher-sa"}</code></pre>

                                                                                    <p className="font-semibold mt-2">C. Generate the Token (valid for 1 year):</p>
                                                                                    <pre className="bg-muted p-2 rounded-md overflow-x-auto"><code>kubectl create token spec-fetcher-sa --duration=8760h</code></pre>
                                                                                </div>
                                                                                <p className="text-xs text-muted-foreground mt-2">Copy the long string of characters output by the final command into the API Bearer Token field.</p>
                                                                            </div>
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Cluster API URL</Label>
                                                                <Input placeholder="https://192.168.1.100:6443" value={formState.managedConfig?.apiUrl || ''} onChange={(e) => setFormState((p: any) => ({ ...p, managedConfig: { ...p.managedConfig!, apiUrl: e.target.value } }))} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>API Bearer Token</Label>
                                                                <Input type="password" placeholder="eyJh..." value={formState.managedConfig?.token || ''} onChange={(e) => setFormState((p: any) => ({ ...p, managedConfig: { ...p.managedConfig!, token: e.target.value } }))} />
                                                            </div>
                                                            <Button size="sm" type="button" onClick={handleSyncRancher} disabled={isSyncingRancher || !formState.managedConfig?.apiUrl || !formState.managedConfig?.token}>
                                                                {isSyncingRancher ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Connect &amp; Fetch
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-2 mt-2"><Label htmlFor="clusterName">Cluster Name</Label><Input id="clusterName" value={formState.clusterName || ''} onChange={handleInputChange} /></div>

                                                {isManagedK8s && (
                                                    <div className="space-y-4 mt-4">
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div><Label>CPU Cores</Label><Input type="number" min="1" value={formState.managedConfig?.cpuCores || ''} onChange={(e) => setFormState((p: any) => ({ ...p, managedConfig: { ...p.managedConfig!, cpuCores: Number(e.target.value) } }))} /></div>
                                                            <div><Label>Memory (GB)</Label><Input type="number" min="1" value={formState.managedConfig?.memoryGb || ''} onChange={(e) => setFormState((p: any) => ({ ...p, managedConfig: { ...p.managedConfig!, memoryGb: Number(e.target.value) } }))} /></div>
                                                            <div><Label>Disk Size (GB)</Label><Input type="number" min="1" value={formState.managedConfig?.diskSizeGb || ''} onChange={(e) => setFormState((p: any) => ({ ...p, managedConfig: { ...p.managedConfig!, diskSizeGb: Number(e.target.value) } }))} /></div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label>Container Engine</Label>
                                                                <Select value={formState.managedConfig?.containerEngine} onValueChange={(v) => setFormState((p: any) => ({ ...p, managedConfig: { ...p.managedConfig!, containerEngine: v as 'containerd' | 'dockerd' } }))}>
                                                                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="containerd">containerd</SelectItem>
                                                                        <SelectItem value="dockerd">dockerd (moby)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div><Label>Kubernetes Version</Label><Input value={formState.managedConfig?.kubernetesVersion || ''} onChange={(e) => setFormState((p: any) => ({ ...p, managedConfig: { ...p.managedConfig!, kubernetesVersion: e.target.value } }))} placeholder="e.g., v1.28.4+k3s2" /></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {!isManagedK8s && (
                                                    <>
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
                                                                        <div><Label>SSH Username</Label><Input value={node.ssh?.username || 'admin'} onChange={(e) => handleNodeChange(index, 'ssh.username', e.target.value)} /></div>
                                                                        <div><Label>SSH Public Key</Label><Textarea value={node.ssh?.sshKey || ''} onChange={(e) => handleNodeChange(index, 'ssh.sshKey', e.target.value)} /></div>
                                                                    </AccordionContent>
                                                                </AccordionItem>
                                                            </Accordion>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {isBladeSelected ? (
                                            <div className="space-y-4 p-4 border rounded-md">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroup value={formState.symmetric ? 'true' : 'false'} onValueChange={(v) => setFormState((p: any) => ({ ...p, symmetric: v === 'true' }))} className="flex gap-4">
                                                        <div className="flex items-center space-x-2"><RadioGroupItem value="true" id="symmetric" /><Label htmlFor="symmetric">Symmetric Blades</Label></div>
                                                        <div className="flex items-center space-x-2"><RadioGroupItem value="false" id="asymmetric" /><Label htmlFor="asymmetric">Asymmetric Blades</Label></div>
                                                    </RadioGroup>
                                                </div>
                                                <Label>Number of Blades</Label>
                                                <Input type="number" min="1" value={formState.bladeCount || 1} onChange={handleBladeCountChange} />

                                                {(formState.symmetric ? [formState.blades?.[0] || { name: 'Blade Template' }] : formState.blades || []).map((blade: any, index: number) => (
                                                    <Accordion type="single" collapsible key={index} className="w-full">
                                                        <AccordionItem value={`blade-${index}`}>
                                                            <AccordionTrigger>{formState.symmetric ? 'Blade Template' : blade.name}</AccordionTrigger>
                                                            <AccordionContent className="p-2 space-y-4">
                                                                {!formState.symmetric && <div><Label>Blade Name</Label><Input value={blade.name} onChange={(e) => handleAsymmetricBladeChange(index, 'name', e.target.value)} /></div>}
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div><Label>CPU Type</Label><Select value={blade.cpuType} onValueChange={(v) => formState.symmetric ? handleSymmetricBladeChange('cpuType', v) : handleAsymmetricBladeChange(index, 'cpuType', v)}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{options.cpuTypes.map(o => <SelectItem key={o._id} value={o.name}>{o.name}</SelectItem>)}</SelectContent></Select></div>
                                                                    <div><Label>CPU Cores</Label><Input type="number" value={blade.cpuCores || ''} onChange={(e) => formState.symmetric ? handleSymmetricBladeChange('cpuCores', Number(e.target.value)) : handleAsymmetricBladeChange(index, 'cpuCores', Number(e.target.value))} /></div>
                                                                    <div><Label>Memory (GB)</Label><Input type="number" value={blade.memory || ''} onChange={(e) => formState.symmetric ? handleSymmetricBladeChange('memory', Number(e.target.value)) : handleAsymmetricBladeChange(index, 'memory', Number(e.target.value))} /></div>
                                                                    <div><Label>Disk Type</Label><Select value={blade.diskType} onValueChange={(v) => formState.symmetric ? handleSymmetricBladeChange('diskType', v) : handleAsymmetricBladeChange(index, 'diskType', v)}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{options.diskTypes.map(o => <SelectItem key={o._id} value={o.name}>{o.name}</SelectItem>)}</SelectContent></Select></div>
                                                                    <div><Label>Disk Capacity (GB)</Label><Input type="number" value={blade.diskCapacity || ''} onChange={(e) => formState.symmetric ? handleSymmetricBladeChange('diskCapacity', Number(e.target.value)) : handleAsymmetricBladeChange(index, 'diskCapacity', Number(e.target.value))} /></div>
                                                                    <div className="flex items-center space-x-2 pt-6"><Checkbox checked={blade.hasGpu} onCheckedChange={(c) => formState.symmetric ? handleSymmetricBladeChange('hasGpu', !!c) : handleAsymmetricBladeChange(index, 'hasGpu', !!c)} /> <Label>Has GPU?</Label></div>
                                                                </div>
                                                                {blade.hasGpu && (
                                                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                                                        <div><Label>GPU Type</Label><Select value={blade.gpuType} onValueChange={(v) => formState.symmetric ? handleSymmetricBladeChange('gpuType', v) : handleAsymmetricBladeChange(index, 'gpuType', v)}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{options.gpuTypes.map(o => <SelectItem key={o._id} value={o.name}>{o.name}</SelectItem>)}</SelectContent></Select></div>
                                                                        <div><Label>GPU Cores</Label><Input type="number" value={blade.gpuCores || ''} onChange={(e) => formState.symmetric ? handleSymmetricBladeChange('gpuCores', Number(e.target.value)) : handleAsymmetricBladeChange(index, 'gpuCores', Number(e.target.value))} /></div>
                                                                    </div>
                                                                )}
                                                                <div className="pt-4 border-t">
                                                                    <Label>Network Interfaces</Label>
                                                                    <div className="space-y-2 mt-2">
                                                                        {(blade.networkInterfaces || []).map((iface: any, ifaceIndex: number) => (
                                                                            <div key={ifaceIndex} className="grid grid-cols-3 gap-2 items-center">
                                                                                <Input placeholder="Name (e.g., eth0)" value={iface.name} onChange={(e) => handleBladeNetworkInterfaceChange(index, ifaceIndex, 'name', e.target.value)} />
                                                                                <Select value={iface.type} onValueChange={(v) => handleBladeNetworkInterfaceChange(index, ifaceIndex, 'type', v)}>
                                                                                    <SelectTrigger><SelectValue placeholder="Type..." /></SelectTrigger>
                                                                                    <SelectContent>{options.networkCards.map(o => <SelectItem key={o._id} value={o.name}>{o.name}</SelectItem>)}</SelectContent>
                                                                                </Select>
                                                                                <div className="flex items-center gap-1">
                                                                                    <Input placeholder="Speed (e.g., 10Gbps)" value={iface.speed} onChange={(e) => handleBladeNetworkInterfaceChange(index, ifaceIndex, 'speed', e.target.value)} />
                                                                                    <Button variant="ghost" size="icon" onClick={() => removeBladeNetworkInterface(index, ifaceIndex)} type="button"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <Button variant="link" size="sm" onClick={() => addBladeNetworkInterface(index)} type="button"><PlusCircle className="mr-2 h-4 w-4" />Add Interface</Button>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                ))}
                                            </div>
                                        ) : (
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
                                                    <Checkbox id="virtualizationSupport" checked={formState.virtualizationSupport} onCheckedChange={(checked) => setFormState((p: any) => ({ ...p, virtualizationSupport: !!checked }))} />
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
                                            <div><Label>RAID Configuration</Label><Input id="raidConfiguration" value={formState.raidConfiguration || ''} onChange={handleInputChange} placeholder="e.g., RAID 10" /></div>
                                            <div>
                                                <Label>SSH Keys</Label>
                                                <Textarea id="sshKeys" value={formState.sshKeys || ''} onChange={handleInputChange} placeholder="Paste public SSH keys for access..." />
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
                                        <Textarea id="json-output" value={jsonString} onChange={handleJsonChange} rows={24} className="font-mono text-xs" />
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

