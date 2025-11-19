// This file will be created by the wizard logic. For now, it's a placeholder.
// The actual wizard logic will be implemented in a subsequent step.
// For now, this just redirects to the main page.
'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateDevEnvPage() {
    const router = useRouter();
    useEffect(() => {
        // Placeholder logic
        router.push('/platform-engineering/development-environments');
    }, [router]);
    return null;
}
