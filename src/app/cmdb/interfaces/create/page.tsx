
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, CmdbInterface, CmdbInterfaceType, CmdbComponent, CmdbApplication } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type NewInterfaceFormState = Partial<Omit<CmdbInterface, '_id' | 'created_at' | 'updated_at'>>;

export default function CreateInterfacePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [formState, setFormState] = useState<NewInterfaceFormState>({
        security: { internal: { secure: false, authentication: false }, external: { secure: false, authentication: false }},
        additional_docs: [],
        custom_fields: []
    });
    const router = useRouter();
    const { toast } = useToast();

    const [interfaceTypes, setInterfaceTypes] = useState<CmdbInterfaceType[]>([]);
    const [sourceComponents, setSourceComponents] = useState<(CmdbComponent | CmdbApplication)[]>([]);

    useEffect(() => {
        getUser().then(setUser);
        async function fetchDeps() {
            try {
                const [typesRes, componentsRes, applicationsRes] = await Promise.all([
                    fetch('/api/cmdb/interface-types'),
                    fetch('/api/cmdb/components'),
                    fetch('/api/cmdb/applications')
                ]);
                if(typesRes.ok) setInterfaceTypes(await typesRes.json());
                
                const components = componentsRes.ok ? await componentsRes.json() : [];
                const applications = applicationsRes.ok ? await applicationsRes.json() : [];
                setSourceComponents([...components, ...applications]);

            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load dependencies.'});
            }
        }
        fetchDeps();
    }, [toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (field: 'type' | 'source', value: string) => {
        const list = field === 'type' ? interfaceTypes : sourceComponents;
        const selected = list.find(item => item.id === value);
        if (selected) {
            setFormState(prev => ({...prev, [field]: {id: selected.id, name: selected.name}}));
        }
    };

    const handleSecurityChange = (scope: 'internal' | 'external', field: 'secure' | 'authentication', checked: boolean) => {
        setFormState(prev => ({
            ...prev,
            security: {
                ...prev.security,
                [scope]: { ...prev.security![scope], [field]: checked }
            }
        }));
    };
    
    const handleDocChange = (index: number, field: 'name' | 'url', value: string) => {
        const updatedDocs = [...(formState.additional_docs || [])];
        updatedDocs[index] = { ...updatedDocs[index], id: updatedDocs[index]?.id || `doc-${index}`, key: updatedDocs[index]?.key || `doc-${index}`, [field]: value };
        setFormState(prev => ({ ...prev, additional_docs: updatedDocs }));
    };

    const addDoc = () => setFormState(prev => ({ ...prev, additional_docs: [...(prev.additional_docs || []), { id: '', key: '', name: '', url: '' }]}));
    const removeDoc = (index: number) => setFormState(prev => ({ ...prev, additional_docs: (formState.additional_docs || []).filter((_, i) => i !== index) }));

    const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
        const updatedFields = [...(formState.custom_fields || [])];
        updatedFields[index] = { ...updatedFields[index], [field]: value };
        setFormState(prev => ({ ...prev, custom_fields: updatedFields }));
    };
    const addCustomField = () => setFormState(prev => ({ ...prev, custom_fields: [...(prev.custom_fields || []), { key: '', value: '' }]}));
    const removeCustomField = (index: number) => setFormState(prev => ({...prev, custom_fields: (formState.custom_fields || []).filter((_,i) => i !== index)}));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: Partial<CmdbInterface> = {
            ...formState,
            id: `Interface_${formState.name?.replace(/\s+/g, '_')}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        try {
            const response = await fetch('/api/cmdb/interfaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast({ title: 'Success', description: 'Interface registered successfully.' });
                router.push('/cmdb/interfaces');
                router.refresh();
            } else {
                const errorData = await response.json();
                toast({ variant: 'destructive', title: 'Error', description: errorData.message || 'Failed to register interface.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Register a New Interface</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Basic Information</AccordionTrigger>
                                    <AccordionContent className="p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><Label htmlFor="name">Interface Name *</Label><Input id="name" value={formState.name || ''} onChange={handleInputChange} required /></div>
                                            <div><Label htmlFor="type">Interface Type *</Label>
                                                <Select onValueChange={(value) => handleSelectChange('type', value)} required><SelectTrigger><SelectValue placeholder="Select a type..." /></SelectTrigger>
                                                    <SelectContent>{interfaceTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                            <div><Label htmlFor="version">Version *</Label><Input id="version" value={formState.version || ''} onChange={handleInputChange} required /></div>
                                            <div><Label htmlFor="source">Source Component/Application *</Label>
                                                <Select onValueChange={(value) => handleSelectChange('source', value)} required><SelectTrigger><SelectValue placeholder="Select a source..." /></SelectTrigger>
                                                    <SelectContent>{sourceComponents.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div><Label htmlFor="description">Description</Label><Textarea id="description" value={formState.description || ''} onChange={handleInputChange} /></div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Ownership & Documentation</AccordionTrigger>
                                    <AccordionContent className="p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><Label htmlFor="owner_name">Owner Name *</Label><Input id="owner_name" value={formState.owner_name || ''} onChange={handleInputChange} required /></div>
                                            <div><Label htmlFor="owner_email">Owner Email *</Label><Input id="owner_email" type="email" value={formState.owner_email || ''} onChange={handleInputChange} required /></div>
                                        </div>
                                        <div><Label htmlFor="documentation">Main Documentation URL</Label><Input id="documentation" type="url" value={formState.documentation || ''} onChange={handleInputChange} placeholder="https://docs.example.com"/></div>
                                        <div><Label>Additional Documents</Label>
                                            <div className="space-y-2">
                                                {(formState.additional_docs || []).map((doc, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <Input placeholder="Document Name" value={doc.name} onChange={e => handleDocChange(index, 'name', e.target.value)} />
                                                        <Input placeholder="URL" type="url" value={doc.url} onChange={e => handleDocChange(index, 'url', e.target.value)} />
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeDoc(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button type="button" variant="outline" size="sm" onClick={addDoc} className="mt-2"><PlusCircle className="mr-2 h-4 w-4" /> Add Document</Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>Security</AccordionTrigger>
                                    <AccordionContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card><CardHeader><CardTitle className="text-lg">Internal Security</CardTitle></CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center space-x-2"><Checkbox id="internal-secure" checked={formState.security?.internal?.secure} onCheckedChange={(c) => handleSecurityChange('internal', 'secure', !!c)} /><Label htmlFor="internal-secure">Is Secure</Label></div>
                                                <div className="flex items-center space-x-2"><Checkbox id="internal-auth" checked={formState.security?.internal?.authentication} onCheckedChange={(c) => handleSecurityChange('internal', 'authentication', !!c)} /><Label htmlFor="internal-auth">Needs Authentication</Label></div>
                                            </CardContent>
                                        </Card>
                                        <Card><CardHeader><CardTitle className="text-lg">External Security</CardTitle></CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center space-x-2"><Checkbox id="external-secure" checked={formState.security?.external?.secure} onCheckedChange={(c) => handleSecurityChange('external', 'secure', !!c)} /><Label htmlFor="external-secure">Is Secure</Label></div>
                                                <div className="flex items-center space-x-2"><Checkbox id="external-auth" checked={formState.security?.external?.authentication} onCheckedChange={(c) => handleSecurityChange('external', 'authentication', !!c)} /><Label htmlFor="external-auth">Needs Authentication</Label></div>
                                            </CardContent>
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger>Custom Fields</AccordionTrigger>
                                    <AccordionContent className="p-4 space-y-4">
                                         <div className="space-y-2">
                                            {(formState.custom_fields || []).map((field, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input placeholder="Key" value={field.key} onChange={e => handleCustomFieldChange(index, 'key', e.target.value)} />
                                                    <Input placeholder="Value" value={field.value} onChange={e => handleCustomFieldChange(index, 'value', e.target.value)} />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomField(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </div>
                                            ))}
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={addCustomField} className="mt-2"><PlusCircle className="mr-2 h-4 w-4" /> Add Custom Field</Button>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()}>CANCEL</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                REGISTER INTERFACE
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </DashboardLayout>
    );
}
