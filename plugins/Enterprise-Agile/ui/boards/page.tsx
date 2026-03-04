'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, Plus, ChevronDown, CheckCircle2, ArrowUpCircle, Circle, MoreHorizontal } from 'lucide-react';

const statuses = ['To Do', 'In Progress', 'In Review', 'Done'];

const mockIssues = [
    { id: 'US-201', title: 'Implement Auth0 Callback', type: 'Story', status: 'In Progress', points: 8, priority: 'Highest', epic: 'Migrate to Kubernetes', assignee: 'JD' },
    { id: 'US-202', title: 'Token Validation Middleware', type: 'Story', status: 'Done', points: 5, priority: 'Medium', epic: 'Migrate to Kubernetes', assignee: 'MK' },
    { id: 'T-301', title: 'Setup GitHub Actions for UI', type: 'Task', status: 'To Do', points: 3, priority: 'High', epic: 'CI/CD Pipeline', assignee: 'JD' },
    { id: 'T-302', title: 'Configure SonarQube rules', type: 'Task', status: 'In Review', points: 2, priority: 'Medium', epic: 'CI/CD Pipeline', assignee: 'AS' },
    { id: 'US-204', title: 'Design System Button Updates', type: 'Story', status: 'In Progress', points: 5, priority: 'Low', epic: 'Frontend Polish', assignee: 'MK' }
];

const PriorityIcon = ({ priority }: { priority: string }) => {
    switch (priority) {
        case 'Highest': return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
        case 'High': return <ArrowUpCircle className="h-4 w-4 text-orange-500" />;
        case 'Low': return <ArrowUpCircle className="h-4 w-4 text-blue-500 transform rotate-180" />;
        default: return <Circle className="h-4 w-4 text-yellow-500" />;
    }
};

export default function BoardsManagerWrapper() {
    const mockUser: User = { _id: "65b9", username: "admin", email: "admin@corp.com", roles: ["admin"], role: "admin" };
    return (
        <DashboardLayout user={mockUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 h-full flex flex-col">
                <BoardsManager />
            </div>
        </DashboardLayout>
    );
}

function BoardsManager() {
    const [boardName] = useState('Frontend Core Team - Sprint 4');

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex flex-col gap-4 mb-4 pb-4 border-b">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    Projects / Enterprise Agile / {boardName}
                </div>
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold tracking-tight">{boardName}</h3>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9 bg-slate-100 dark:bg-slate-800"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Complete Sprint</Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search board" className="w-48 pl-8 h-9" />
                    </div>
                    <div className="flex -space-x-2 mr-2">
                        <Avatar className="h-8 w-8 border-2 border-background cursor-pointer hover:-translate-y-1 transition-transform"><AvatarFallback className="bg-blue-100 text-blue-700 text-xs">JD</AvatarFallback></Avatar>
                        <Avatar className="h-8 w-8 border-2 border-background cursor-pointer hover:-translate-y-1 transition-transform"><AvatarFallback className="bg-green-100 text-green-700 text-xs">MK</AvatarFallback></Avatar>
                        <Avatar className="h-8 w-8 border-2 border-background cursor-pointer hover:-translate-y-1 transition-transform"><AvatarFallback className="bg-purple-100 text-purple-700 text-xs">AS</AvatarFallback></Avatar>
                        <Avatar className="h-8 w-8 border-2 border-background cursor-pointer hover:-translate-y-1 transition-transform bg-slate-100"><AvatarFallback className="bg-slate-100 text-slate-700 text-xs">+2</AvatarFallback></Avatar>
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground h-8 text-xs font-medium">Only my issues</Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground h-8 text-xs font-medium">Recently updated</Button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex gap-4 h-full min-w-max">
                    {statuses.map(status => {
                        const items = mockIssues.filter(i => i.status === status);
                        return (
                            <div key={status} className="w-80 flex flex-col bg-slate-100/50 dark:bg-slate-900/40 rounded-lg overflow-hidden border">
                                <div className="p-3 bg-slate-100 dark:bg-slate-900/80 border-b flex items-center justify-between sticky top-0">
                                    <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">{status} <span className="ml-1 opacity-50">{items.length}</span></h4>
                                </div>
                                <div className="p-2 flex-1 overflow-y-auto space-y-2">
                                    {items.map(issue => (
                                        <Card key={issue.id} className="cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-blue-500/50 transition-all shadow-sm">
                                            <CardContent className="p-3 space-y-3">
                                                <p className="text-sm font-medium leading-snug">{issue.title}</p>

                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 line-clamp-1 max-w-[150px] overflow-hidden truncate">
                                                        {issue.epic}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center justify-between pt-1 mt-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`h-4 w-4 rounded-sm flex items-center justify-center text-[8px] font-bold text-white ${issue.type === 'Story' ? 'bg-green-500' : 'bg-blue-400'}`}>
                                                            {issue.type === 'Story' ? 'US' : 'T'}
                                                        </div>
                                                        <span className="text-xs font-mono text-muted-foreground hover:underline cursor-pointer">{issue.id}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <PriorityIcon priority={issue.priority} />
                                                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                            {issue.points}
                                                        </div>
                                                        {issue.assignee && (
                                                            <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px] bg-slate-200">{issue.assignee}</AvatarFallback></Avatar>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
