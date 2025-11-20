'use client';
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Simulator, Emulator } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, Edit } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface CrudTableProps<T extends { _id: string; name: string }> {
  title: 'Simulators' | 'Emulators';
  apiEndpoint: 'simulators' | 'emulators';
}

function CrudTable<T extends { _id: string; name: string; dockerImage: string; helmChartUrl?: string }>({ title, apiEndpoint }: CrudTableProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<T> | null>(null);
  const [useCustomRegistry, setUseCustomRegistry] = useState(false);
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/platform-engineering/${apiEndpoint}`);
      if (!res.ok) throw new Error(`Failed to fetch ${title}`);
      setItems(await res.json());
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, title, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openDialog = (item: Partial<T> | null = null) => {
    const initialItem = item ? { ...item } : { name: '', dockerImage: '', helmChartUrl: '' };
    setCurrentItem(initialItem);
    setUseCustomRegistry(!!initialItem.registryUrl);
    setIsDialogOpen(true);
  };
  
  const handleSave = async () => {
    if (!currentItem || !currentItem.name || !currentItem.dockerImage) {
        toast({ variant: 'destructive', title: 'Error', description: 'Name and Docker Image are required.' });
        return;
    }
    
    let payload = {...currentItem};
    if (!useCustomRegistry) {
        payload.registryUrl = undefined;
        payload.registryUsername = undefined;
        payload.registryPassword = undefined;
    }

    const method = currentItem._id ? 'PUT' : 'POST';
    const url = currentItem._id ? `/api/platform-engineering/${apiEndpoint}/${currentItem._id}` : `/api/platform-engineering/${apiEndpoint}`;

    try {
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`Failed to save ${title.slice(0, -1)}`);
        toast({ title: 'Success', description: `${title.slice(0, -1)} saved.` });
        fetchItems();
        setIsDialogOpen(false);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
        const res = await fetch(`/api/platform-engineering/${apiEndpoint}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Failed to delete ${title.slice(0, -1)}`);
        toast({ title: 'Success', description: `${title.slice(0, -1)} deleted.` });
        fetchItems();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button size="sm" onClick={() => openDialog()}><PlusCircle className="mr-2 h-4 w-4" /> Add {title.slice(0, -1)}</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Docker Image</TableHead><TableHead>Helm Chart</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
            ) : items.length > 0 ? (
              items.map(item => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.dockerImage}</TableCell>
                  <TableCell>{item.helmChartUrl || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(item)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="text-center h-24">No {title.toLowerCase()} found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentItem?._id ? 'Edit' : 'Add'} {title.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={currentItem?.name || ''} onChange={(e) => setCurrentItem(prev => ({...prev, name: e.target.value}))}/></div>
             <div className="space-y-2"><Label htmlFor="dockerImage">Docker Image</Label><Input id="dockerImage" value={currentItem?.dockerImage || ''} onChange={(e) => setCurrentItem(prev => ({...prev, dockerImage: e.target.value}))}/></div>
             <div className="flex items-center space-x-2"><Checkbox id="useCustomRegistry" checked={useCustomRegistry} onCheckedChange={c => setUseCustomRegistry(!!c)}/><Label htmlFor="useCustomRegistry">Private Docker Registry</Label></div>
             {useCustomRegistry && (
                <div className="p-4 border rounded-md space-y-4">
                    <div className="space-y-2"><Label htmlFor="registryUrl">Registry URL</Label><Input id="registryUrl" value={currentItem?.registryUrl || ''} onChange={(e) => setCurrentItem(prev => ({...prev, registryUrl: e.target.value}))}/></div>
                    <div className="space-y-2"><Label htmlFor="registryUsername">Username</Label><Input id="registryUsername" value={currentItem?.registryUsername || ''} onChange={(e) => setCurrentItem(prev => ({...prev, registryUsername: e.target.value}))}/></div>
                    <div className="space-y-2"><Label htmlFor="registryPassword">Password</Label><Input id="registryPassword" type="password" value={currentItem?.registryPassword || ''} onChange={(e) => setCurrentItem(prev => ({...prev, registryPassword: e.target.value}))}/></div>
                </div>
             )}
             <div className="space-y-2"><Label htmlFor="helmChartUrl">Helm Chart URL</Label><Input id="helmChartUrl" value={currentItem?.helmChartUrl || ''} onChange={(e) => setCurrentItem(prev => ({...prev, helmChartUrl: e.target.value}))}/></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function SimulatorsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Simulators & Emulators</h1>
                    <p className="text-muted-foreground">Manage reusable simulators and emulators for testing environments.</p>
                </div>
                <Accordion type="multiple" defaultValue={['simulators', 'emulators']} className="space-y-6">
                    <AccordionItem value="simulators">
                        <AccordionTrigger className="text-xl font-semibold bg-muted p-4 rounded-md">Simulators</AccordionTrigger>
                        <AccordionContent className="p-4 border border-t-0 rounded-b-md">
                            <CrudTable title="Simulators" apiEndpoint="simulators" />
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="emulators">
                        <AccordionTrigger className="text-xl font-semibold bg-muted p-4 rounded-md">Emulators</AccordionTrigger>
                        <AccordionContent className="p-4 border border-t-0 rounded-b-md">
                            <CrudTable title="Emulators" apiEndpoint="emulators" />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </main>
        </DashboardLayout>
    );
}
