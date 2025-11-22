
'use client';
import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, Search, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import Image from 'next/image';
import Link from 'next/link';

interface AppCatalogItem {
    _id: string;
    name: string;
    description: string;
    category: string;
    subcategory: string;
    logo: string;
    website: string;
}

const AppCard = ({ item }: { item: AppCatalogItem }) => (
    <Card className="flex flex-col">
        <CardHeader className="flex-row items-start gap-4">
            <Image src={item.logo} alt={`${item.name} logo`} width={48} height={48} className="rounded-md" />
            <div>
                <CardTitle>{item.name}</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" asChild>
                <a href={item.website} target="_blank" rel="noopener noreferrer">Learn More</a>
            </Button>
            <Button variant="secondary" size="sm" asChild>
                <Link href={`/platform-engineering/app-catalog/${item._id}/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                </Link>
            </Button>
        </CardFooter>
    </Card>
);

const AppRow = ({ item }: { item: AppCatalogItem }) => (
    <div className="flex items-center gap-4 p-2 rounded-md hover:bg-accent">
        <Image src={item.logo} alt={`${item.name} logo`} width={32} height={32} className="rounded-md" />
        <div className="flex-1">
            <p className="font-semibold">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.subcategory}</p>
        </div>
        <div className="flex-1">
            <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
        </div>
        <div className="flex gap-2">
             <Button variant="outline" size="sm" asChild>
                <a href={item.website} target="_blank" rel="noopener noreferrer">Learn More</a>
            </Button>
            <Button variant="secondary" size="sm" asChild>
                <Link href={`/platform-engineering/app-catalog/${item._id}/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                </Link>
            </Button>
        </div>
    </div>
);


export default function AppCatalogPage() {
    const [user, setUser] = useState<User | null>(null);
    const [items, setItems] = useState<AppCatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const { toast } = useToast();

    useEffect(() => {
        getUser().then(setUser);
        async function fetchData() {
            try {
                const res = await fetch('/api/app-catalog');
                if (!res.ok) throw new Error('Failed to fetch app catalog');
                setItems(await res.json());
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);

    const { categories, filteredItems } = useMemo(() => {
        const categories = [...new Set(items.map(item => item.category))];
        
        const filtered = items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  item.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(item.category);
            return matchesSearch && matchesCategory;
        });
        return { categories, filteredItems: filtered };
    }, [items, searchTerm, selectedCategories]);

    const handleCategoryToggle = (category: string) => {
        const newSelection = new Set(selectedCategories);
        if (newSelection.has(category)) {
            newSelection.delete(category);
        } else {
            newSelection.add(category);
        }
        setSelectedCategories(newSelection);
    };

    return (
        <DashboardLayout user={user}>
            <div className="flex h-full">
                <aside className="w-64 border-r p-4 flex-col hidden md:flex">
                    <h2 className="text-lg font-semibold mb-4">Filters</h2>
                    <div className="relative mb-4">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Category</h3>
                                <div className="space-y-2">
                                    {categories.map(category => (
                                        <div key={category} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`cat-${category}`}
                                                checked={selectedCategories.has(category)}
                                                onCheckedChange={() => handleCategoryToggle(category)}
                                            />
                                            <Label htmlFor={`cat-${category}`} className="font-normal cursor-pointer">{category}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </aside>
                <main className="flex-1 p-6 md:p-10 flex flex-col">
                     <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">App Catalog</h1>
                            <p className="text-muted-foreground">Discover and configure applications for your Kubernetes environments.</p>
                        </div>
                        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as any)} >
                            <ToggleGroupItem value="card" aria-label="Card view"><LayoutGrid className="h-4 w-4"/></ToggleGroupItem>
                            <ToggleGroupItem value="list" aria-label="List view"><List className="h-4 w-4"/></ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    {loading ? (
                         <div className="flex-1 flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                        <ScrollArea className="flex-1">
                             {viewMode === 'card' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredItems.map(item => <AppCard key={item._id} item={item} />)}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredItems.map(item => <AppRow key={item._id} item={item} />)}
                                </div>
                            )}
                        </ScrollArea>
                    )}
                </main>
            </div>
        </DashboardLayout>
    );
}
