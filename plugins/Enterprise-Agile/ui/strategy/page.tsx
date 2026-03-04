'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Search, Filter, Plus, ChevronDown, ChevronRight, Target, Briefcase, TrendingUp, Lock, ArrowUpRight } from 'lucide-react';

const mockStrategy = [
    {
        id: 'ST-001',
        title: 'Cloud Native Transformation',
        type: 'Theme',
        horizon: 'H1',
        status: 'Active',
        budget: 1500000,
        spent: 850000,
        metric: 'Lead Time < 10m',
        children: [
            { id: 'SE-101', title: 'Migrate to Kubernetes', type: 'Epic', status: 'In Progress', budget: 400000, spent: 320000, roi: '400%' },
            { id: 'SE-102', title: 'Decommission Legacy VMs', type: 'Epic', status: 'To Do', budget: 150000, spent: 0, roi: '150%' }
        ]
    },
    {
        id: 'ST-002',
        title: 'AI-Powered Support System',
        type: 'Theme',
        horizon: 'H3',
        status: 'Planning',
        budget: 500000,
        spent: 50000,
        metric: 'CSAT > 95',
        children: [
            { id: 'SE-201', title: 'LLM Chatbot Integration', type: 'Epic', status: 'Analysis', budget: 250000, spent: 50000, roi: '220%' },
        ]
    }
];

export default function StrategyManagerWrapper() {
    const mockUser: User = { _id: "65b9", username: "admin", email: "admin@corp.com", roles: ["admin"], role: "admin" };
    return (
        <DashboardLayout user={mockUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <StrategyManager />
            </div>
        </DashboardLayout>
    );
}

function StrategyManager() {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({ 'ST-001': true });
    const [quarterLocked] = useState(true);

    const toggleRow = (id: string) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex flex-col">
                    <div className="text-sm text-muted-foreground mb-1">Portfolio / Enterprise Agile</div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-semibold tracking-tight">Strategy Hierarchy</h3>
                        {quarterLocked && (
                            <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200 gap-1 h-6">
                                <Lock className="h-3 w-3" /> Q3 Locked
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search themes or epics..." className="w-64 pl-8 h-9" />
                    </div>
                    <Button variant="outline" size="sm" className="h-9"><Filter className="h-4 w-4 mr-2" /> Filters</Button>
                    <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 text-white" disabled={quarterLocked}>
                        <Plus className="h-4 w-4 mr-2" /> Create Theme
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto border rounded-xl bg-background shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 border-b shadow-sm">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-muted-foreground w-10"></th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground">ID/Type</th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground">Title</th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground w-48">Budget Allocation</th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground text-right w-32">Metric / ROI</th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y relative">
                        {mockStrategy.map(theme => (
                            <React.Fragment key={theme.id}>
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors group cursor-pointer" onClick={() => toggleRow(theme.id)}>
                                    <td className="px-4 py-4 text-center">
                                        {expandedRows[theme.id] ? <ChevronDown className="h-4 w-4 text-muted-foreground inline" /> : <ChevronRight className="h-4 w-4 text-muted-foreground inline" />}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center"><Briefcase className="h-3 w-3" /></div>
                                            <span className="font-mono text-xs text-muted-foreground">{theme.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="font-medium text-base">{theme.title}</span>
                                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <Badge variant="secondary" className="text-[10px] uppercase">{theme.horizon}</Badge>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Badge variant={theme.status === 'Active' ? 'default' : 'outline'} className={theme.status === 'Active' ? 'bg-indigo-600' : ''}>
                                            {theme.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-between text-xs mb-1 font-mono">
                                            <span>${(theme.spent / 1000).toFixed(0)}k</span>
                                            <span className="text-muted-foreground">${(theme.budget / 1000).toFixed(0)}k</span>
                                        </div>
                                        <Progress value={(theme.spent / theme.budget) * 100} className="h-2 bg-slate-100 dark:bg-slate-800" />
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-700 dark:text-slate-300 border">
                                            <Target className="h-3 w-3 text-emerald-500" /> {theme.metric}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight className="h-4 w-4" /></Button>
                                    </td>
                                </tr>

                                {expandedRows[theme.id] && theme.children.map(epic => (
                                    <tr key={epic.id} className="bg-slate-50/30 dark:bg-slate-900/10 hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-4 py-3 border-l-2 border-indigo-500/30 ml-8 block w-0 h-full"></td>
                                        <td className="px-4 py-3 pl-8 relative">
                                            <div className="absolute left-0 top-1/2 w-6 h-[1px] bg-border -mt-[1px]"></div>
                                            <div className="absolute left-0 top-0 w-[1px] h-full bg-border -mt-[1px] ml-[1px]"></div>
                                            <div className="flex items-center gap-2 relative z-10 bg-background/50 pl-2">
                                                <div className="h-5 w-5 rounded bg-purple-100 text-purple-700 flex items-center justify-center text-[9px] font-bold">E</div>
                                                <span className="font-mono text-xs text-muted-foreground hover:underline cursor-pointer">{epic.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-sm text-slate-700 dark:text-slate-200">{epic.title}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="secondary" className={`text-[10px] uppercase font-bold justify-center 
                                                ${epic.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                                {epic.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-between text-xs mb-1 font-mono">
                                                <span className={epic.spent > epic.budget ? 'text-red-500 font-bold' : ''}>${(epic.spent / 1000).toFixed(0)}k</span>
                                                <span className="text-muted-foreground">${(epic.budget / 1000).toFixed(0)}k</span>
                                            </div>
                                            <Progress value={(epic.spent / epic.budget) * 100} className={`h-1.5 bg-slate-100 dark:bg-slate-800 ${epic.spent > epic.budget ? '[&>div]:bg-red-500' : '[&>div]:bg-purple-500'}`} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex items-center gap-1 text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                                <TrendingUp className="h-3 w-3" /> {epic.roi} ROI
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight className="h-3 w-3" /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
