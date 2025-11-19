
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, CmdbTenant } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Rocket } from 'lucide-react';
import { DependencyDialog } from './_components/dependency-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Dependency } from './_components/dependency-dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SdkGeneratorPage() {
    const [user, setUser] = useState<User | null>(null);
    const [tenants, setTenants] = useState<CmdbTenant[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<CmdbTenant | null>(null);
    const [projectName, setProjectName] = useState('demo');
    const [group, setGroup] = useState('com.example');
    const [dependencies, setDependencies] = useState<Dependency[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
        async function fetchTenants() {
            try {
                const res = await fetch('/api/cmdb/tenants');
                if (res.ok) {
                    setTenants(await res.json());
                }
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch tenants.' });
            }
        }
        fetchTenants();
    }, [toast]);

    const handleTenantChange = (tenantId: string) => {
        const tenant = tenants.find(t => t.id === tenantId);
        if (tenant) {
            setSelectedTenant(tenant);
            setProjectName(tenant.name.toLowerCase().replace(/\s+/g, '-'));
            setGroup(`com.example.${tenant.id.toLowerCase()}`);
        }
    };

    const handleGenerate = () => {
        toast({
            title: 'Generating Project...',
            description: `A zip file for ${projectName} would be created here.`,
        });
    };

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8 flex items-center gap-4">
                     <Rocket className="h-10 w-10 text-primary"/>
                    <div>
                        <h1 className="text-3xl font-bold">SDK Project Initializer</h1>
                        <p className="text-muted-foreground">Bootstrap your tenant-aware application with pre-configured dependencies.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8">
                         <Card>
                            <CardHeader>
                                <CardTitle>Tenant</CardTitle>
                                <CardDescription>Select the tenant this project will be for.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Select onValueChange={handleTenantChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a tenant..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tenants.map(tenant => (
                                            <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="group">Group</Label>
                                        <Input id="group" value={group} onChange={e => setGroup(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="artifact">Artifact</Label>
                                        <Input id="artifact" value={projectName} onChange={e => setProjectName(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={projectName} onChange={e => setProjectName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input id="description" placeholder={`Demo project for ${selectedTenant?.name || 'Spring Boot'}`} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="package-name">Package name</Label>
                                    <Input id="package-name" value={`${group}.${projectName}`} disabled />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Language & Framework</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 <div>
                                    <Label className="mb-2 block">Language</Label>
                                    <RadioGroup defaultValue="java" className="flex gap-4">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="java" id="java" /><Label htmlFor="java">Java</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="kotlin" id="kotlin" /><Label htmlFor="kotlin">Kotlin</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="groovy" id="groovy" /><Label htmlFor="groovy">Groovy</Label></div>
                                    </RadioGroup>
                                </div>
                                <div>
                                    <Label className="mb-2 block">Framework Version</Label>
                                    <RadioGroup defaultValue="3.5.7" className="flex flex-wrap gap-4">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="4.0.0-snapshot" id="v4s" /><Label htmlFor="v4s">4.0.0 (SNAPSHOT)</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="3.5.7" id="v357" /><Label htmlFor="v357">3.5.7</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="3.4.11" id="v3411" /><Label htmlFor="v3411">3.4.11</Label></div>
                                    </RadioGroup>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Dependencies</CardTitle>
                                <DependencyDialog onAddDependencies={setDependencies} />
                            </CardHeader>
                            <CardContent>
                                {dependencies.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">No dependencies selected.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {dependencies.map(dep => (
                                            <Badge key={dep.id} variant="secondary">{dep.name}</Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <Button size="lg" onClick={handleGenerate}>
                        <Rocket className="mr-2 h-5 w-5" />
                        Generate Project
                    </Button>
                </div>
            </main>
        </DashboardLayout>
    );
}
