
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BoxSelect, Plus } from 'lucide-react';

export default function ProductLicensingSettings() {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<{ _id: string, name: string }[]>([]);
    const [formData, setFormData] = useState({
        product_id: '',
        license_model: 'Online',
        compliance: 'Standard',
        validity: '1 Year'
    });

    useEffect(() => {
        fetch('/api/products').then(res => res.json()).then(setProducts).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/plugins/product-licensing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('Product licensing configured');
                setFormData({ product_id: '', license_model: 'Online', compliance: 'Standard', validity: '1 Year' });
            } else {
                alert('Failed to save configuration');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-sm border-border/50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BoxSelect className="h-5 w-5 text-purple-500" />
                        <CardTitle>Configure Product License</CardTitle>
                    </div>
                    <CardDescription>Define how a specific product is licensed and validated.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="product">Product</Label>
                                <Select
                                    value={formData.product_id}
                                    onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                                >
                                    <SelectTrigger id="product">
                                        <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => (
                                            <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">License Model</Label>
                                <Select
                                    value={formData.license_model}
                                    onValueChange={(value) => setFormData({ ...formData, license_model: value })}
                                >
                                    <SelectTrigger id="model">
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Online">Online / SaaS</SelectItem>
                                        <SelectItem value="Offline">Offline / On-Prem</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                                        <SelectItem value="Node-Locked">Node-Locked</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="compliance">Compliance Type</Label>
                                <Input
                                    id="compliance"
                                    placeholder="e.g. Standard, Strict, Loose"
                                    value={formData.compliance}
                                    onChange={(e) => setFormData({ ...formData, compliance: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="validity">Validity Period</Label>
                                <Input
                                    id="validity"
                                    placeholder="e.g. 1 Year, 3 Years, Perpetual"
                                    value={formData.validity}
                                    onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/20 mt-4">
                        <Button type="submit" className="ml-auto" disabled={loading}>
                            {loading ? 'Saving...' : <><Plus className="mr-2 h-4 w-4" /> Save Configuration</>}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
