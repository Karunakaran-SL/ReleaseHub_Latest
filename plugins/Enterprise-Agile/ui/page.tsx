'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings, Users, Database, Shield } from 'lucide-react';
import type { User } from '@/lib/definitions';

function SettingsManager() {
    const { toast } = useToast();
    const [roles] = useState([
        { id: 'R-01', name: 'Portfolio Manager', accesses: ['Strategy', 'Intelligence'] },
        { id: 'R-02', name: 'Product Manager', accesses: ['Strategy', 'Execution', 'Boards'] },
        { id: 'R-03', name: 'Scrum Master', accesses: ['Execution', 'Boards'] },
        { id: 'R-04', name: 'Developer', accesses: ['Execution', 'Boards'] },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-medium">Platform Administration</h3>
                    <p className="text-sm text-muted-foreground">Manage RBAC matrices, Quarter Limits, and General Defaults.</p>
                </div>
                <Button variant="outline" onClick={() => toast({ title: "Configuration Saved", description: "Successfully updated enterprise settings." })}>
                    Save Configuration
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-slate-500" /> Platform Defaults</CardTitle>
                        <CardDescription>Global variables across the Enterprise execution platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span>Default Sprint Cadence</span>
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 rounded">2 Weeks</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span>Risk Escalation Threshold</span>
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 rounded">15 points</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span>Feature Prioritization</span>
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 rounded">WSJF v2.0</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Auto-Close Tasks on Subtask Done</span>
                            <Badge variant="default">Enabled</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-blue-500" /> Roles & Permissions (SEC-1)</CardTitle>
                        <CardDescription>Enterprise Agile RBAC Definitions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {roles.map(r => (
                            <div key={r.id} className="flex justify-between items-start border-b pb-3 last:border-0">
                                <div>
                                    <h4 className="font-medium text-sm text-foreground">{r.name}</h4>
                                    <div className="flex gap-1 mt-1 flex-wrap">
                                        {r.accesses.map(a => <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Global user simulation because we fetch client-side in plugins
const mockUser: User = { _id: "65b9", username: "admin", email: "admin@corp.com", roles: ["admin"], role: "admin" }

export default function Page() {
    return (
        <DashboardLayout user={mockUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <SettingsManager />
            </div>
        </DashboardLayout>
    );
}
