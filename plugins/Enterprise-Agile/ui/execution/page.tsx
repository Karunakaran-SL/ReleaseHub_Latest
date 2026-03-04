'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, Columns, Settings, Maximize2, Flag, ArrowUp, ArrowDown, ArrowRight, CheckCircle2, Circle, Clock, MoreHorizontal, LayoutList, GripVertical, AlertCircle, Bookmark, Shield, Zap, Users, ArrowUpCircle, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const mockBacklog = [
    { id: 'F-101', type: 'Feature', title: 'OAuth2 Integration', status: 'To Do', points: 21, sprint: 'Sprint 4', priority: 'High', epic: 'Migrate to Kubernetes' },
    { id: 'US-201', type: 'Story', title: 'Implement Auth0 Callback', status: 'In Progress', points: 8, sprint: 'Sprint 4', priority: 'Highest', epic: 'Migrate to Kubernetes', assignee: 'JD' },
    { id: 'US-202', type: 'Story', title: 'Token Validation Middleware', status: 'Done', points: 5, sprint: 'Sprint 4', priority: 'Medium', epic: 'Migrate to Kubernetes', assignee: 'MK' },
    { id: 'F-102', type: 'Feature', title: 'Admin Role Provisioning', status: 'Backlog', points: 13, sprint: 'Unassigned', priority: 'Medium', epic: 'LLM Chatbot Integration' },
    { id: 'US-203', type: 'Story', title: 'RBAC Database Schema', status: 'To Do', points: 5, sprint: 'Unassigned', priority: 'High', epic: 'LLM Chatbot Integration', assignee: 'JD' },
];

const PriorityIcon = ({ priority }: { priority: string }) => {
    switch (priority) {
        case 'Highest': return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
        case 'High': return <ArrowUpCircle className="h-4 w-4 text-orange-500" />;
        case 'Medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        default: return <Circle className="h-4 w-4 text-blue-500" />;
    }
};

const TypeBadge = ({ type, id }: { type: string, id: string }) => {
    const isFeature = type === 'Feature';
    return (
        <div className="flex items-center gap-2 w-24">
            <div className={`h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold text-white ${isFeature ? 'bg-purple-500' : 'bg-green-500'}`}>
                {isFeature ? 'F' : 'US'}
            </div>
            <span className="text-xs text-muted-foreground font-mono">{id}</span>
        </div>
    );
};

