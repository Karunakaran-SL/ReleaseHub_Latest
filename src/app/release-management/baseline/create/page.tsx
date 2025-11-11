
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User } from '@/lib/definitions';

export default function CreateBaselinePage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
             <main className="flex-1 p-6 md:p-10">
                 <h1 className="text-3xl font-bold">Create New Baseline - Placeholder</h1>
            </main>
        </DashboardLayout>
    );
}

    