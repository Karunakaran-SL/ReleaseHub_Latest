
'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Box, Warehouse, Puzzle, AppWindow, Cpu, MemoryStick, HardDrive } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer } from "@/components/ui/chart";

function ResourceChart({ data, title }: { data: any, title: string }) {
  const chartData = [
    {
      name: title,
      allocated: data.allocated,
      used: data.used,
    },
  ];

  return (
    <ChartContainer config={{}} className="min-h-[60px] w-full">
        <ResponsiveContainer width="100%" height={50}>
            <BarChart layout="vertical" data={chartData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" hide />
                <Bar dataKey="allocated" stackId="a" fill="hsl(var(--muted))" radius={[5, 5, 5, 5]} />
                <Bar dataKey="used" stackId="a" fill="hsl(var(--primary))" radius={[5, 5, 5, 5]} />
            </BarChart>
        </ResponsiveContainer>
    </ChartContainer>
  );
}

export function ResourceDetailsView({ node, isLoading }: { node: any, isLoading: boolean }) {
    if (isLoading) {
        return <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />;
    }

    if (!node || !node.resources) {
        return <p className="text-muted-foreground">Select an item from the tree to view its resource details.</p>;
    }

    const { allocated, used } = node.resources;
    const free = {
        cpu: allocated.cpu - used.cpu,
        memory: allocated.memory - used.memory,
        storage: allocated.storage - used.storage
    };

    const entityIcons: Record<string, React.ReactNode> = {
        product: <Box className="h-6 w-6 text-primary" />,
        tenant: <Warehouse className="h-6 w-6 text-orange-500" />,
        component: <Puzzle className="h-6 w-6 text-green-500" />,
        application: <AppWindow className="h-6 w-6 text-blue-500" />,
    };

    return (
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    {entityIcons[node.entityType]}
                    {node.name}
                    <span className="text-sm font-normal text-muted-foreground">v{node.version}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                             <CardTitle className="text-lg flex items-center gap-2">
                                <Cpu className="h-5 w-5" /> CPU
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResourceChart data={{ allocated: allocated.cpu, used: used.cpu }} title="CPU" />
                            <div className="mt-2 text-sm">
                                <p><strong>Allocated:</strong> {allocated.cpu} Cores</p>
                                <p><strong>Used:</strong> {used.cpu} Cores</p>
                                <p><strong>Free:</strong> {free.cpu} Cores</p>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MemoryStick className="h-5 w-5" /> Memory
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResourceChart data={{ allocated: allocated.memory, used: used.memory }} title="Memory" />
                             <div className="mt-2 text-sm">
                                <p><strong>Allocated:</strong> {allocated.memory} GB</p>
                                <p><strong>Used:</strong> {used.memory} GB</p>
                                <p><strong>Free:</strong> {free.memory} GB</p>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <HardDrive className="h-5 w-5" /> Storage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResourceChart data={{ allocated: allocated.storage, used: used.storage }} title="Storage" />
                             <div className="mt-2 text-sm">
                                <p><strong>Allocated:</strong> {allocated.storage} GB</p>
                                <p><strong>Used:</strong> {used.storage} GB</p>
                                <p><strong>Free:</strong> {free.storage} GB</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}
