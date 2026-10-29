
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
  Loader2,
  Info
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import type { User, Product } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import DashboardLayout from '../dashboard-layout';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RbacGuard } from '@/components/rbac-guard';


function DeleteProductDialog({ product, onProductDeleted }: { product: Product, onProductDeleted: () => void }) {
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
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: deleteComment }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product deleted successfully.",
        });
        onProductDeleted();
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to delete product.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
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
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the product.
            Please type <strong>delete</strong> to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`delete-comment-${product._id}`}>Reason for Deletion *</Label>
            <Textarea
              id={`delete-comment-${product._id}`}
              placeholder="Provide a comment for auditing purposes."
              value={deleteComment}
              onChange={(e) => setDeleteComment(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`delete-confirmation-${product._id}`}>Type "delete" to confirm *</Label>
            <Input
              id={`delete-confirmation-${product._id}`}
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
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  async function fetchProducts() {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Failed to fetch products');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch products.",
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching products.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUser().then(setUser);
    fetchProducts();
  }, []);

  return (
    <DashboardLayout user={user}>
      <main className="flex-1 space-y-8 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <RbacGuard userRole={user?.roles} feature="products" action="create">
            <Button asChild>
              <Link href="/products/create">CREATE PRODUCT</Link>
            </Button>
          </RbacGuard>
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
              This page lists all the products your organization manages. A "Product" is a deployable entity that can be versioned and released. Each product is linked to its own CI/CD pipeline, artifact repositories, compliance checks, and approval workflows. From here, you can create new products or view and update existing ones.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Deployment Type</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading products...</TableCell>
                  </TableRow>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Image
                          src={product.product_image || 'https://picsum.photos/seed/placeholder/40/40'}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                          unoptimized
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/products/${product._id}/view`} className="hover:underline">
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>{product.owner}</TableCell>
                      <TableCell>{product.deployment_type.name}</TableCell>
                      <TableCell>{new Date(product.updated_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/products/${product._id}/view`}>VIEW</Link>
                          </Button>
                          <RbacGuard userRole={user?.roles} feature="products" action="edit">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/products/${product._id}/edit`}>UPDATE</Link>
                            </Button>
                          </RbacGuard>
                          <RbacGuard userRole={user?.roles} feature="products" action="delete">
                            <DeleteProductDialog product={product} onProductDeleted={fetchProducts} />
                          </RbacGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No products found.</TableCell>
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
            <div className="text-sm font-medium">{`1-${products.length} of ${products.length}`}</div>
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
