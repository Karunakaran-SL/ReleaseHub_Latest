import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plug, Download, ExternalLink, CheckCircle2 } from 'lucide-react';
import PluginIcon from './plugin-icon';
import DashboardLayout from '@/app/dashboard-layout';
import PluginManager from './plugin-manager';
import { getUser } from '@/lib/auth';

interface PluginFeature {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
}

interface Plugin {
    id: string;
    name: string;
    shortDescription: string;
    category: string;
    latestVersion: string;
    status: string;
    publisher: string;
    verified: boolean;
    iconUrl?: string;
    bannerUrl?: string;
    screenshots?: string[];
    features?: PluginFeature[];
    pluginUrl: string;
}

interface PluginRegistry {
    registryVersion: string;
    generatedAt: string;
    baseUrl: string;
    cdnBaseUrl: string;
    plugins: Plugin[];
}

async function getPlugins(): Promise<PluginRegistry | null> {
    try {
        const res = await fetch('https://raw.githubusercontent.com/OneClickRelease/PlugIns/refs/heads/main/registry.json', {
            next: { revalidate: 3600 } // Revalidate every hour
        });

        if (!res.ok) {
            throw new Error('Failed to fetch plugins');
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching plugin registry:', error);
        return null;
    }
}

export default async function PluginsPage() {
    const registry = await getPlugins();
    const rawUser = await getUser();
    const user = rawUser ? { _id: rawUser._id, username: rawUser.username, roles: rawUser.roles } : null;

    return (
        <DashboardLayout user={user}>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />
                <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl -z-10" />

                <div className="flex items-center justify-between space-y-2 mb-8">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Plugins</h2>
                </div>

                <PluginManager />

                <div className="flex flex-col gap-2 mt-8">
                    <h3 className="text-lg font-medium text-foreground">Available Integrations</h3>
                    <p className="text-sm text-muted-foreground w-full max-w-2xl">
                        Browse and install verified plugins to extend your workspace. Enhance your workflow with official and community-built integrations.
                    </p>
                </div>

                {!registry ? (
                    <div className="p-12 text-center rounded-xl border border-destructive/20 bg-destructive/5 text-destructive mt-6 shadow-sm">
                        <Plug className="mx-auto h-12 w-12 text-destructive/50 mb-4" />
                        <h3 className="text-lg font-semibold">Failed to load plugin registry</h3>
                        <p className="text-sm mt-2 opacity-80">Please check your connection or try again later.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                        {registry.plugins.map((plugin) => (
                            <Card key={plugin.id} className="relative overflow-hidden group border-border/50 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(99,102,241,0.1)] flex flex-col bg-background/50 backdrop-blur-md">
                                <div className="absolute h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent bottom-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-100 dark:border-indigo-900 overflow-hidden relative shadow-inner">
                                        {plugin.iconUrl ? (
                                            <div className="w-8 h-8 relative flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                                                <PluginIcon
                                                    src={plugin.iconUrl.startsWith('http') ? plugin.iconUrl : `${registry.cdnBaseUrl}${plugin.iconUrl}`}
                                                    alt={`${plugin.name} icon`}
                                                />
                                            </div>
                                        ) : (
                                            <Plug className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-lg font-semibold">{plugin.name}</CardTitle>
                                            {plugin.verified && (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            )}
                                        </div>
                                        <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            by {plugin.publisher}
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1 pb-4">
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                        {plugin.shortDescription}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 hover:bg-indigo-100 hover:dark:bg-indigo-900/50 border-0 pointer-events-none">
                                            {plugin.category}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs pointer-events-none font-mono">
                                            v{plugin.latestVersion}
                                        </Badge>
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-2 border-t border-border/40 bg-slate-50/50 dark:bg-slate-900/20">
                                    <Button variant="default" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all rounded-full" size="sm">
                                        <Download className="mr-2 h-4 w-4" /> Install
                                    </Button>
                                    <Button variant="ghost" size="icon" className="ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800" title="View details">
                                        <ExternalLink className="h-4 w-4 opacity-70" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
