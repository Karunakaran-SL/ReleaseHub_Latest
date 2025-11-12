
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { MultiSelectListBox, type Option as MultiSelectOption } from '@/components/ui/multi-select-list-box';

interface CustomField {
    key: string;
    value: string;
}

interface Option {
    _id: string;
    name: string;
}

interface SpecificationFormData {
    name: string;
    hw_type?: { id: string; name: string; };
    vendor?: { id: string; name: string; };
    total_cpu?: number;
    memory_gb?: number;
    storage_gb?: number;
    hypervisor?: { id: string; name: string; };
    image?: string;
    service_contract_type?: { id: string; name: string; };
    contact_point_email?: string;
    contact_point_phone?: string;
    network_cards?: { id: string; name: string; }[];
    plug_power_cords?: { id: string; name: string; }[];
    custom_fields?: CustomField[];
}

export default function CreateSpecificationPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        hwTypes: [] as Option[],
        vendors: [] as Option[],
        hypervisors: [] as Option[],
        serviceContracts: [] as Option[],
        networkCards: [] as Option[],
        plugPowerCords: [] as Option[],
    });

    const router = useRouter();
    const { toast } = useToast();
    
    const [formState, setFormState] = useState<Partial<SpecificationFormData>>({
        custom_fields: [{ key: '', value: '' }],
        network_cards: [],
        plug_power_cords: [],
    });

    useEffect(() => {
        getUser().then(setUser);
        async function fetchOptions() {
            try {
                const [hwTypesRes, vendorsRes, hypervisorsRes, contractsRes, networkCardsRes, plugPowerCordsRes] = await Promise.all([
                    fetch('/api/settings/specifications/hw-types'),
                    fetch('/api/settings/specifications/vendors'),
                    fetch('/api/settings/specifications/hypervisors'),
                    fetch('/api/documents/service-contracts'),
                    fetch('/api/settings/specifications/network-cards'),
                    fetch('/api/settings/specifications/plug-power-cords'),
                ]);
                setOptions({
                    hwTypes: await hwTypesRes.json(),
                    vendors: await vendorsRes.json(),
                    hypervisors: await hypervisorsRes.json(),
                    serviceContracts: await contractsRes.json(),
                    networkCards: await networkCardsRes.json(),
                    plugPowerCords: await plugPowerCordsRes.json(),
                });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load options for form.' });
            }
        }
        fetchOptions();
    }, [toast]);

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type } = e.target;
        setFormState(prev => ({ ...prev, [id]: type === 'number' ? Number(value) : value }));
    };

    const handleSelectChange = (field: keyof SpecificationFormData, value: string) => {
        const list = field === 'hw_type' ? options.hwTypes 
                     : field === 'vendor' ? options.vendors
                     : field === 'hypervisor' ? options.hypervisors
                     : options.serviceContracts;
        
        const selectedOption = list.find(opt => opt._id === value);
        
        if (selectedOption) {
             setFormState(prev => ({ ...prev, [field]: { id: selectedOption._id, name: selectedOption.name } }));
        }
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
        setFormState(prev => ({ ...prev, custom_fields: [...(prev.custom_fields || []), { key: '', value: '' }]}));
    };

    const removeCustomField = (index: number) => {
        const newFields = (formState.custom_fields || []).filter((_, i) => i !== index);
        setFormState(prev => ({ ...prev, custom_fields: newFields }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const imageName = formState.name?.replace(/\s+/g, '') || 'newSpec';
        const imageUrl = formState.image || `https://picsum.photos/seed/${imageName}/40/40`;

        const payload = {
            ...formState,
            vendor: formState.vendor?.name,
            image: imageUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/specifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create specification');
            }
            toast({ title: 'Success', description: 'Specification created successfully.' });
            router.push('/specifications');
            router.refresh();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };
    
    const renderMultiSelect = (
        fieldName: 'network_cards' | 'plug_power_cords',
        allOptions: Option[]
    ) => {
        const chosenItems = (formState[fieldName] || []) as { id: string; name: string; }[];
        const chosenIds = new Set(chosenItems.map(item => item.id));

        const available: MultiSelectOption[] = allOptions
            .filter(opt => !chosenIds.has(opt._id))
            .map(opt => ({ id: opt._id, label: opt.name }));

        const chosen: MultiSelectOption[] = chosenItems.map(item => ({ id: item.id, label: item.name }));

        const moveItems = (ids: string[], source: MultiSelectOption[], dest: MultiSelectOption[]) => {
            const itemsToMove = source.filter(item => ids.includes(item.id));
            const newDest = [...dest, ...itemsToMove];
            handleMultiSelectChange(fieldName, newDest.map(i => ({id: i.id, name: i.label})));
        };

        return (
            <MultiSelectListBox
                available={available}
                chosen={chosen}
                onMoveToChosen={(ids) => moveItems(ids, available, chosen)}
                onMoveToAvailable={(ids) => {
                    const newChosen = chosen.filter(item => !ids.includes(item.id));
                    handleMultiSelectChange(fieldName, newChosen.map(i => ({id: i.id, name: i.label})))
                }}
                onMoveAllToChosen={() => handleMultiSelectChange(fieldName, available.map(i => ({id: i.id, name: i.label})))}
                onMoveAllToAvailable={() => handleMultiSelectChange(fieldName, [])}
            />
        );
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Specification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">HW Name *</Label>
                                        <Input id="name" onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="hw_type">HW Type *</Label>
                                        <Select onValueChange={(value) => handleSelectChange('hw_type', value)} required>
                                            <SelectTrigger><SelectValue placeholder="Select HW Type" /></SelectTrigger>
                                            <SelectContent>
                                                {options.hwTypes.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="vendor">Vendor *</Label>
                                        <Select onValueChange={(value) => handleSelectChange('vendor', value)} required>
                                            <SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                                            <SelectContent>
                                                {options.vendors.map(v => <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="image">Image URL</Label>
                                        <Input id="image" onChange={handleInputChange} placeholder="https://picsum.photos/seed/..." />
                                    </div>
                                    <div>
                                        <Label htmlFor="service_contract_type">Service Contract Type</Label>
                                        <Select onValueChange={(value) => handleSelectChange('service_contract_type', value)}>
                                            <SelectTrigger><SelectValue placeholder="Select Contract Type" /></SelectTrigger>
                                            <SelectContent>
                                                {options.serviceContracts.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_point_email">Contact Point Email</Label>
                                        <Input id="contact_point_email" type="email" onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_point_phone">Contact Point Phone</Label>
                                        <Input id="contact_point_phone" type="tel" onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">HW Resources</h3>
                                    <div>
                                        <Label htmlFor="total_cpu">Total CPU *</Label>
                                        <Input id="total_cpu" type="number" onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="memory_gb">Memory (GB) *</Label>
                                        <Input id="memory_gb" type="number" onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="storage_gb">Storage (GB) *</Label>
                                        <Input id="storage_gb" type="number" onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <Label>Network Cards type</Label>
                                        {renderMultiSelect('network_cards', options.networkCards)}
                                    </div>
                                    <div>
                                        <Label>Plug/Power Cord Type</Label>
                                        {renderMultiSelect('plug_power_cords', options.plugPowerCords)}
                                    </div>
                                    <div>
                                        <Label htmlFor="hypervisor">Hypervisor</Label>
                                        <Select onValueChange={(value) => handleSelectChange('hypervisor', value)}>
                                            <SelectTrigger><SelectValue placeholder="N/A" /></SelectTrigger>
                                            <SelectContent>
                                                {options.hypervisors.map(h => <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mt-6">Custom Fields</h3>
                                        <div className="space-y-2">
                                            {formState.custom_fields?.map((field, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input placeholder="Key" value={field.key} onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)} />
                                                    <Input placeholder="Value" value={field.value} onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)} />
                                                    <Button variant="ghost" size="icon" onClick={() => removeCustomField(index)} type="button">
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <Button variant="link" size="sm" onClick={addCustomField} type="button" className="mt-2 px-0">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            ADD CUSTOM FIELD
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()}>CANCEL</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                CREATE
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </DashboardLayout>
    );
}

    