export default function ExecutionManagerWrapper() {
    const mockUser: User = { _id: "65b9", username: "admin", email: "admin@corp.com", roles: ["admin"], role: "admin" };
    return (
        <DashboardLayout user={mockUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <ExecutionManager />
            </div>
        </DashboardLayout>
    );
}

function ExecutionManager() {
    const [view, setView] = useState<'backlog' | 'active'>('backlog');

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-semibold tracking-tight">Backlog</h3>
                    <div className="flex bg-muted p-1 rounded-md">
                        <Button variant={view === 'backlog' ? "secondary" : "ghost"} size="sm" onClick={() => setView('backlog')} className="h-7 text-xs">Backlog</Button>
                        <Button variant={view === 'active' ? "secondary" : "ghost"} size="sm" onClick={() => setView('active')} className="h-7 text-xs">Active Sprints</Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search execution layer..." className="w-64 pl-8 bg-background h-9" />
                    </div>
                    <Button variant="outline" size="sm" className="h-9"><Filter className="h-4 w-4 mr-2" /> Filters</Button>
                    <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-4 w-4 mr-2" /> Create Issue</Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden gap-6">
                {/* Jira-style left panel for Epics / Versions */}
                <div className="w-64 flex-shrink-0 flex flex-col gap-4 border-r pr-4">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Epics</h4>
                            <Plus className="h-3 w-3 text-muted-foreground cursor-pointer" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 p-1.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium cursor-pointer">
                                <div className="h-3 w-3 bg-purple-500 rounded-sm"></div> Migrate to Kubernetes
                            </div>
                            <div className="flex items-center gap-2 p-1.5 rounded hover:bg-muted text-sm cursor-pointer">
                                <div className="h-3 w-3 bg-orange-500 rounded-sm"></div> LLM Chatbot Integration
                            </div>
                        </div>
                    </div>
                </div>

                {/* Backlog List */}
                <div className="flex-1 overflow-y-auto pr-2 pb-10">

                    {/* Sprint Container */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3 bg-slate-100 dark:bg-slate-800/80 p-3 rounded-t-lg border border-b-0">
                            <div className="flex items-center gap-2">
                                <ChevronDown className="h-4 w-4" />
                                <h4 className="font-semibold text-sm">Sprint 4</h4>
                                <Badge variant="secondary" className="text-[10px] ml-2 font-mono">15 Mar - 29 Mar</Badge>
                                <span className="text-xs text-muted-foreground ml-2">(3 issues)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    <Avatar className="h-6 w-6 border-2 border-background"><AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">JD</AvatarFallback></Avatar>
                                    <Avatar className="h-6 w-6 border-2 border-background"><AvatarFallback className="text-[10px] bg-green-100 text-green-700">MK</AvatarFallback></Avatar>
                                </div>
                                <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs font-mono">
                                    <span className="text-blue-600 dark:text-blue-400 font-bold">34</span> / 40 pts
                                </div>
                                <Button variant="secondary" size="sm" className="h-7 text-xs">Complete Sprint</Button>
                            </div>
                        </div>
                        <div className="border rounded-b-lg divide-y bg-background">
                            {mockBacklog.filter(b => b.sprint === 'Sprint 4').map(issue => (
                                <div key={issue.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 group transition-colors">
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab" />
                                        <TypeBadge type={issue.type} id={issue.id} />
                                        <span className="text-sm font-medium hover:underline cursor-pointer">{issue.title}</span>
                                        <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200">{issue.epic}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant="secondary" className={`text-[10px] uppercase font-bold w-20 justify-center 
                                            ${issue.status === 'Done' ? 'bg-green-100 text-green-700' :
                                                issue.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {issue.status}
                                        </Badge>
                                        <PriorityIcon priority={issue.priority} />
                                        {issue.assignee ? (
                                            <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px] bg-slate-200">{issue.assignee}</AvatarFallback></Avatar>
                                        ) : (
                                            <div className="h-6 w-6 rounded-full border border-dashed border-muted-foreground/50 flex items-center justify-center">
                                                <Users className="h-3 w-3 text-muted-foreground/50" />
                                            </div>
                                        )}
                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                            {issue.points}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Backlog Container */}
                    <div>
                        <div className="flex items-center justify-between mb-3 px-1 mt-8">
                            <div className="flex items-center gap-2">
                                <ChevronDown className="h-4 w-4" />
                                <h4 className="font-semibold text-sm">Backlog</h4>
                                <span className="text-xs text-muted-foreground ml-2">(2 issues)</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">Create Sprint</Button>
                        </div>
                        <div className="border rounded-lg divide-y bg-background">
                            {mockBacklog.filter(b => b.sprint === 'Unassigned').map(issue => (
                                <div key={issue.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 group transition-colors">
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab" />
                                        <TypeBadge type={issue.type} id={issue.id} />
                                        <span className="text-sm font-medium hover:underline cursor-pointer">{issue.title}</span>
                                        <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200">{issue.epic}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant="secondary" className="text-[10px] uppercase font-bold w-20 justify-center bg-slate-100 text-slate-700">
                                            {issue.status}
                                        </Badge>
                                        <PriorityIcon priority={issue.priority} />
                                        {issue.assignee ? (
                                            <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px] bg-slate-200">{issue.assignee}</AvatarFallback></Avatar>
                                        ) : (
                                            <div className="h-6 w-6 rounded-full border border-dashed border-muted-foreground/50 flex items-center justify-center">
                                                <Users className="h-3 w-3 text-muted-foreground/50" />
                                            </div>
                                        )}
                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-muted-foreground cursor-pointer hover:bg-slate-200">
                                            {issue.points || '-'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="p-3 text-sm text-muted-foreground flex items-center gap-2 hover:bg-slate-50 cursor-pointer">
                                <Plus className="h-4 w-4" /> Create issue
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
