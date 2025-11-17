'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, License } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  active: 'bg-green-200 text-green-800',
  expired: 'bg-red-200 text-red-800',
  deprecated: 'bg-yellow-200 text-yellow-800',
};

export default function LicenseUsagePage() {
  const [user, setUser] = useState<User | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getUser().then(setUser);
    async function fetchLicenses() {
      setLoading(true);
      try {
        const response = await fetch('/api/licenses/usage');
        if (!response.ok) throw new Error('Failed to fetch license usage');
        const data = await response.json();
        setLicenses(data);
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
        setLoading(false);
      }
    }
    fetchLicenses();
  }, [toast]);

  return (
    <DashboardLayout user={user}>
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-6">License Usage</h1>
        <Card>
          <CardHeader>
            <CardTitle>License Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : licenses.length > 0 ? (
                  licenses.map((license) => (
                    <TableRow key={license._id}>
                      <TableCell className="font-medium">{license.name}</TableCell>
                      <TableCell>{license.type}</TableCell>
                      <TableCell>{license.owner}</TableCell>
                      <TableCell>
                        <Badge className={cn('capitalize', statusColors[license.status])}>
                            {license.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No license usage data found.
                    </TableCell>
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
