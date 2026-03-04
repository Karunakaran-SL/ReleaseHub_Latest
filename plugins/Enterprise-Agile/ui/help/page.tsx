'use client';

import React from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function HelpWidgetWrapper() {
    const mockUser: User = { _id: "65b9", username: "admin", email: "admin@corp.com", roles: ["admin"], role: "admin" };
    return (
        <DashboardLayout user={mockUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <HelpWidget />
            </div>
        </DashboardLayout>
    );
}

function HelpWidget() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Enterprise Agile Platform Help</h2>
            <p className="text-muted-foreground">Learn how to configure themes, epics, and execution processes.</p>

            <Card>
                <CardHeader>
                    <CardTitle>Strategy Hierarchy</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Strategic Themes sit at the top, defining macro-level organizational objectives bounding budget and timeframe. Lean Business Cases power Strategic Epics beneath them to calculate expected Return on Investment (ROI) and cost of delay.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>WSJF and INVEST Enforcement</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Features require WSJF scoring (Business Value, Time Criticality, Risk Reduction, Job Size) before committing to a PI. User Stories undergo INVEST validation, checking for Acceptance Criteria and strict Fibonacci Story points.</p>
                </CardContent>
            </Card>
        </div>
    );
}
