'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from './dashboard-layout';
import { Loader2 } from 'lucide-react';
import { getUser } from '@/lib/auth';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new dashboard page
    router.replace('/dashboard');
  }, [router]);

  return (
    <DashboardLayout user={null}>
        <main className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Redirecting to your dashboard...</span>
            </div>
        </main>
    </DashboardLayout>
  );
}
