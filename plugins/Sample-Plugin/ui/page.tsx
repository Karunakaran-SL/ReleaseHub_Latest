import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Box, Play, CheckCircle2 } from 'lucide-react';
import pluginConfig from './plugin.json';

export default async function SamplePluginPage() {
    const user = await getUser();
    // Map user id to _id for DashboardLayout compatibility
    const layoutUser = user ? { _id: user.id, username: user.username } : null;

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 relative overflow-hidden h-full">
                {/* Decorative Grid Background */}
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />

                <div className="flex items-center justify-between space-y-2 mb-8 relative">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Box className="h-5 w-5" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                {pluginConfig.name}
                            </h2>
                        </div>
                        <p className="text-muted-foreground mt-2 text-lg">
                            {pluginConfig.description}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="col-span-1 shadow-sm border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                Plugin Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-border/40">
                                    <span className="text-sm text-muted-foreground">Version</span>
                                    <span className="font-mono text-sm">{pluginConfig.version}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-border/40">
                                    <span className="text-sm text-muted-foreground">Publisher</span>
                                    <span className="text-sm">{pluginConfig.publisher}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-muted-foreground">Data Integration</span>
                                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1 md:col-span-2 shadow-sm border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Play className="h-5 w-5 text-indigo-500" />
                                Test API Logic
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                This area can be used to test the backend Node.js API logic created by this plugin.
                            </p>
                            <Button className="w-[200px] gap-2">
                                <Play className="h-4 w-4" />
                                Execute /api/sample
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
