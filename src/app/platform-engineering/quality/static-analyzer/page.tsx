
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Bug, CheckCircle, Shield, Waypoints } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const ratingColors = {
  'A': 'bg-green-500',
  'B': 'bg-blue-500',
  'C': 'bg-yellow-500',
  'D': 'bg-orange-500',
  'E': 'bg-red-500',
};

const issuesData = [
  { name: 'Blocker', new: 2, fill: 'var(--color-blocker)' },
  { name: 'Critical', new: 5, fill: 'var(--color-critical)' },
  { name: 'Major', new: 15, fill: 'var(--color-major)' },
  { name: 'Minor', new: 45, fill: 'var(--color-minor)' },
];

const chartConfig = {
    new: {
        label: "New Issues",
    },
    blocker: {
        label: "Blocker",
        color: "hsl(var(--chart-5))",
    },
    critical: {
        label: "Critical",
        color: "hsl(var(--chart-4))",
    },
    major: {
        label: "Major",
        color: "hsl(var(--chart-3))",
    },
    minor: {
        label: "Minor",
        color: "hsl(var(--chart-2))",
    },
}

function MetricCard({ title, value, rating, description, icon }: { title: string, value: string, rating: keyof typeof ratingColors, description: string, icon: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between">
                    <span>{title}</span>
                    {icon}
                </CardDescription>
                <div className="flex items-baseline gap-2">
                    <CardTitle className="text-4xl">{value}</CardTitle>
                    <Badge className={`${ratingColors[rating]}`}>{rating}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}

export default function StaticAnalyzerPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Quality: Static Analyzer</h1>
                    <p className="text-muted-foreground">Analysis results for project "OneStopShop Portal".</p>
                </div>

                <div className="grid gap-6">
                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="text-green-600" />
                                Quality Gate: Passed
                            </CardTitle>
                            <CardDescription>The project meets all quality requirements.</CardDescription>
                        </CardHeader>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                        <MetricCard title="Bugs" value="8" rating="A" description="0 new bugs" icon={<Bug className="h-4 w-4 text-muted-foreground"/>} />
                        <MetricCard title="Vulnerabilities" value="12" rating="B" description="2 new vulnerabilities" icon={<Shield className="h-4 w-4 text-muted-foreground"/>}/>
                        <MetricCard title="Code Smells" value="1.2k" rating="C" description="15 new code smells" icon={<AlertCircle className="h-4 w-4 text-muted-foreground"/>}/>
                        <MetricCard title="Coverage" value="85.7%" rating="A" description="on 12.4k Lines" icon={<Waypoints className="h-4 w-4 text-muted-foreground"/>}/>
                        <MetricCard title="Duplications" value="3.1%" rating="A" description="on 248 files" icon={<Copy className="h-4 w-4 text-muted-foreground"/>}/>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>New Issues</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={issuesData} layout="vertical" margin={{left: 10}}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="new" layout="vertical" radius={4} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Hotspots Reviewed</CardTitle>
                            </CardHeader>
                             <CardContent className="flex flex-col items-center justify-center h-full gap-2">
                                <p className="text-4xl font-bold">100%</p>
                                <Progress value={100} className="w-3/4" />
                                <p className="text-sm text-muted-foreground">2 Security Hotspots reviewed</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle>Main Branches</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Branch</TableHead>
                                        <TableHead>Quality Gate</TableHead>
                                        <TableHead>Bugs</TableHead>
                                        <TableHead>Vulnerabilities</TableHead>
                                        <TableHead>Coverage</TableHead>
                                        <TableHead>Last Analysis</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>main</TableCell>
                                        <TableCell><Badge className="bg-green-500">Passed</Badge></TableCell>
                                        <TableCell>8</TableCell>
                                        <TableCell>12</TableCell>
                                        <TableCell>85.7%</TableCell>
                                        <TableCell>1 day ago</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>develop</TableCell>
                                        <TableCell><Badge className="bg-green-500">Passed</Badge></TableCell>
                                        <TableCell>10</TableCell>
                                        <TableCell>15</TableCell>
                                        <TableCell>82.1%</TableCell>
                                        <TableCell>2 hours ago</TableCell>
                                    </TableRow>
                                     <TableRow>
                                        <TableCell>release/v2.1</TableCell>
                                        <TableCell><Badge variant="destructive">Failed</Badge></TableCell>
                                        <TableCell>15</TableCell>
                                        <TableCell>25</TableCell>
                                        <TableCell>75.0%</TableCell>
                                        <TableCell>3 days ago</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </DashboardLayout>
    );
}
