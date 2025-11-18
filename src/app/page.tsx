'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new dashboard page
    router.replace('/dashboard');
  }, [router]);

  return null; // Render nothing on this page, as it will redirect
}
