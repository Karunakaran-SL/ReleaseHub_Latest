'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditDevEnvPage() {
    const router = useRouter();
    useEffect(() => {
        // Placeholder logic
        router.push('/platform-engineering/development-environments');
    }, [router]);
    return null;
}
