'use client';

import React from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function DashboardWidgetWrapper() {
    const mockUser: User = { _id: "65b9", username: "admin", email: "admin@corp.com", roles: ["admin"], role: "admin" };
    return (
        <DashboardLayout user={mockUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <DashboardWidget />
            </div>
        </DashboardLayout>
    );
}

function DashboardWidget() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-medium tracking-tight">Agile Platform Health</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex flex-col border p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <span className="text-sm text-muted-foreground font-medium">Sprint Predictability</span>
                        <span className="text-2xl font-bold mt-1 text-emerald-600">85%</span>
                    </div>
                    <div className="flex flex-col border p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <span className="text-sm text-muted-foreground font-medium">Active Epics</span>
                        <span className="text-2xl font-bold mt-1 text-blue-600">4</span>
                    </div>
                    <div className="flex flex-col border p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <span className="text-sm text-muted-foreground font-medium">Escalated Risks</span>
                        <span className="text-2xl font-bold mt-1 text-red-600">1</span>
                    </div>
                    <div className="flex flex-col border p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <span className="text-sm text-muted-foreground font-medium">Pending Features</span>
                        <span className="text-2xl font-bold mt-1 text-purple-600">8</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
