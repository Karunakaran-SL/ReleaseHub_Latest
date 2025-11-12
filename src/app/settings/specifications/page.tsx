
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import ReferenceTable from './_components/reference-table';

export default function SpecificationsSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    const tables = [
        { title: 'HW Types', apiEndpoint: 'hw-types' },
        { title: 'Vendors', apiEndpoint: 'vendors' },
        { title: 'Plug/Power Cord Types', apiEndpoint: 'plug-power-cords' },
        { title: 'Network Card Types', apiEndpoint: 'network-cards' },
        { title: 'Hypervisors', apiEndpoint: 'hypervisors' },
    ];

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Specification Settings</h1>
                    <p className="text-muted-foreground">Manage reference data for hardware specifications.</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {tables.map(table => (
                        <ReferenceTable key={table.apiEndpoint} title={table.title} apiEndpoint={table.apiEndpoint} />
                    ))}
                </div>
            </main>
        </DashboardLayout>
    );
}
