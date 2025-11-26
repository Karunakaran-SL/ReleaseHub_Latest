
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
import { Loader2, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { User, CmdbInterface } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import DashboardLayout from '@/app/dashboard-layout';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function InterfacesPage() {
  const [items, setItems] = useState<CmdbInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  async function fetchItems() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmdb/interfaces');
      if (response.ok) {
        setItems(await response.json());
      } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch interfaces.",
        });
      }
    } catch (error) {
       toast({
            variant: "destructive",
            title: "Error",
            description: "An error occurred while fetching interfaces.",
        });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUser().then(setUser);
    fetchItems();
  }, [toast]);

  return (
    <DashboardLayout user={user}>
      <main className="flex-1 space-y-8 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Interfaces</h1>
          <Button asChild>
            <Link href="/cmdb/interfaces/create">Register Interface</Link>
          </Button>
        </div>

        <Accordion type="single" collapsible defaultValue="item-1" className="mb-8">
            <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold">
                    <div className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Introduction
                    </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                    This page lists all the defined service interfaces in the CMDB. Interfaces are the contracts that define how different components and applications communicate with each other. Proper interface management is key to understanding dependencies and ensuring system integrity. You can register new interfaces or view details of existing ones.
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Owner</TableHead>
                   <TableHead>Last Updated</TableHead>
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
                ) : items.length > 0 ? (
                  items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">
                        <Link href={`/cmdb/interfaces/${item._id}/view`} className="hover:underline">
                          {item.name}
                        </Link>
                      </TableCell>
                      <TableCell>{item.type.name}</TableCell>
                      <TableCell>{item.version}</TableCell>
                      <TableCell>{item.owner_name}</TableCell>
                      <TableCell>{format(parseISO(item.updated_at), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                             <Link href={`/cmdb/interfaces/${item._id}/view`}>VIEW</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No interfaces found.</TableCell>
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
