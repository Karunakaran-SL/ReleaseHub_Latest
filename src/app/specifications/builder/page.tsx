

'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Specification } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Package, Copy, Check, FileJson } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectListBox } from '@/components/ui/multi-select-list-box';
import { PlusCircle, Trash2 } from 'lucide-react';
import { DiagramDisplay } from '../_components/diagram-display';
import { Checkbox } from '@/components/ui/checkbox';

interface Option {
    _id: string;
    name: string;
}

type NewSpecificationState = Partial<Omit<Specification, '_id'>>;

const initialFormState: NewSpecificationState = { 
    symmetric: true, 
    custom_fields: [{key: '', value: ''}], 
    bladeCount: 1, 
    blades: [{name: 'Blade 1', cpuCores: 0, memory: 0, diskCapacity: 0, networkInterfaces: [], hasGpu: false}] 
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
    
    const [options, setOptions] = useState({
        hwTypes: [] as Option[],
        vendors: [] as Option[],
        hypervisors: [] as Option[],
        serviceContracts: [] as Option[],
        networkCards: [] as Option[],
        plugPowerCords: [] as Option[],
        cpuTypes: [] as Option[],
        gpuTypes: [] as Option[],
    });

    useEffect(() => {
        getUser().then(setUser);
         async function fetchOptions() {
            try {
                const [hwTypesRes, vendorsRes, hypervisorsRes, contractsRes, networkCardsRes, plugPowerCordsRes, cpuTypesRes, gpuTypesRes] = await Promise.all([
                    fetch('/api/settings/specifications/hw-types'),
                    fetch('/api/settings/specifications/vendors'),
                    fetch('/api/settings/specifications/hypervisors'),
                    fetch('/api/documents/service-contracts'),
                    fetch('/api/settings/specifications/network-cards'),
                    fetch('/api/settings/specifications/plug-power-cords'),
                    fetch('/api/settings/specifications/cpu-types'),
                    fetch('/api/settings/specifications/gpu-types'),
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

    const handleNext = useCallback(async () => {
        const maxSteps = 1; 
        const nextStep = step + 1;
        
        if (nextStep > maxSteps) {
            let fullSpec: any = { ...formData };
            
            if (isBladeSelected) {
                if (formData.symmetric) {
                    const templateBlade = formData.blades?.[0] || {};
                    fullSpec.blades = Array.from({length: formData.bladeCount || 1}).map((_, i) => ({
                        ...templateBlade,
                        name: `Blade ${i + 1}`,
                    }));
                }
            } else {
                 delete fullSpec.blades;
                 delete fullSpec.symmetric;
                 delete fullSpec.bladeCount;
            }
            
            setJsonSpec(JSON.stringify(fullSpec, null, 2));
            setStep(2);
        } else {
            setStep(nextStep);
        }
    }, [step, formData, isBladeSelected, setJsonSpec, setStep]);

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
        const count = parseInt(e.target.value, 10);
        setFormData((prev: any) => ({ ...prev, bladeCount: count, blades: Array.from({length: count}).map((_, i) => prev.blades?.[i] || {name: `Blade ${i+1}`, networkInterfaces: []}) }));
    }
    
    const handleAsymmetricBladeChange = (index: number, field: string, value: any) => {
        const newBlades = [...(formData.blades || [])];
        newBlades[index] = {...newBlades[index], [field]: value };
        setFormData((prev: any) => ({...prev, blades: newBlades}));
    }

    const handleSymmetricBladeChange = (field: string, value: any) => {
        const templateBlade = formData.blades?.[0] || { networkInterfaces: [] };
        const updatedBlade = { ...templateBlade, [field]: value };
        setFormData((prev: any) => ({ ...prev, blades: [updatedBlade] }));
    };

    const handleBladeNetworkInterfaceChange = (bladeIndex: number, ifaceIndex: number, field: 'name' | 'type' | 'speed', value: string, isSymmetric: boolean) => {
        const newBlades = [...(formData.blades || [])];
        const targetBladeIndex = isSymmetric ? 0 : bladeIndex;
        if (!newBlades[targetBladeIndex]) newBlades[targetBladeIndex] = { networkInterfaces: [] };
        if (!newBlades[targetBladeIndex].networkInterfaces) newBlades[targetBladeIndex].networkInterfaces = [];
        const newInterfaces = [...(newBlades[targetBladeIndex].networkInterfaces)];
        newInterfaces[ifaceIndex] = { ...newInterfaces[ifaceIndex], [field]: value };
        newBlades[targetBladeIndex] = { ...newBlades[targetBladeIndex], networkInterfaces: newInterfaces };
        setFormData((prev: any) => ({ ...prev, blades: newBlades }));
    };

    const addBladeNetworkInterface = (bladeIndex: number, isSymmetric: boolean) => {
        const newBlades = [...(formData.blades || [])];
        const targetBladeIndex = isSymmetric ? 0 : bladeIndex;
        if (!newBlades[targetBladeIndex]) newBlades[targetBladeIndex] = { networkInterfaces: [] };
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
        setFormData((prev: any) => ({...prev, [id]: value === 'true'}));
    };

    const handleSelectChange = (field: string, value: string) => {
        const listMap: Record<string, Option[]> = {
            'hw_type': options.hwTypes,
            'hypervisor': options.hypervisors,
            'service_contract_type': options.serviceContracts
        }
        
        if (field === 'vendor') {
            setFormData((prev: any) => ({...prev, vendor: value}));
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
        setFormData((prev: any) => ({ ...prev, custom_fields: [...(prev.custom_fields || []), { key: '', value: '' }]}));
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

                <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-lg">Firmware &amp; OS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="biosVersion">BIOS Version</Label><Input id="biosVersion" value={formData.biosVersion || ''} onChange={handleInputChange} /></div>
                        <div><Label htmlFor="firmwareVersion">Firmware Version</Label><Input id="firmwareVersion" value={formData.firmwareVersion || ''} onChange={handleInputChange} /></div>
                        <div><Label htmlFor="cpuArchitecture">CPU Architecture</Label><Input id="cpuArchitecture" value={formData.cpuArchitecture || ''} onChange={handleInputChange} /></div>
                        <div className="flex items-center space-x-2 pt-6">
                            <Checkbox id="virtualizationSupport" checked={formData.virtualizationSupport} onCheckedChange={(checked) => setFormData(p => ({...p, virtualizationSupport: !!checked}))} />
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
            </div>
            <div className="space-y-4">
                 <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Hardware Specification</h3>
                    {isBladeSelected ? (
                        <div className="space-y-4">
                            <Label className="text-md font-semibold">Blade Configuration</Label>
                            <RadioGroup onValueChange={(v) => handleRadioChange('symmetric', v)} value={String(formData.symmetric)} className="mt-2 space-y-1">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="true" id="sym1" /><Label htmlFor="sym1" className="font-normal">Symmetric (all blades identical)</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="false" id="sym2" /><Label htmlFor="sym2" className="font-normal">Asymmetric (define each blade individually)</Label></div>
                            </RadioGroup>
                        </div>
                    ): (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md">
                            <div><Label htmlFor="total_cpu">Total CPU *</Label><Input id="total_cpu" type="number" value={formData.total_cpu || ''} onChange={handleInputChange} required /></div>
                            <div><Label htmlFor="memory_gb">Memory (GB) *</Label><Input id="memory_gb" type="number" value={formData.memory_gb || ''} onChange={handleInputChange} required /></div>
                            <div><Label htmlFor="storage_gb">Total Storage (GB) *</Label><Input id="storage_gb" type="number" value={formData.storage_gb || ''} onChange={handleInputChange} required /></div>
                        </div>
                    )}
                    {isBladeSelected && formData.symmetric && (
                        <div className="space-y-4 border p-4 rounded-md">
                            <Card>
                                <CardHeader><CardTitle>Symmetric Blade Template</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div><Label>Number of Blades</Label><Input id="bladeCount" type="number" value={formData.bladeCount || 1} onChange={handleBladeCountChange} min={1} /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><Label>CPU Type</Label><Select value={formData.blades?.[0]?.cpuType} onValueChange={(v) => handleSymmetricBladeChange('cpuType', v)}><SelectTrigger><SelectValue placeholder="Select CPU..."/></SelectTrigger><SelectContent>{options.cpuTypes.map(t => <SelectItem key={t._id} value={t.name}>{t.name}</SelectItem>)}</SelectContent></Select></div>
                                        <div><Label>CPU Cores</Label><Input type="number" value={formData.blades?.[0]?.cpuCores || ''} onChange={e => handleSymmetricBladeChange('cpuCores', Number(e.target.value))} /></div>
                                        <div><Label>Memory (GB)</Label><Input type="number" value={formData.blades?.[0]?.memory || ''} onChange={e => handleSymmetricBladeChange('memory', Number(e.target.value))} /></div>
                                        <div><Label>Disk Type</Label><Select value={formData.blades?.[0]?.diskType} onValueChange={(v) => handleSymmetricBladeChange('diskType', v)}><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent><SelectItem value="SSD">SSD</SelectItem><SelectItem value="HDD">HDD</SelectItem></SelectContent></Select></div>
                                        <div><Label>Disk Capacity (GB)</Label><Input type="number" value={formData.blades?.[0]?.diskCapacity || ''} onChange={e => handleSymmetricBladeChange('diskCapacity', Number(e.target.value))} /></div>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Checkbox id="symmetric-hasGpu" checked={formData.blades?.[0]?.hasGpu || false} onCheckedChange={(checked) => handleSymmetricBladeChange('hasGpu', !!checked)} />
                                        <Label htmlFor="symmetric-hasGpu">Has GPU?</Label>
                                    </div>
                                    {formData.blades?.[0]?.hasGpu && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><Label>GPU Type</Label><Select value={formData.blades?.[0]?.gpuType} onValueChange={(v) => handleSymmetricBladeChange('gpuType', v)}><SelectTrigger><SelectValue placeholder="Select GPU..." /></SelectTrigger><SelectContent>{options.gpuTypes.map(t => <SelectItem key={t._id} value={t.name}>{t.name}</SelectItem>)}</SelectContent></Select></div>
                                            <div><Label>GPU Cores</Label><Input type="number" value={formData.blades?.[0]?.gpuCores || ''} onChange={(e) => handleSymmetricBladeChange('gpuCores', Number(e.target.value))} /></div>
                                        </div>
                                    )}
                                    <div>
                                        <Label>Network Interfaces</Label>
                                        <div className="space-y-2 mt-1">
                                            {Array.isArray(formData.blades?.[0]?.networkInterfaces) && formData.blades[0].networkInterfaces.map((iface: any, ifaceIndex: number) => (
                                                <div key={ifaceIndex} className="grid grid-cols-4 gap-2 items-center">
                                                    <Input placeholder="Name" value={iface.name} onChange={e => handleBladeNetworkInterfaceChange(0, ifaceIndex, 'name', e.target.value, true)} />
                                                    <Input placeholder="Type" value={iface.type} onChange={e => handleBladeNetworkInterfaceChange(0, ifaceIndex, 'type', e.target.value, true)} />
                                                    <Input placeholder="Speed" value={iface.speed} onChange={e => handleBladeNetworkInterfaceChange(0, ifaceIndex, 'speed', e.target.value, true)} />
                                                    <Button variant="ghost" size="icon" onClick={() => removeBladeNetworkInterface(0, ifaceIndex, true)} type="button"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </div>
                                            ))}
                                            <Button variant="outline" size="sm" onClick={() => addBladeNetworkInterface(0, true)} type="button">Add Interface</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {isBladeSelected && !formData.symmetric && (
                        <div className="space-y-4 border p-4 rounded-md">
                            <div><Label>Number of Blades</Label><Input id="bladeCount" type="number" value={formData.bladeCount || 1} onChange={handleBladeCountChange} min={1} /></div>
                            {(formData.blades || []).map((blade: any, index: number) => (
                                <Card key={index}>
                                    <CardHeader><CardTitle>Blade {index + 1}</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div><Label>Name</Label><Input value={blade.name} onChange={e => handleAsymmetricBladeChange(index, 'name', e.target.value)} /></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><Label>CPU Type</Label><Select value={blade.cpuType} onValueChange={(v) => handleAsymmetricBladeChange(index, 'cpuType', v)}><SelectTrigger><SelectValue placeholder="Select CPU..."/></SelectTrigger><SelectContent>{options.cpuTypes.map(t => <SelectItem key={t._id} value={t.name}>{t.name}</SelectItem>)}</SelectContent></Select></div>
                                            <div><Label>CPU Cores</Label><Input type="number" value={blade.cpuCores || ''} onChange={e => handleAsymmetricBladeChange(index, 'cpuCores', Number(e.target.value))} /></div>
                                            <div><Label>Memory (GB)</Label><Input type="number" value={blade.memory || ''} onChange={e => handleAsymmetricBladeChange(index, 'memory', Number(e.target.value))} /></div>
                                            <div><Label>Disk Type</Label><Select value={blade.diskType} onValueChange={(v) => handleAsymmetricBladeChange(index, 'diskType', v)}><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent><SelectItem value="SSD">SSD</SelectItem><SelectItem value="HDD">HDD</SelectItem></SelectContent></Select></div>
                                            <div><Label>Disk Capacity (GB)</Label><Input type="number" value={blade.diskCapacity || ''} onChange={e => handleAsymmetricBladeChange(index, 'diskCapacity', Number(e.target.value))} /></div>
                                        </div>
                                        <div className="flex items-center space-x-2 pt-2">
                                            <Checkbox id={`asymmetric-hasGpu-${index}`} checked={blade.hasGpu || false} onCheckedChange={(checked) => handleAsymmetricBladeChange(index, 'hasGpu', !!checked)} />
                                            <Label htmlFor={`asymmetric-hasGpu-${index}`}>Has GPU?</Label>
                                        </div>
                                        {blade.hasGpu && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><Label>GPU Type</Label><Select value={blade.gpuType} onValueChange={(v) => handleAsymmetricBladeChange(index, 'gpuType', v)}><SelectTrigger><SelectValue placeholder="Select GPU..." /></SelectTrigger><SelectContent>{options.gpuTypes.map(t => <SelectItem key={t._id} value={t.name}>{t.name}</SelectItem>)}</SelectContent></Select></div>
                                                <div><Label>GPU Cores</Label><Input type="number" value={blade.gpuCores || ''} onChange={(e) => handleAsymmetricBladeChange(index, 'gpuCores', Number(e.target.value))} /></div>
                                            </div>
                                        )}
                                        <div>
                                            <Label>Network Interfaces</Label>
                                            <div className="space-y-2 mt-1">
                                                {(blade.networkInterfaces || []).map((iface: any, ifaceIndex: number) => (
                                                    <div key={ifaceIndex} className="grid grid-cols-4 gap-2 items-center">
                                                        <Input placeholder="Name" value={iface.name} onChange={e => handleBladeNetworkInterfaceChange(index, ifaceIndex, 'name', e.target.value, false)} />
                                                        <Input placeholder="Type" value={iface.type} onChange={e => handleBladeNetworkInterfaceChange(index, ifaceIndex, 'type', e.target.value, false)} />
                                                        <Input placeholder="Speed" value={iface.speed} onChange={e => handleBladeNetworkInterfaceChange(index, ifaceIndex, 'speed', e.target.value, false)} />
                                                        <Button variant="ghost" size="icon" onClick={() => removeBladeNetworkInterface(index, ifaceIndex, false)} type="button"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="sm" onClick={() => addBladeNetworkInterface(index, false)} type="button">Add Interface</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
                 <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-lg">Network &amp; Storage</h3>
                     <div>
                        <Label>Network Topology</Label>
                        <div className="grid grid-cols-3 gap-2">
                           <Input data-group="networkTopology" id="managementVLAN" placeholder="Mgmt VLAN" value={formData.networkTopology?.managementVLAN || ''} onChange={handleInputChange}/>
                           <Input data-group="networkTopology" id="storageVLAN" placeholder="Storage VLAN" value={formData.networkTopology?.storageVLAN || ''} onChange={handleInputChange}/>
                           <Input data-group="networkTopology" id="workloadVLAN" placeholder="Workload VLAN" value={formData.networkTopology?.workloadVLAN || ''} onChange={handleInputChange}/>
                        </div>
                    </div>
                     <div>
                        <Label>IP Address Pool</Label>
                        <div className="grid grid-cols-3 gap-2">
                           <Input data-group="ipAddressPool" id="management" placeholder="Mgmt CIDR" value={formData.ipAddressPool?.management || ''} onChange={handleInputChange}/>
                           <Input data-group="ipAddressPool" id="storage" placeholder="Storage CIDR" value={formData.ipAddressPool?.storage || ''} onChange={handleInputChange}/>
                           <Input data-group="ipAddressPool" id="workload" placeholder="Workload CIDR" value={formData.ipAddressPool?.workload || ''} onChange={handleInputChange}/>
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
                     <div><Label>RAID Configuration</Label><Input id="raidConfiguration" value={formData.raidConfiguration || ''} onChange={handleInputChange} placeholder="e.g., RAID 10"/></div>
                      <div>
                        <Label>SSH Keys</Label>
                        <Textarea id="sshKeys" value={formData.sshKeys || ''} onChange={handleInputChange} placeholder="Paste public SSH keys for access..."/>
                    </div>
                </div>
            </div>
        </div>
    );
    
     const renderSummaryAndExport = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <Card>
                    <CardHeader><CardTitle>Generated JSON Specification</CardTitle></CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Textarea value={jsonSpec} onChange={(e) => setJsonSpec(e.target.value)} rows={20} className="font-mono text-xs"/>
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

    
