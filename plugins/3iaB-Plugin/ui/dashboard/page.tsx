'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Network, AlertTriangle, CalendarDays, CheckSquare } from 'lucide-react';

export default function DashboardWidgetWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        getUser().then(setUser);
    }, []);
    return (
        <DashboardLayout user={user}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <DashboardWidget />
            </div>
        </DashboardLayout>
    );
}

function DashboardWidget() {
    return (
        <Card>
            <CardHeader className="pb-2 border-b mb-4">
                <CardTitle className="text-xl font-medium flex items-center gap-2"><Network className="h-5 w-5 text-indigo-500" /> 3iaB Team Health</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col border p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <span className="text-sm text-muted-foreground font-medium flex items-center gap-2"><Network className="h-4 w-4" /> Active Teams</span>
                        <span className="text-3xl font-bold mt-2 text-indigo-600">6</span>
                    </div>
                    <div className="flex flex-col border p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <span className="text-sm text-muted-foreground font-medium flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Upcoming Syncs</span>
                        <span className="text-3xl font-bold mt-2 text-blue-600">3</span>
                    </div>
                    <div className="flex flex-col border p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border-amber-200 bg-amber-50/30">
                        <span className="text-sm text-amber-800 font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Open Risks</span>
                        <span className="text-3xl font-bold mt-2 text-amber-600">2</span>
                    </div>
                    <div className="flex flex-col border p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <span className="text-sm text-muted-foreground font-medium flex items-center gap-2"><CheckSquare className="h-4 w-4" /> Pending Actions</span>
                        <span className="text-3xl font-bold mt-2 text-emerald-600">12</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
