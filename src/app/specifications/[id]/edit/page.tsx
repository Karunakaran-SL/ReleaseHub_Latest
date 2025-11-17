

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
import type { User, Specification } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { PlusCircle, Trash2, Loader2, Server, Cpu, MemoryStick, Database } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelectListBox, type Option as MultiSelectOption } from '@/components/ui/multi-select-list-box';
import { DiagramDisplay } from '../../_components/diagram-display';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
    });

    useEffect(() => {
        getUser().then(setUser);
        if (!id) return;
        
        async function fetchData() {
            setLoading(true);
            try {
                const [specRes, hwTypesRes, vendorsRes, hypervisorsRes, contractsRes, networkCardsRes, plugPowerCordsRes] = await Promise.all([
                    fetch(`/api/specifications/${id}`),
                    fetch('/api/settings/specifications/hw-types'),
                    fetch('/api/settings/specifications/vendors'),
                    fetch('/api/settings/specifications/hypervisors'),
                    fetch('/api/documents/service-contracts'),
                    fetch('/api/settings/specifications/network-cards'),
                    fetch('/api/settings/specifications/plug-power-cords'),
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
    
    const handleSelectChange = (field: keyof Specification | string, value: string) => {
        const listMap: Record<string, Option[]> = {
            'hw_type': options.hwTypes,
            'vendor': options.vendors,
            'hypervisor': options.hypervisors,
            'service_contract_type': options.serviceContracts
        }
        
        const list = listMap[field as string];
        const selectedOption = list.find(opt => opt._id === value);
        
        if (field === 'vendor') {
            setFormState((prev: any) => ({...prev, vendor: value}));
        } else if (selectedOption) {
            setFormState((prev: any) => ({ ...prev, [field]: { id: selectedOption._id, name: selectedOption.name } }));
        }
    };
    
    const handleBladeCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const count = parseInt(e.target.value, 10);
        setFormState((prev: any) => ({ ...prev, bladeCount: count, blades: Array.from({length: count}).map((_, i) => prev.blades?.[i] || {name: `Blade ${i+1}`}) }));
    }

    const handleAsymmetricBladeChange = (index: number, field: string, value: any) => {
        const newBlades = [...(formState.blades || [])];
        newBlades[index] = {...newBlades[index], [field]: value };
        setFormState((prev: any) => ({...prev, blades: newBlades}));
    }

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
                                        {isBladeSelected ? (
                                             <div className="space-y-4">
                                                <RadioGroup onValueChange={(v) => setFormState(p => ({...p, symmetric: v === 'true'}))} value={String(formState.symmetric)} className="mt-2 space-y-1">
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="true" id="sym1" /><Label htmlFor="sym1" className="font-normal">Symmetric</Label></div>
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="false" id="sym2" /><Label htmlFor="sym2" className="font-normal">Asymmetric</Label></div>
                                                </RadioGroup>
                                            </div>
                                        ): (
                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md">
                                                <div><Label>Total CPU *</Label><Input id="total_cpu" type="number" value={formState.total_cpu || ''} onChange={handleInputChange} required /></div>
                                                <div><Label>Memory (GB) *</Label><Input id="memory_gb" type="number" value={formState.memory_gb || ''} onChange={handleInputChange} required /></div>
                                                <div><Label>Total Storage (GB) *</Label><Input id="storage_gb" type="number" value={formState.storage_gb || ''} onChange={handleInputChange} required /></div>
                                             </div>
                                        )}
                                        {isBladeSelected && formState.symmetric && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md">
                                                <div><Label># of Blades</Label><Input id="bladeCount" type="number" value={formState.bladeCount || 1} onChange={handleBladeCountChange} min={1} /></div>
                                                <div><Label>CPU (per blade)</Label><Input id="cpuType" value={formState.cpuType || ''} onChange={handleInputChange} /></div>
                                                <div><Label>Memory (GB per blade)</Label><Input id="memoryPerBlade" type="number" value={formState.memoryPerBlade || ''} onChange={handleInputChange} /></div>
                                            </div>
                                        )}
                                         {isBladeSelected && !formState.symmetric && (
                                            <div className="space-y-4 border p-4 rounded-md">
                                                {formState.blades?.map((blade: any, index: number) => (
                                                    <Card key={index}>
                                                        <CardHeader><CardTitle>Blade {index + 1}</CardTitle></CardHeader>
                                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div><Label>Blade Name</Label><Input value={blade.name} onChange={e => handleAsymmetricBladeChange(index, 'name', e.target.value)} /></div>
                                                            <div><Label>CPU Type</Label><Input value={blade.cpuType || ''} onChange={e => handleAsymmetricBladeChange(index, 'cpuType', e.target.value)} /></div>
                                                            <div><Label>Memory (GB)</Label><Input type="number" value={blade.memoryPerBlade || ''} onChange={e => handleAsymmetricBladeChange(index, 'memoryPerBlade', Number(e.target.value))} /></div>
                                                            <div><Label>Storage (GB)</Label><Input type="number" value={blade.storageCapacity || ''} onChange={e => handleAsymmetricBladeChange(index, 'storageCapacity', Number(e.target.value))} /></div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-lg">Connectivity</h3>
                                    <div>
                                        <Label>Network Cards</Label>
                                        <MultiSelectListBox
                                            available={options.networkCards.filter(opt => !(formState.network_cards || []).some((c:any) => c.id === opt._id)).map(o => ({id: o._id, label: o.name}))}
                                            chosen={(formState.network_cards || []).map((c:any) => ({id: c.id, name: c.name})).map((o: any) => ({id: o.id, label: o.name}))}
                                            onMoveToChosen={(ids) => handleMultiSelectChange('network_cards', [...(formState.network_cards || []), ...ids.map(id => ({id, name: options.networkCards.find(o => o._id === id)?.name || ''}))] )}
                                            onMoveToAvailable={(ids) => handleMultiSelectChange('network_cards', (formState.network_cards || []).filter((c:any) => !ids.includes(c.id)))}
                                            onMoveAllToChosen={() => handleMultiSelectChange('network_cards', options.networkCards.map(o => ({id: o._id, name: o.name})))}
                                            onMoveAllToAvailable={() => handleMultiSelectChange('network_cards', [])}
                                        />
                                    </div>
                                    <div>
                                        <Label>Power Cords</Label>
                                        <MultiSelectListBox
                                            available={options.plugPowerCords.filter(opt => !(formState.plug_power_cords || []).some((c:any) => c.id === opt._id)).map(o => ({id: o._id, label: o.name}))}
                                            chosen={(formState.plug_power_cords || []).map((c:any) => ({id: c.id, name: c.name})).map((o: any) => ({id: o.id, label: o.name}))}
                                            onMoveToChosen={(ids) => handleMultiSelectChange('plug_power_cords', [...(formState.plug_power_cords || []), ...ids.map(id => ({id, name: options.plugPowerCords.find(o => o._id === id)?.name || ''}))] )}
                                            onMoveToAvailable={(ids) => handleMultiSelectChange('plug_power_cords', (formState.plug_power_cords || []).filter((c:any) => !ids.includes(c.id)))}
                                            onMoveAllToChosen={() => handleMultiSelectChange('plug_power_cords', options.plugPowerCords.map(o => ({id: o._id, name: o.name})))}
                                            onMoveAllToAvailable={() => handleMultiSelectChange('plug_power_cords', [])}
                                        />
                                    </div>
                                    <div>
                                        <Label>Hypervisor</Label>
                                        <Select value={formState.hypervisor?.id} onValueChange={(value) => handleSelectChange('hypervisor', value)}>
                                            <SelectTrigger><SelectValue placeholder="N/A" /></SelectTrigger>
                                            <SelectContent>{options.hypervisors.map(h => <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
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
