

'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Specification, VirtualNode } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Package, Copy, Check, FileJson, Server, Monitor } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectListBox } from '@/components/ui/multi-select-list-box';
import { PlusCircle, Trash2, HelpCircle } from 'lucide-react';
import { DiagramDisplay } from '../_components/diagram-display';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Option {
    _id: string;
    name: string;
}

type NewSpecificationState = Partial<Omit<Specification, '_id'>>;

const initialFormState: NewSpecificationState = {
    name: "New Blade Specification",
    hw_type: { id: 'Blade', name: 'Blade' },
    vendor: 'HPE',
    image: 'https://picsum.photos/seed/hpe-blade/400/400',
    service_contract_type: { id: 'ServiceContract_ProSupport_Plus', name: 'ProSupport Plus' },
    contact_point_email: 'support@example.com',
    contact_point_phone: '1-800-555-1234',
    custom_fields: [{ key: 'Asset Tag', value: 'HW-12345' }],
    symmetric: true,
    bladeCount: 4,
    blades: [{
        name: 'Blade Template',
        cpuType: 'Intel Xeon Scalable',
        cpuCores: 24,
        memory: 128,
        diskType: 'SSD_NVMe_U2_PCIeGen4',
        diskCapacity: 2048,
        hasGpu: true,
        gpuType: 'NVIDIA A100',
        gpuCores: 108,
        networkInterfaces: [{ name: 'eth0', type: 'Ethernet_40G_QSFP+', speed: '40Gbps' }]
    }],
    nodeCount: { controlPlane: 1, worker: 1 },
    nodes: [],
    biosVersion: "U52 v1.50",
    firmwareVersion: "3.01 (iLO 6)",
    cpuArchitecture: "x86_64",
    virtualizationSupport: true,
    iloCredentials: { username: 'admin', password: 'password' },
    timeSync: 'time.nist.gov',
    raidConfiguration: 'RAID 1 (OS), RAID 5 (Data)',
    diskLayout: { osDisk: '2x 480GB SSD', dataDisk: '8x 2TB SAS HDD' },
};


