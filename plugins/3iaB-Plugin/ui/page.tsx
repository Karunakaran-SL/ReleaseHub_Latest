'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings, Shield, Bell, Plus, Users, Trash } from 'lucide-react';

export default function SettingsManagerWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        getUser().then(setUser);
    }, []);
    return (
        <DashboardLayout user={user}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <SettingsManager />
            </div>
        </DashboardLayout>
    );
}

function SettingsManager() {
    const { toast } = useToast();
    const [roles, setRoles] = useState<string[]>([]);
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        fetch('/api/plugins/3iab-product-management?module=settings')
            .then(res => res.json())
            .then(res => {
                if (res.data && res.data.roles) setRoles(res.data.roles);
            });
    }, []);

    const addRole = () => {
        if (!newRole || roles.includes(newRole)) return;
        setRoles([...roles, newRole]);
        setNewRole('');
    };

    const removeRole = (r: string) => {
        setRoles(roles.filter(x => x !== r));
    };

    const saveSettings = async () => {
        await fetch('/api/plugins/3iab-product-management?module=settings', {
            method: 'POST',
            body: JSON.stringify({ id: 'global', roles })
        });
        toast({ title: "Saved", description: "3iaB configurations updated." });
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight">3iaB Settings</h3>
                    <p className="text-sm text-muted-foreground">Manage global variables and defined team roles.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={saveSettings}>
                    Save Configuration
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-slate-500" /> Custom Team Roles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <p className="text-sm text-muted-foreground mb-4">Define the custom roles allowed in your 3 in a box teams. These will be available when composing a new team.</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {roles.map(r => (
                                <Badge key={r} variant="secondary" className="px-3 py-1 flex items-center gap-2">
                                    {r}
                                    <Trash className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-red-500" onClick={() => removeRole(r)} />
                                </Badge>
                            ))}
                            {roles.length === 0 && <span className="text-sm text-muted-foreground">No roles defined.</span>}
                        </div>
                        <div className="flex items-center gap-2 max-w-sm">
                            <Input placeholder="e.g. Release Manager" value={newRole} onChange={e => setNewRole(e.target.value)} onKeyDown={e => e.key === 'Enter' && addRole()} />
                            <Button variant="secondary" onClick={addRole}><Plus className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
