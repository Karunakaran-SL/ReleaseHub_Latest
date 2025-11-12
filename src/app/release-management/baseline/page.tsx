
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import type { User, Baseline } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import DashboardLayout from '@/app/dashboard-layout';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-200 text-gray-800',
    VALIDATING: 'bg-blue-200 text-blue-800',
    VALIDATED: 'bg-green-200 text-green-800',
    RELEASED: 'bg-purple-200 text-purple-800',
    ARCHIVED: 'bg-red-200 text-red-800',
    REJECTED: 'bg-red-300 text-red-900',
};

// Helper for semantic version comparison
function compareVersions(v1: string, v2: string) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    const len = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < len; i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
    }
    return 0;
}


export default function BaselineListPage() {
  const [baselines, setBaselines] = useState<Baseline[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getUser().then(setUser);
    async function fetchBaselines() {
        setLoading(true);
        try {
            const response = await fetch('/api/baselines');
            if (response.ok) {
                setBaselines(await response.json());
            } else {
                toast({ variant: "destructive", title: "Error", description: "Failed to fetch baselines." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "An error occurred while fetching baselines." });
        } finally {
            setLoading(false);
        }
    }
    fetchBaselines();
  }, [toast]);
  
  const latestReleasedIds = useMemo(() => {
    const latest: { [productId: string]: Baseline } = {};
    
    baselines
      .filter(b => b.status === 'RELEASED')
      .forEach(b => {
        if (!latest[b.product.id] || compareVersions(b.product.version, latest[b.product.id].product.version) > 0) {
          latest[b.product.id] = b;
        }
      });
      
    return new Set(Object.values(latest).map(b => b._id));
  }, [baselines]);


  return (
    <DashboardLayout user={user}>
      <main className="flex-1 space-y-8 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Baselines</h1>
          <Button asChild>
            <Link href="/release-management/baseline/create">CREATE NEW BASELINE</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Baseline ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : baselines.length > 0 ? (
                    baselines.map(baseline => (
                        <TableRow 
                            key={baseline._id}
                            className={cn(latestReleasedIds.has(baseline._id) && 'bg-green-100 dark:bg-green-900/30')}
                        >
                            <TableCell className="font-mono text-xs">{baseline._id}</TableCell>
                            <TableCell>{baseline.product.name}</TableCell>
                            <TableCell>{baseline.product.version}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className={statusColors[baseline.status]}>{baseline.status}</Badge>
                            </TableCell>
                            <TableCell>{format(new Date(baseline.created_at), 'yyyy-MM-dd HH:mm')}</TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/release-management/baseline/${baseline._id}/summary`}>View</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No baselines found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}
