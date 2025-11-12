
'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Item {
    _id: string;
    name: string;
    description?: string;
}

interface ReferenceTableProps {
    title: string;
    apiEndpoint: string;
}

export default function ReferenceTable({ title, apiEndpoint }: ReferenceTableProps) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<Item> | null>(null);
    const { toast } = useToast();

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/settings/specifications/${apiEndpoint}`);
            if (!res.ok) throw new Error(`Failed to fetch ${title}`);
            setItems(await res.json());
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [apiEndpoint, title]);

    const handleSave = async () => {
        if (!currentItem || !currentItem.name) {
            toast({ variant: 'destructive', title: 'Error', description: 'Name is required' });
            return;
        }

        const method = currentItem._id ? 'PUT' : 'POST';
        const url = currentItem._id ? `/api/settings/specifications/${apiEndpoint}/${currentItem._id}` : `/api/settings/specifications/${apiEndpoint}`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: currentItem.name, description: currentItem.description }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to save ${title}`);
            }
            toast({ title: 'Success', description: `${title} saved successfully.` });
            await fetchItems();
            setIsDialogOpen(false);
            setCurrentItem(null);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/settings/specifications/${apiEndpoint}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Failed to delete ${title}`);
            toast({ title: 'Success', description: `${title} deleted successfully.` });
            await fetchItems();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    const openDialog = (item: Partial<Item> | null = null) => {
        setCurrentItem(item ? { ...item } : { name: '', description: '' });
        setIsDialogOpen(true);
    };
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{title}</CardTitle>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" onClick={() => openDialog()}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{currentItem?._id ? 'Edit' : 'Add'} {title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={currentItem?.name || ''}
                                    onChange={(e) => setCurrentItem(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={currentItem?.description || ''}
                                    onChange={(e) => setCurrentItem(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleSave}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={3} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                        ) : items.length > 0 ? (
                            items.map(item => (
                                <TableRow key={item._id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openDialog(item)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={3} className="text-center">No items found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
