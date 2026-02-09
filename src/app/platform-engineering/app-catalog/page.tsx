
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, HelpCircle, CircleDot, Package } from 'lucide-react';

const iconMap = {
    CheckCircle: <CheckCircle className="h-3 w-3" />,
    HelpCircle: <HelpCircle className="h-3 w-3" />,
    CircleDot: <CircleDot className="h-3 w-3" />,
    Package: <Package className="h-3 w-3" />,
};

const statuses = [
    { text: 'Certified', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: 'CheckCircle' },
    { text: 'In Qualification', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: 'HelpCircle' },
    { text: 'Evaluation Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: 'CircleDot' },
    { text: 'In Inventory', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: 'Package' },
];

interface AppCatalogItem {
    _id: string;
    name: string;
    description: string;
    category: string;
    subcategory: string;
    logo: string;
    website: string;
    status?: typeof statuses[0];
}

const AppCard = ({ item }: { item: AppCatalogItem }) => (
    <Card className="flex flex-col">
        <CardHeader className="flex-row items-start gap-4 space-y-0">
            <Image src={item.logo} alt={`${item.name} logo`} width={48} height={48} className="rounded-md" />
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="truncate text-base">{item.name}</CardTitle>
                    {item.status && (
                        <Badge className={cn("shrink-0 flex items-center gap-1 whitespace-nowrap", item.status.color)}>
                            {iconMap[item.status.icon as keyof typeof iconMap]}
                            <span className="text-[10px]">{item.status.text}</span>
                        </Badge>
                    )}
                </div>
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
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <p className="font-semibold truncate">{item.name}</p>
                {item.status && (
                    <Badge className={cn("shrink-0 flex items-center gap-1", item.status.color)} variant="outline">
                        {iconMap[item.status.icon as keyof typeof iconMap]}
                        <span className="text-[10px]">{item.status.text}</span>
                    </Badge>
                )}
            </div>
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
    const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const { toast } = useToast();

    useEffect(() => {
        // Fix for type mismatch between User interface and Auth response
        getUser().then((u: any) => setUser(u));
        async function fetchData() {
            try {
                const res = await fetch('/api/app-catalog');
                if (!res.ok) throw new Error('Failed to fetch app catalog');
                const data = await res.json();

                // Deterministically assign status based on ID
                const itemsWithStatus = data.map((item: AppCatalogItem) => {
                    // Simple hash function for consistent status assignment
                    const sum = item._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const statusIndex = sum % 4; // 0 to 3

                    // Prioritize "Certified" (index 0) slightly more by mapping higher indices
                    // 0 -> 0 (Certified), 1 -> 1 (In Qual), 2 -> 2 (Eval), 3 -> 3 (Inv)
                    // No complex logic needed, just distribution.

                    return { ...item, status: statuses[statusIndex] };
                });

                setItems(itemsWithStatus);
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);

    const { categories } = useMemo(() => {
        const categoryMap = new Map<string, Set<string>>();
        items.forEach(item => {
            if (!categoryMap.has(item.category)) {
                categoryMap.set(item.category, new Set());
            }
            categoryMap.get(item.category)!.add(item.subcategory);
        });

        const categories = Array.from(categoryMap.entries()).map(([name, subcategories]) => ({
            name,
            subcategories: Array.from(subcategories).sort(),
        })).sort((a, b) => a.name.localeCompare(b.name));

        return { categories };
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(item.category);
            const matchesSubcategory = selectedSubcategories.size === 0 || selectedSubcategories.has(item.subcategory);
            return matchesSearch && matchesCategory && matchesSubcategory;
        });
    }, [items, searchTerm, selectedCategories, selectedSubcategories]);

    const handleCategoryToggle = (category: string, isChecked: boolean) => {
        const newSelection = new Set(selectedCategories);
        if (isChecked) {
            newSelection.add(category);
        } else {
            newSelection.delete(category);
        }
        setSelectedCategories(newSelection);
    };

    const handleSubcategoryToggle = (subcategory: string, isChecked: boolean) => {
        const newSelection = new Set(selectedSubcategories);
        if (isChecked) {
            newSelection.add(subcategory);
        } else {
            newSelection.delete(subcategory);
        }
        setSelectedSubcategories(newSelection);
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
                        <Accordion type="multiple" className="w-full">
                            {categories.map((category) => (
                                <AccordionItem value={category.name} key={category.name}>
                                    <div className="flex items-center space-x-2 p-2">
                                        <Checkbox
                                            id={`cat-${category.name}`}
                                            checked={selectedCategories.has(category.name)}
                                            onCheckedChange={(checked) => handleCategoryToggle(category.name, !!checked)}
                                        />
                                        <AccordionTrigger className="p-0 flex-1">
                                            <Label htmlFor={`cat-${category.name}`} className="font-semibold cursor-pointer">{category.name}</Label>
                                        </AccordionTrigger>
                                    </div>
                                    <AccordionContent className="pl-8 pt-2 space-y-2">
                                        {category.subcategories.map(sub => (
                                            <div key={sub} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`sub-${sub}`}
                                                    checked={selectedSubcategories.has(sub)}
                                                    onCheckedChange={(checked) => handleSubcategoryToggle(sub, !!checked)}
                                                />
                                                <Label htmlFor={`sub-${sub}`} className="font-normal cursor-pointer">{sub}</Label>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </ScrollArea>
                </aside>
                <main className="flex-1 p-6 md:p-10 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">App Catalog</h1>
                            <p className="text-muted-foreground">Discover and configure applications for your Kubernetes environments.</p>
                        </div>
                        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as any)} >
                            <ToggleGroupItem value="card" aria-label="Card view"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
                            <ToggleGroupItem value="list" aria-label="List view"><List className="h-4 w-4" /></ToggleGroupItem>
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
