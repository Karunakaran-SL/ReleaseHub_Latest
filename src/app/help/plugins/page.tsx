import fs from 'fs';
import path from 'path';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Code2 } from 'lucide-react';

export default async function PluginHelpPage() {
    const user = await getUser();
    const layoutUser = user ? { _id: user.id, username: user.username } : null;

    // Read the markdown file from the file system
    const filePath = path.join(process.cwd(), 'docs', 'plugin-development.md');
    const markdownContent = fs.existsSync(filePath)
        ? fs.readFileSync(filePath, 'utf-8')
        : '# Documentation not found.\nThe plugin development guide could not be loaded.';

    return (
        <DashboardLayout user={layoutUser}>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 relative overflow-hidden h-[calc(100vh-4rem)] overflow-y-auto w-full max-w-5xl mx-auto">

                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Plugin Developer Guide</h2>
                        <p className="text-muted-foreground mt-1">Instructions and specifications for extending ReleaseHub.</p>
                    </div>
                </div>

                <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Code2 className="h-4 w-4 text-muted-foreground" />
                            Developer Documentation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-headings:font-semibold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-950/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {markdownContent}
                            </ReactMarkdown>
                        </article>
                    </CardContent>
                </Card>

            </div>
        </DashboardLayout>
    );
}
