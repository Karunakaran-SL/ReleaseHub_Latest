
'use client';
import { useState } from 'react';
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
import { useEffect } from 'react';

const initialField = { key: '', value: '' };

export default function CreateSpecificationPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const [customFields, setCustomFields] = useState([{ ...initialField }]);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    const addCustomField = () => {
        setCustomFields([...customFields, { ...initialField }]);
    };

    const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
        const newFields = [...customFields];
        newFields[index][field] = value;
        setCustomFields(newFields);
    };

    const removeCustomField = (index: number) => {
        const newFields = customFields.filter((_, i) => i !== index);
        setCustomFields(newFields);
    };

    // Dummy data for dropdowns
    const hwTypes = [{ id: 'HWType_Rack', name: 'Rack' }, { id: 'HWType_Blade', name: 'Blade' }];
    const vendors = ['Dell EMC', 'HPE', 'Cisco', 'Lenovo'];
    const contractTypes = [{ id: 'ServiceContract_ProSupport_Plus', name: 'ProSupport Plus' }, { id: 'ServiceContract_Foundation_Care', name: 'Foundation Care' }];
    const hypervisors = [{ id: 'Hypervisor_VMWare_ESXi', name: 'VMWare ESXi' }, { id: 'Hypervisor_Microsoft_HyperV', name: 'Microsoft Hyper-V' }];
    const networkCardTypes = [{ id: 'NetworkCard_10GbE_SFP_Plus', name: '10GbE SFP+' }, { id: 'NetworkCard_1GbE_BaseT', name: '1GbE BaseT' }];
    const plugPowerCordTypes = [{ id: 'PowerCord_NEMA_5_15P', name: 'NEMA 5-15P' }, { id: 'PowerCord_C13_C14', name: 'C13 to C14' }];


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Form submission logic will go here
        console.log('Submitting form...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        toast({ title: 'Success', description: 'Specification created successfully (simulation).' });
        router.push('/specifications');
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
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="hw-name">HW Name *</Label>
                                        <Input id="hw-name" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="hw-type">HW Type (Optional)</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Select HW Type" /></SelectTrigger>
                                            <SelectContent>
                                                {hwTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="vendor">Vendor *</Label>
                                        <Select required>
                                            <SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                                            <SelectContent>
                                                {vendors.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="image">Image</Label>
                                        <Input id="image" type="file" />
                                    </div>
                                    <div>
                                        <Label htmlFor="service-contract-type">Service Contract Type</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Select Contract Type" /></SelectTrigger>
                                            <SelectContent>
                                                {contractTypes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="service-doc">Service Doc</Label>
                                        <Input id="service-doc" type="file" />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact-email">Contact Point Email</Label>
                                        <Input id="contact-email" type="email" />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact-phone">Contact Point Phone</Label>
                                        <Input id="contact-phone" type="tel" />
                                    </div>
                                </div>
                                {/* Right Column */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">HW Resources</h3>
                                    <div>
                                        <Label htmlFor="total-cpu">Total CPU *</Label>
                                        <Input id="total-cpu" type="number" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="memory">Memory (GB) *</Label>
                                        <Input id="memory" type="number" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="storage">Storage (GB) *</Label>
                                        <Input id="storage" type="number" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="network-cards">Network Cards type (comma-separated)</Label>
                                        <Input id="network-cards" />
                                    </div>
                                    <div>
                                        <Label htmlFor="plug-power-cord">Plug/Power Cord Type</Label>
                                        <Input id="plug-power-cord" />
                                    </div>
                                    <div>
                                        <Label htmlFor="hypervisor">Hypervisor</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="N/A" /></SelectTrigger>
                                            <SelectContent>
                                                {hypervisors.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mt-6">Custom Fields</h3>
                                        <div className="space-y-2">
                                            {customFields.map((field, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input
                                                        placeholder="Key"
                                                        value={field.key}
                                                        onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                                                    />
                                                    <Input
                                                        placeholder="Value"
                                                        value={field.value}
                                                        onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                                                    />
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
