'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Grid3x3, RefreshCw } from 'lucide-react';

const API = '/api/plugins/cm-team-matrix';
const LEVELS = ['', 'B', 'E', 'I', 'A', 'X'];

export default function TeamMatrixWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><TeamMatrixPage /></DashboardLayout>;
}

function TeamMatrixPage() {
    const [matrixData, setMatrixData] = useState<any>({ matrix: [], competencies: [], departments: [] });
    const [dept, setDept] = useState('');

    const fetchAll = useCallback(async () => {
        const r = await fetch(API + (dept ? `?teamId=${dept}` : '')).then(r => r.json());
        if (r.data) setMatrixData(r.data);
    }, [dept]);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const { matrix, competencies, departments } = matrixData;
    const cellColor = (level: number) => {
        if (!level) return 'bg-slate-50 dark:bg-slate-800/30 text-slate-300';
        if (level <= 1) return 'bg-red-100 text-red-700';
        if (level <= 2) return 'bg-orange-100 text-orange-700';
        if (level <= 3) return 'bg-yellow-50 text-yellow-700';
        if (level <= 4) return 'bg-blue-50 text-blue-700';
        return 'bg-emerald-100 text-emerald-700';
    };

    const getLevel = (empId: string, compId: string) => {
        const emp = matrix.find((e: any) => e.id === empId);
        if (!emp) return null;
        return emp.skills?.find((s: any) => s.competencyId === compId)?.currentLevel || null;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center"><Grid3x3 className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Team Competency Matrix</h1><p className="text-sm text-muted-foreground">{matrix.length} employees × {competencies.length} skills</p></div>
                </div>
                <div className="flex gap-2">
                    <Select value={dept} onValueChange={setDept}>
                        <SelectTrigger className="w-44"><SelectValue placeholder="All departments" /></SelectTrigger>
                        <SelectContent><SelectItem value="">All</SelectItem>{departments.map((d: string) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
                <div className="inline-block min-w-full">
                    <table className="border-collapse text-xs">
                        <thead>
                            <tr>
                                <th className="sticky left-0 bg-background z-10 p-2 text-left font-medium border-b border-r min-w-[140px]">Employee</th>
                                {competencies.slice(0, 20).map((c: any) => (
                                    <th key={c.id} className="p-1 border-b border-r text-center" style={{ minWidth: 36, maxWidth: 36 }}>
                                        <div className="transform -rotate-45 text-[9px] text-muted-foreground whitespace-nowrap overflow-hidden w-8 mx-auto">{c.name.split(' ')[0]}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {matrix.map((emp: any) => (
                                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="sticky left-0 bg-background border-b border-r p-2 font-medium whitespace-nowrap">{emp.name}</td>
                                    {competencies.slice(0, 20).map((c: any) => {
                                        const lvl = getLevel(emp.id, c.id);
                                        return (
                                            <td key={c.id} className="border-b border-r text-center p-0">
                                                <div className={`h-7 w-9 flex items-center justify-center font-bold text-[10px] ${cellColor(lvl || 0)}`}>
                                                    {lvl ? LEVELS[lvl] : '·'}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex gap-3 mt-3 text-[10px] text-muted-foreground">
                        <span>Legend:</span>
                        {[{ l: 'B', c: 'bg-red-100 text-red-700' }, { l: 'E', c: 'bg-orange-100 text-orange-700' }, { l: 'I', c: 'bg-yellow-50 text-yellow-700' }, { l: 'A', c: 'bg-blue-50 text-blue-700' }, { l: 'X', c: 'bg-emerald-100 text-emerald-700' }].map(x => (
                            <span key={x.l} className={`px-1.5 py-0.5 rounded ${x.c}`}>{x.l}</span>
                        ))}
                        <span>(B=Beginner, E=Elementary, I=Intermediate, A=Advanced, X=Expert)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
