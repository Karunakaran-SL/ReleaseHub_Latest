'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HelpCircle, Network, CalendarDays, CheckSquare, ShieldAlert } from 'lucide-react';

export default function HelpWidgetWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        getUser().then(setUser);
    }, []);
    return (
        <DashboardLayout user={user}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <HelpWidget />
            </div>
        </DashboardLayout>
    );
}

function HelpWidget() {
    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-3 border-b mb-6 pb-4">
                <div className="h-10 w-10 bg-indigo-100 text-indigo-700 flex items-center justify-center rounded-lg border border-indigo-200">
                    <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">3iaB Platform Help</h2>
                    <p className="text-muted-foreground">Documentation for cross-functional product management.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Network className="h-5 w-5 text-indigo-500" /> 3 in a Box Dynamics</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        A "3 in a Box" (3iaB) team usually consists of a Product Manager, an Architect, and a System Engineer driving a specific Product Domain.
                        Users can hold multiple roles across different teams. The system maps these dependencies automatically to expose potential overlapping bottlenecks.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-blue-500" /> MoM & Agenda Locking</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Teams schedule upcoming syncs by adding Agenda items to future weeks. During the sync, Minutes of Meeting (MoMs) are captured.
                        Once a MoM is "Closed and Locked", it creates an immutable audit trail.
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CheckSquare className="h-5 w-5 text-emerald-500" /> Actions Tracker</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Actions are explicitly linked to the MoMs where they were generated, providing a trace-back mechanism.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-rose-500" /> Risk Registry</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">A 5x5 Probability/Impact matrix automatically calculates an Exposure Score, flagging risks {'>'}15 for executive escalation.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
