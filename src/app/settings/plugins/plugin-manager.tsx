'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, Trash2, Box, RefreshCw } from 'lucide-react';

export default function PluginManager() {
    const [installedPlugins, setInstalledPlugins] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchPlugins = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/system/plugins/list');
            const data = await res.json();
            if (data.success) {
                setInstalledPlugins(data.plugins);
            }
        } catch (e) {
            console.error('Failed to fetch installed plugins', e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPlugins();
    }, []);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/system/plugins/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchPlugins();
                // Force reload the page layout so the sidebar updates instantly
                window.location.reload();
            } else {
                alert('Upload Error: ' + data.error);
            }
        } catch (error: any) {
            alert('Upload Error: ' + error.message);
        }
        setUploading(false);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUninstall = async (pluginId: string) => {
        if (!confirm(`Are you sure you want to uninstall ${pluginId}?`)) return;

        setLoading(true);
        try {
            const res = await fetch('/api/system/plugins/uninstall', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pluginId })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchPlugins();
                window.location.reload();
            } else {
                alert('Uninstall Error: ' + data.error);
            }
        } catch (error: any) {
            alert('Uninstall Error: ' + error.message);
        }
        setLoading(false);
    };

    return (
        <div className="mb-8 space-y-6">
            <div className="flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                <div>
                    <h3 className="text-xl font-semibold text-indigo-950 dark:text-indigo-100">Local Environment</h3>
                    <p className="text-sm text-muted-foreground mt-1">Manage plugins installed natively in your application architecture via Zip files.</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".zip"
                    />
                    <Button
                        onClick={handleUploadClick}
                        disabled={uploading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 rounded-full"
                    >
                        {uploading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                        {uploading ? 'Installing...' : 'Upload .zip'}
                    </Button>
                </div>
            </div>

            {installedPlugins.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Currently Installed</h4>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {installedPlugins.map((plugin) => (
                            <Card key={plugin.id} className="relative overflow-hidden group border-border/50 bg-background/50 backdrop-blur-md">
                                <CardHeader className="flex flex-row items-center gap-4 py-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner">
                                        <Box className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <CardTitle className="text-base font-semibold">{plugin.name}</CardTitle>
                                        <p className="text-xs text-muted-foreground">by {plugin.publisher}</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="text-xs font-mono">v{plugin.version}</Badge>
                                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 pointer-events-none">Active</Badge>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2 pb-3 bg-slate-50/50 dark:bg-slate-900/20 border-t border-border/40 justify-end">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleUninstall(plugin.id)}
                                        disabled={loading}
                                        className="rounded-full shadow-sm"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Uninstall
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
