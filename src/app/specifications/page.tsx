
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
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import DashboardLayout from '../dashboard-layout';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Specification {
    _id: string;
    name: string;
    hw_type: { name: string };
    vendor: string;
    image: string;
}

export default function SpecificationsPage() {
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  async function fetchSpecifications() {
    setLoading(true);
    try {
      const response = await fetch('/api/specifications');
      if (response.ok) {
        const data = await response.json();
        setSpecifications(data);
      } else {
        console.error('Failed to fetch specifications');
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch specifications.",
        });
      }
    } catch (error) {
      console.error('Error fetching specifications:', error);
       toast({
            variant: "destructive",
            title: "Error",
            description: "An error occurred while fetching specifications.",
        });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUser().then(setUser);
    fetchSpecifications();
  }, []);

  return (
    <DashboardLayout user={user}>
      <main className="flex-1 space-y-8 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Specifications</h1>
          <Button asChild>
            <Link href="#">CREATE SPECIFICATION</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Icon</TableHead>
                  <TableHead>HW Name</TableHead>
                  <TableHead>HW Type</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading specifications...</TableCell>
                  </TableRow>
                ) : specifications.length > 0 ? (
                  specifications.map((spec) => (
                    <TableRow key={spec._id}>
                      <TableCell>
                        <Image 
                            src={spec.image} 
                            alt={spec.name} 
                            width={40} 
                            height={40} 
                            className="rounded-full"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {spec.name}
                      </TableCell>
                      <TableCell>{spec.hw_type.name}</TableCell>
                      <TableCell>{spec.vendor}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                             <Link href="#">VIEW</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                             <Link href="#">UPDATE</Link>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No specifications found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex items-center justify-end space-x-6 p-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <Select>
                <SelectTrigger className="h-8 w-16">
                  <SelectValue placeholder="5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm font-medium">{`1-${specifications.length} of ${specifications.length}`}</div>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
    </DashboardLayout>
  );
}