export default function SpecificationBuilderPage() {
    const [user, setUser] = useState<User | null>(null);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<NewSpecificationState>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const [jsonSpec, setJsonSpec] = useState('');
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
        async function fetchOptions() {
            try {
                const [hwTypesRes, vendorsRes, hypervisorsRes, contractsRes, networkCardsRes, plugPowerCordsRes, cpuTypesRes, gpuTypesRes, diskTypesRes] = await Promise.all([
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
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load options for form.' });
            }
        }
        fetchOptions();
    }, [toast]);

    const isBladeSelected = useMemo(() => {
        return options.hwTypes.find(o => o._id === formData.hw_type?.id)?.name === 'Blade';
    }, [formData.hw_type, options.hwTypes]);

    const isVirtualSelected = useMemo(() => {
        return options.hwTypes.find(o => o._id === formData.hw_type?.id)?.name === 'Virtual';
    }, [formData.hw_type, options.hwTypes]);

    const isManagedK8s = useMemo(() => {
        return isVirtualSelected && formData.clusterType === 'Managed Kubernetes';
    }, [isVirtualSelected, formData.clusterType]);

    const handleNodeCountChange = (role: 'controlPlane' | 'worker', count: number) => {
        const newCount = Math.max(0, count);
        setFormData((prev: any) => {
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
        const newNodes = [...(formData.nodes || [])];
        if (field.startsWith('ssh.')) {
            const sshField = field.split('.')[1];
            newNodes[index] = { ...newNodes[index], ssh: { ...newNodes[index].ssh, [sshField]: value } };
        } else {
            newNodes[index] = { ...newNodes[index], [field]: value } as VirtualNode;
        }
        setFormData(prev => ({ ...prev, nodes: newNodes }));
    };

    const handleNext = useCallback(async () => {
        const maxSteps = 1;
        const nextStep = step + 1;

        if (nextStep > maxSteps) {
            let fullSpec: any = { ...formData };

            if (isVirtualSelected) {
                // Already handled by state updates
            } else if (isBladeSelected) {
                if (formData.symmetric) {
                    const templateBlade = formData.blades?.[0] || {};
                    fullSpec.blades = Array.from({ length: formData.bladeCount || 1 }).map((_, i) => ({
                        ...templateBlade,
                        name: `Blade ${i + 1}`,
                    }));
                }
            } else { // It's a rack or other simple server
                delete fullSpec.blades;
                delete fullSpec.symmetric;
                delete fullSpec.bladeCount;
                delete fullSpec.clusterName;
                delete fullSpec.nodeCount;
                delete fullSpec.nodes;
            }

            setJsonSpec(JSON.stringify(fullSpec, null, 2));
            setStep(2);
        } else {
            setStep(nextStep);
        }
    }, [step, formData, isBladeSelected, isVirtualSelected, setJsonSpec, setStep]);

    const handleBack = () => {
        setStep(s => s - 1);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target as HTMLInputElement;
        const checked = (e.target as HTMLInputElement).checked;
        const group = e.target.dataset.group as string | undefined;

        if (group) {
            setFormData((prev: any) => ({
                ...prev,
                [group]: {
                    ...prev[group],
                    [id]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData((prev: any) => ({ ...prev, [id]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }));
        }
    };

    const handleBladeCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const count = parseInt(e.target.value, 10) || 1;
        setFormData((prev: any) => ({ ...prev, bladeCount: count, blades: Array.from({ length: count }).map((_, i) => prev.blades?.[i] || { name: `Blade ${i + 1}`, networkInterfaces: [] }) }));
    }

    const handleAsymmetricBladeChange = (index: number, field: string, value: any) => {
        const newBlades = [...(formData.blades || [])];
        newBlades[index] = { ...newBlades[index], [field]: value };
        setFormData((prev: any) => ({ ...prev, blades: newBlades }));
    }

    const handleSymmetricBladeChange = (field: string, value: any) => {
        const templateBlade = formData.blades?.[0] || { networkInterfaces: [] };
        const updatedBlade = { ...templateBlade, [field]: value };
        setFormData((prev: any) => ({ ...prev, blades: [updatedBlade] }));
    };

    const handleBladeNetworkInterfaceChange = (bladeIndex: number, ifaceIndex: number, field: 'name' | 'type' | 'speed', value: string, isSymmetric: boolean) => {
        const newBlades = [...(formData.blades || [])];
        const targetBladeIndex = isSymmetric ? 0 : bladeIndex;
        if (!newBlades[targetBladeIndex]) newBlades[targetBladeIndex] = { name: `Blade ${targetBladeIndex + 1}`, networkInterfaces: [] };
        if (!newBlades[targetBladeIndex].networkInterfaces) newBlades[targetBladeIndex].networkInterfaces = [];
        const newInterfaces = [...(newBlades[targetBladeIndex].networkInterfaces)];
        newInterfaces[ifaceIndex] = { ...newInterfaces[ifaceIndex], [field]: value };
        newBlades[targetBladeIndex] = { ...newBlades[targetBladeIndex], networkInterfaces: newInterfaces };
        setFormData((prev: any) => ({ ...prev, blades: newBlades }));
    };

    const addBladeNetworkInterface = (bladeIndex: number, isSymmetric: boolean) => {
        const newBlades = [...(formData.blades || [])];
        const targetBladeIndex = isSymmetric ? 0 : bladeIndex;
        if (!newBlades[targetBladeIndex]) newBlades[targetBladeIndex] = { name: `Blade ${targetBladeIndex + 1}`, networkInterfaces: [] };
        if (!newBlades[targetBladeIndex].networkInterfaces) newBlades[targetBladeIndex].networkInterfaces = [];
        const newInterfaces = [...(newBlades[targetBladeIndex].networkInterfaces), { name: '', type: '', speed: '' }];
        newBlades[targetBladeIndex] = { ...newBlades[targetBladeIndex], networkInterfaces: newInterfaces };
        setFormData((prev: any) => ({ ...prev, blades: newBlades }));
    };

    const removeBladeNetworkInterface = (bladeIndex: number, ifaceIndex: number, isSymmetric: boolean) => {
        const newBlades = [...(formData.blades || [])];
        const targetBladeIndex = isSymmetric ? 0 : bladeIndex;
        if (!newBlades[targetBladeIndex]?.networkInterfaces) return;
        const newInterfaces = (newBlades[targetBladeIndex].networkInterfaces || []).filter((_: any, i: number) => i !== ifaceIndex);
        newBlades[targetBladeIndex] = { ...newBlades[targetBladeIndex], networkInterfaces: newInterfaces };
        setFormData((prev: any) => ({ ...prev, blades: newBlades }));
    };

    const handleRadioChange = (id: string, value: string) => {
        if (id === 'clusterType') {
            setFormData((prev: any) => {
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
            setFormData((prev: any) => ({ ...prev, [id]: value === 'true' }));
        }
    };

    const handleSyncRancher = async () => {
        setIsSyncingRancher(true);
        try {
            const res = await fetch('/api/specifications/rancher-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiUrl: formData.managedConfig?.apiUrl,
                    token: formData.managedConfig?.token
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to fetch cluster settings.");
            }
            const data = await res.json();

            setFormData((prev: any) => ({
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

    const handleSelectChange = (field: string, value: string) => {
        const listMap: Record<string, Option[]> = {
            'hw_type': options.hwTypes,
            'hypervisor': options.hypervisors,
            'service_contract_type': options.serviceContracts
        }

        if (field === 'vendor') {
            setFormData((prev: any) => ({ ...prev, vendor: value }));
        } else {
            const list = listMap[field];
            const selectedOption = list.find(opt => opt._id === value);
            if (selectedOption) {
                setFormData((prev: any) => ({ ...prev, [field]: { id: selectedOption._id, name: selectedOption.name } }));
            }
        }
    };

    const handleMultiSelectChange = (field: 'network_cards' | 'plug_power_cords', selectedItems: { id: string; name: string }[]) => {
        setFormData((prev: any) => ({ ...prev, [field]: selectedItems }));
    };

    const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
        const newFields = [...(formData.custom_fields || [])];
        newFields[index] = { ...newFields[index], [field]: value };
        setFormData((prev: any) => ({ ...prev, custom_fields: newFields }));
    };

    const addCustomField = () => {
        setFormData((prev: any) => ({ ...prev, custom_fields: [...(prev.custom_fields || []), { key: '', value: '' }] }));
    };

    const removeCustomField = (index: number) => {
        const newFields = (formData.custom_fields || []).filter((_: any, i: number) => i !== index);
        setFormData((prev: any) => ({ ...prev, custom_fields: newFields }));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonSpec);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        let payload;
        try {
            payload = JSON.parse(jsonSpec);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Invalid JSON', description: 'The JSON in the editor is not valid.' });
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch('/api/specifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save specification.');
            }
            toast({ title: 'Success', description: 'Specification created successfully.' });
            router.push('/specifications');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepOne = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                <div><Label htmlFor="name">HW Name *</Label><Input id="name" value={formData.name || ''} onChange={handleInputChange} required /></div>
                <div>
                    <Label htmlFor="hw_type">HW Type</Label>
                    <Select value={formData.hw_type?.id} onValueChange={(value) => handleSelectChange('hw_type', value)}>
                        <SelectTrigger><SelectValue placeholder="Select HW Type" /></SelectTrigger>
                        <SelectContent>{options.hwTypes.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="vendor">Vendor *</Label>
                    <Select value={formData.vendor} onValueChange={(value) => handleSelectChange('vendor', value)} required>
                        <SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                        <SelectContent>{options.vendors.map(v => <SelectItem key={v._id} value={v.name}>{v.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="image">Image URL</Label><Input id="image" value={formData.image || ''} onChange={handleInputChange} /></div>
                <div>
                    <Label htmlFor="service_contract_type">Service Contract Type</Label>
                    <Select value={formData.service_contract_type?.id} onValueChange={(value) => handleSelectChange('service_contract_type', value)}>
                        <SelectTrigger><SelectValue placeholder="Select Contract Type" /></SelectTrigger>
                        <SelectContent>{options.serviceContracts.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="contact_point_email">Contact Email</Label><Input id="contact_point_email" type="email" value={formData.contact_point_email || ''} onChange={handleInputChange} /></div>
                    <div><Label htmlFor="contact_point_phone">Contact Phone</Label><Input id="contact_point_phone" type="tel" value={formData.contact_point_phone || ''} onChange={handleInputChange} /></div>
                </div>

                <div>
                    <h3 className="font-semibold text-lg mt-6">Custom Fields</h3>
                    <div className="space-y-2">
                        {(formData.custom_fields || []).map((field, index) => (
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
                                <RadioGroup value={formData.clusterType || 'Standard'} onValueChange={(v) => handleRadioChange('clusterType', v)} className="flex gap-4">
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
                                                            <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto text-muted-foreground"><code>{"kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}'"}</code></pre>
                                                            <p className="text-xs text-muted-foreground">Copy the output (e.g., https://127.0.0.1:6443) into the API URL field.</p>
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
                                            <Input placeholder="https://192.168.1.100:6443" value={formData.managedConfig?.apiUrl || ''} onChange={(e) => setFormData(p => ({ ...p, managedConfig: { ...p.managedConfig!, apiUrl: e.target.value } }))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>API Bearer Token</Label>
                                            <Input type="password" placeholder="eyJh..." value={formData.managedConfig?.token || ''} onChange={(e) => setFormData(p => ({ ...p, managedConfig: { ...p.managedConfig!, token: e.target.value } }))} />
                                        </div>
                                        <Button size="sm" type="button" onClick={handleSyncRancher} disabled={isSyncingRancher || !formData.managedConfig?.apiUrl || !formData.managedConfig?.token}>
                                            {isSyncingRancher ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Connect &amp; Fetch
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 mt-2"><Label htmlFor="clusterName">Cluster Name</Label><Input id="clusterName" value={formData.clusterName || ''} onChange={handleInputChange} /></div>

                            {isManagedK8s && (
                                <div className="space-y-4 mt-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div><Label>CPU Cores</Label><Input type="number" min="1" value={formData.managedConfig?.cpuCores || ''} onChange={(e) => setFormData(p => ({ ...p, managedConfig: { ...p.managedConfig!, cpuCores: Number(e.target.value) } }))} /></div>
                                        <div><Label>Memory (GB)</Label><Input type="number" min="1" value={formData.managedConfig?.memoryGb || ''} onChange={(e) => setFormData(p => ({ ...p, managedConfig: { ...p.managedConfig!, memoryGb: Number(e.target.value) } }))} /></div>
                                        <div><Label>Disk Size (GB)</Label><Input type="number" min="1" value={formData.managedConfig?.diskSizeGb || ''} onChange={(e) => setFormData(p => ({ ...p, managedConfig: { ...p.managedConfig!, diskSizeGb: Number(e.target.value) } }))} /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Container Engine</Label>
                                            <Select value={formData.managedConfig?.containerEngine} onValueChange={(v) => setFormData(p => ({ ...p, managedConfig: { ...p.managedConfig!, containerEngine: v as 'containerd' | 'dockerd' } }))}>
                                                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="containerd">containerd</SelectItem>
                                                    <SelectItem value="dockerd">dockerd (moby)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div><Label>Kubernetes Version</Label><Input value={formData.managedConfig?.kubernetesVersion || ''} onChange={(e) => setFormData(p => ({ ...p, managedConfig: { ...p.managedConfig!, kubernetesVersion: e.target.value } }))} placeholder="e.g., v1.28.4+k3s2" /></div>
                                    </div>
                                </div>
                            )}

                            {!isManagedK8s && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><Label>Control Plane Nodes</Label><Input type="number" min="0" value={formData.nodeCount?.controlPlane || 0} onChange={(e) => handleNodeCountChange('controlPlane', Number(e.target.value))} /></div>
                                        <div><Label>Worker Nodes</Label><Input type="number" min="0" value={formData.nodeCount?.worker || 0} onChange={(e) => handleNodeCountChange('worker', Number(e.target.value))} /></div>
                                    </div>
                                    {(formData.nodes || []).map((node, index) => (
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
                    {isBladeSelected && (
                        <div className="space-y-4 p-4 border rounded-md">
                            <div className="flex items-center space-x-2">
                                <RadioGroup value={formData.symmetric ? 'true' : 'false'} onValueChange={(v) => handleRadioChange('symmetric', v)} className="flex gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="true" id="symmetric" /><Label htmlFor="symmetric">Symmetric Blades</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="false" id="asymmetric" /><Label htmlFor="asymmetric">Asymmetric Blades</Label></div>
                                </RadioGroup>
                            </div>
                            <Label>Number of Blades</Label>
                            <Input type="number" min="1" value={formData.bladeCount || 1} onChange={handleBladeCountChange} />

                            {(formData.symmetric ? [formData.blades?.[0] || { name: 'Blade Template' }] : formData.blades || []).map((blade: any, index: number) => (
                                <Accordion type="single" collapsible key={index} className="w-full">
                                    <AccordionItem value={`blade-${index}`}>
                                        <AccordionTrigger>{formData.symmetric ? 'Blade Template' : blade.name}</AccordionTrigger>
                                        <AccordionContent className="p-2 space-y-4">
                                            {!formData.symmetric && <div><Label>Blade Name</Label><Input value={blade.name} onChange={(e) => handleAsymmetricBladeChange(index, 'name', e.target.value)} /></div>}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><Label>CPU Type</Label><Select value={blade.cpuType} onValueChange={(v) => formData.symmetric ? handleSymmetricBladeChange('cpuType', v) : handleAsymmetricBladeChange(index, 'cpuType', v)}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{options.cpuTypes.map(o => <SelectItem key={o._id} value={o.name}>{o.name}</SelectItem>)}</SelectContent></Select></div>
                                                <div><Label>CPU Cores</Label><Input type="number" value={blade.cpuCores || ''} onChange={(e) => formData.symmetric ? handleSymmetricBladeChange('cpuCores', Number(e.target.value)) : handleAsymmetricBladeChange(index, 'cpuCores', Number(e.target.value))} /></div>
                                                <div><Label>Memory (GB)</Label><Input type="number" value={blade.memory || ''} onChange={(e) => formData.symmetric ? handleSymmetricBladeChange('memory', Number(e.target.value)) : handleAsymmetricBladeChange(index, 'memory', Number(e.target.value))} /></div>
                                                <div><Label>Disk Type</Label><Select value={blade.diskType} onValueChange={(v) => formData.symmetric ? handleSymmetricBladeChange('diskType', v) : handleAsymmetricBladeChange(index, 'diskType', v)}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{options.diskTypes.map(o => <SelectItem key={o._id} value={o.name}>{o.name}</SelectItem>)}</SelectContent></Select></div>
                                                <div><Label>Disk Capacity (GB)</Label><Input type="number" value={blade.diskCapacity || ''} onChange={(e) => formData.symmetric ? handleSymmetricBladeChange('diskCapacity', Number(e.target.value)) : handleAsymmetricBladeChange(index, 'diskCapacity', Number(e.target.value))} /></div>
                                                <div className="flex items-center space-x-2 pt-6"><Checkbox checked={blade.hasGpu} onCheckedChange={(c) => formData.symmetric ? handleSymmetricBladeChange('hasGpu', !!c) : handleAsymmetricBladeChange(index, 'hasGpu', !!c)} /> <Label>Has GPU?</Label></div>
                                            </div>
                                            {blade.hasGpu && (
                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                                    <div><Label>GPU Type</Label><Select value={blade.gpuType} onValueChange={(v) => formData.symmetric ? handleSymmetricBladeChange('gpuType', v) : handleAsymmetricBladeChange(index, 'gpuType', v)}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{options.gpuTypes.map(o => <SelectItem key={o._id} value={o.name}>{o.name}</SelectItem>)}</SelectContent></Select></div>
                                                    <div><Label>GPU Cores</Label><Input type="number" value={blade.gpuCores || ''} onChange={(e) => formData.symmetric ? handleSymmetricBladeChange('gpuCores', Number(e.target.value)) : handleAsymmetricBladeChange(index, 'gpuCores', Number(e.target.value))} /></div>
                                                </div>
                                            )}
                                            <div className="pt-4 border-t">
                                                <Label>Network Interfaces</Label>
                                                <div className="space-y-2 mt-2">
                                                    {(blade.networkInterfaces || []).map((iface: any, ifaceIndex: number) => (
                                                        <div key={ifaceIndex} className="grid grid-cols-3 gap-2 items-center">
                                                            <Input placeholder="Name (e.g., eth0)" value={iface.name} onChange={(e) => handleBladeNetworkInterfaceChange(index, ifaceIndex, 'name', e.target.value, !!formData.symmetric)} />
                                                            <Select value={iface.type} onValueChange={(v) => handleBladeNetworkInterfaceChange(index, ifaceIndex, 'type', v, !!formData.symmetric)}>
                                                                <SelectTrigger><SelectValue placeholder="Type..." /></SelectTrigger>
                                                                <SelectContent>{options.networkCards.map(o => <SelectItem key={o._id} value={o.name}>{o.name}</SelectItem>)}</SelectContent>
                                                            </Select>
                                                            <div className="flex items-center gap-1">
                                                                <Input placeholder="Speed (e.g., 10Gbps)" value={iface.speed} onChange={(e) => handleBladeNetworkInterfaceChange(index, ifaceIndex, 'speed', e.target.value, !!formData.symmetric)} />
                                                                <Button variant="ghost" size="icon" onClick={() => removeBladeNetworkInterface(index, ifaceIndex, !!formData.symmetric)} type="button"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button variant="link" size="sm" onClick={() => addBladeNetworkInterface(index, !!formData.symmetric)} type="button"><PlusCircle className="mr-2 h-4 w-4" />Add Interface</Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            ))}
                        </div>
                    )}
                    {!isBladeSelected && !isVirtualSelected && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md">
                            <div><Label htmlFor="total_cpu">Total CPU *</Label><Input id="total_cpu" type="number" value={formData.total_cpu || ''} onChange={handleInputChange} required /></div>
                            <div><Label htmlFor="memory_gb">Memory (GB) *</Label><Input id="memory_gb" type="number" value={formData.memory_gb || ''} onChange={handleInputChange} required /></div>
                            <div><Label htmlFor="storage_gb">Total Storage (GB) *</Label><Input id="storage_gb" type="number" value={formData.storage_gb || ''} onChange={handleInputChange} required /></div>
                        </div>
                    )}
                </div>
                {!isVirtualSelected && (
                    <div className="space-y-4">
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-lg">Firmware & OS</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label htmlFor="biosVersion">BIOS Version</Label><Input id="biosVersion" value={formData.biosVersion || ''} onChange={handleInputChange} /></div>
                                <div><Label htmlFor="firmwareVersion">Firmware Version</Label><Input id="firmwareVersion" value={formData.firmwareVersion || ''} onChange={handleInputChange} /></div>
                                <div><Label htmlFor="cpuArchitecture">CPU Architecture</Label><Input id="cpuArchitecture" value={formData.cpuArchitecture || ''} onChange={handleInputChange} /></div>
                                <div className="flex items-center space-x-2 pt-6">
                                    <Checkbox id="virtualizationSupport" checked={formData.virtualizationSupport} onCheckedChange={(checked) => setFormData(p => ({ ...p, virtualizationSupport: !!checked }))} />
                                    <Label htmlFor="virtualizationSupport">Virtualization Support</Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-lg">Remote Management</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label htmlFor="username" data-group="iloCredentials">iLO Username</Label><Input data-group="iloCredentials" id="username" value={formData.iloCredentials?.username || ''} onChange={handleInputChange} /></div>
                                <div><Label htmlFor="password" data-group="iloCredentials">iLO Password</Label><Input data-group="iloCredentials" id="password" type="password" value={formData.iloCredentials?.password || ''} onChange={handleInputChange} /></div>
                            </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-lg">Network & Storage</h3>
                            <div>
                                <Label>Network Topology</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Input data-group="networkTopology" id="managementVLAN" placeholder="Mgmt VLAN" value={formData.networkTopology?.managementVLAN || ''} onChange={handleInputChange} />
                                    <Input data-group="networkTopology" id="storageVLAN" placeholder="Storage VLAN" value={formData.networkTopology?.storageVLAN || ''} onChange={handleInputChange} />
                                    <Input data-group="networkTopology" id="workloadVLAN" placeholder="Workload VLAN" value={formData.networkTopology?.workloadVLAN || ''} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div>
                                <Label>IP Address Pool</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Input data-group="ipAddressPool" id="management" placeholder="Mgmt CIDR" value={formData.ipAddressPool?.management || ''} onChange={handleInputChange} />
                                    <Input data-group="ipAddressPool" id="storage" placeholder="Storage CIDR" value={formData.ipAddressPool?.storage || ''} onChange={handleInputChange} />
                                    <Input data-group="ipAddressPool" id="workload" placeholder="Workload CIDR" value={formData.ipAddressPool?.workload || ''} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div><Label>Time Sync (NTP Server)</Label><Input id="timeSync" value={formData.timeSync || ''} onChange={handleInputChange} /></div>
                            <div>
                                <Label>Disk Layout</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input data-group="diskLayout" id="osDisk" placeholder="OS Disk (e.g., 200GB SSD)" value={formData.diskLayout?.osDisk || ''} onChange={handleInputChange} />
                                    <Input data-group="diskLayout" id="dataDisk" placeholder="Data Disk (e.g., 1TB NVMe)" value={formData.diskLayout?.dataDisk || ''} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div><Label>RAID Configuration</Label><Input id="raidConfiguration" value={formData.raidConfiguration || ''} onChange={handleInputChange} placeholder="e.g., RAID 10" /></div>
                            <div>
                                <Label>SSH Keys</Label>
                                <Textarea id="sshKeys" value={formData.sshKeys || ''} onChange={handleInputChange} placeholder="Paste public SSH keys for access..." />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );

    const renderSummaryAndExport = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <Card>
                    <CardHeader><CardTitle>Generated JSON Specification</CardTitle></CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Textarea value={jsonSpec} onChange={(e) => setJsonSpec(e.target.value)} rows={20} className="font-mono text-xs" />
                            <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={handleCopy}>
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Upload Specification</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">Or, upload an existing specification in the same JSON format.</p>
                        <Input type="file" />
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4">
                <Card>
                    <CardHeader><CardTitle>Visualization</CardTitle></CardHeader>
                    <CardContent className="h-[30rem]">
                        <DiagramDisplay specJson={jsonSpec} />
                    </CardContent>
                </Card>
                <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Package className="h-5 w-5 mr-2" />}
                    Create Specification
                </Button>
            </div>
        </div>
    );

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return renderStepOne();
            case 2:
                return renderSummaryAndExport();
            default:
                router.push('/specifications');
                return null;
        }
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Specification Builder</h1>
                    <p className="text-muted-foreground">
                        Create a detailed hardware specification using the form below.
                    </p>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>
                            {step === 1 && 'Step 1: Define Specification Details'}
                            {step === 2 && 'Step 2: Review and Finalize'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderStepContent()}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={handleBack} disabled={isSubmitting || step === 1}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        {step < 2 && (
                            <Button onClick={handleNext} disabled={!formData.name}>
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
