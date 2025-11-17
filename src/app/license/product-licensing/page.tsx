
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, ProductLicensing, Product } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProductLicensingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [productLicenses, setProductLicenses] = useState<ProductLicensing[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getUser().then(setUser);
    async function fetchData() {
      setLoading(true);
      try {
        const [licensesRes, productsRes] = await Promise.all([
          fetch('/api/product-licensing'),
          fetch('/api/products')
        ]);
        
        if (!licensesRes.ok) throw new Error('Failed to fetch product licensing configurations');
        setProductLicenses(await licensesRes.json());
        
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.reduce((acc: any, p: Product) => ({ ...acc, [p._id]: p }), {}));
        }

      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  return (
    <DashboardLayout user={user}>
      <main className="flex-1 p-6 md:p-10">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Product Licensing</h1>
             <Button asChild>
                <Link href="/license/product-licensing/create">Create Product License</Link>
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Product Licensing Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>License Model</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : productLicenses.length > 0 ? (
                  productLicenses.map((pl) => (
                    <TableRow key={pl._id}>
                      <TableCell className="font-medium">{products[pl.product_id]?.name || pl.product_id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{pl.license_model}</Badge>
                      </TableCell>
                      <TableCell>{pl.compliance}</TableCell>
                      <TableCell>{pl.validity}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/license/product-licensing/${pl._id}/edit`}>Edit</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No product licensing configurations found.
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
