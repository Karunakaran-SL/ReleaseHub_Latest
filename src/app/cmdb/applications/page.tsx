
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
import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { User, CmdbApplication } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import DashboardLayout from '@/app/dashboard-layout';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
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
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function DeleteApplicationDialog({ applicationId, applicationName, onApplicationDeleted }: { applicationId: string, applicationName: string, onApplicationDeleted: () => void}) {
    const [deleteComment, setDeleteComment] = useState('');
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        if (deleteConfirmationText !== 'delete' || !deleteComment) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please type "delete" and provide a comment to confirm deletion.'
            });
            return;
        }
        
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/cmdb/applications/${applicationId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: deleteComment }),
            });

            if (response.ok) {
                toast({ title: "Success", description: "Application deleted successfully." });
                onApplicationDeleted();
            } else {
                const errorData = await response.json();
                toast({ variant: "destructive", title: "Error", description: errorData.message || "Failed to delete application." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
        } finally {
            setIsDeleting(false);
        }
    };
    
    const isDeleteButtonDisabled = deleteConfirmationText !== 'delete' || !deleteComment || isDeleting;

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete {applicationName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. Please type <strong>delete</strong> to confirm.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="delete-comment">Reason for Deletion *</Label>
                        <Textarea 
                            id="delete-comment"
                            placeholder="Provide a comment for auditing purposes."
                            value={deleteComment}
                            onChange={(e) => setDeleteComment(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="delete-confirmation">Type "delete" to confirm *</Label>
                        <Input 
                            id="delete-confirmation"
                            value={deleteConfirmationText}
                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                        />
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDelete}
                        disabled={isDeleteButtonDisabled}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        DELETE
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


export default function ApplicationsPage() {
  const [items, setItems] = useState<CmdbApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  async function fetchItems() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmdb/applications');
      if (response.ok) {
        setItems(await response.json());
      } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch applications.",
        });
      }
    } catch (error) {
       toast({
            variant: "destructive",
            title: "Error",
            description: "An error occurred while fetching applications.",
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
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <Button asChild>
            <Link href="/cmdb/applications/create">ONBOARD APPLICATION</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : items.length > 0 ? (
                  items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">
                        <Link href={`/cmdb/applications/${item._id}/view`} className="hover:underline">
                          {item.name}
                        </Link>
                      </TableCell>
                       <TableCell>{item.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                             <Link href={`/cmdb/applications/${item._id}/view`}>VIEW</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                             <Link href={`/cmdb/applications/${item._id}/edit`}>UPDATE</Link>
                          </Button>
                           <DeleteApplicationDialog applicationId={item._id} applicationName={item.name} onApplicationDeleted={fetchItems} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No applications found.</TableCell>
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
