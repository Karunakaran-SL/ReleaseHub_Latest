'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Plus, Clock, History, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function ScheduleManagerWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        getUser().then(setUser);
    }, []);
    return (
        <DashboardLayout user={user}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <ScheduleManager />
            </div>
        </DashboardLayout>
    );
}

function ScheduleManager() {
    const [schedule, setSchedule] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItems, setNewItems] = useState<Record<string, string>>({});

    const fetchData = () => {
        fetch('/api/plugins/3iab-product-management?module=schedule')
            .then(res => res.json())
            .then(res => {
                if (res.data) setSchedule(res.data);
                if (res.auditLogs) setLogs(res.auditLogs);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const addAgenda = async (week: string, team: string) => {
        const item = newItems[week];
        if (!item) return;
        await fetch('/api/plugins/3iab-product-management?module=agenda', {
            method: 'POST',
            body: JSON.stringify({ week, team, item })
        });
        setNewItems(prev => ({ ...prev, [week]: '' }));
        fetchData();
    };

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newSchedule, setNewSchedule] = useState({ week: '', team: '3IAB-01' });

    const submitSchedule = async () => {
        if (!newSchedule.week || !newSchedule.team) return;
        await fetch('/api/plugins/3iab-product-management?module=schedule', {
            method: 'POST',
            body: JSON.stringify({ week: newSchedule.week, team: newSchedule.team, status: 'Upcoming', agenda: [] })
        });
        setIsDialogOpen(false);
        setNewSchedule({ week: '', team: '3IAB-01' });
        fetchData();
    };
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">3iaB Schedule</h2>
                    <p className="text-sm text-muted-foreground mt-1">Register tasks in the weekly agenda for upcoming syncs.</p>
                </div>
                <div className="flex gap-2">
                    <Select defaultValue="3iab-01">
                        <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select Team" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="3iab-01">3IAB-01 (Payment Gateway)</SelectItem>
                            <SelectItem value="3iab-02">3IAB-02 (User Auth)</SelectItem>
                        </SelectContent>
                    </Select>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" /> New Schedule</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Schedule Block</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Week Identifier</Label>
                                    <Input placeholder="e.g. WK 15 - 2026" value={newSchedule.week} onChange={e => setNewSchedule({ ...newSchedule, week: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Team</Label>
                                    <Input placeholder="e.g. 3IAB-01" value={newSchedule.team} onChange={e => setNewSchedule({ ...newSchedule, team: e.target.value.toUpperCase() })} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={submitSchedule} className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {loading && <div className="p-8 text-center text-muted-foreground border rounded-xl">Loading schedule...</div>}
                    {!loading && schedule.length === 0 && (
                        <div className="p-8 text-center border rounded-xl bg-slate-50 dark:bg-slate-900/50">
                            <CalendarDays className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                            <p className="text-muted-foreground">No schedules registered yet.</p>
                            <p className="text-sm text-muted-foreground mt-2">Click "New Schedule" above to register a new sync timeframe for your team.</p>
                        </div>
                    )}
                    {!loading && schedule.map((s, idx) => (
                        <Card key={idx} className={s.status === 'Current' ? 'border-indigo-500 shadow-sm' : ''}>
                            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${s.status === 'Current' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                        <CalendarDays className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-lg">{s.week}</CardTitle>
                                    <Badge variant={s.status === 'Completed' ? 'secondary' : (s.status === 'Current' ? 'default' : 'outline')}
                                        className={s.status === 'Current' ? 'bg-indigo-600' : ''}>
                                        {s.status}
                                    </Badge>
                                </div>
                                <div>
                                    {s.status === 'Current' && (
                                        <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                                            <FileText className="h-4 w-4 mr-2" /> Open MoM
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <Clock className="h-4 w-4 text-slate-400" /> Agenda Items
                                </h4>
                                <ul className="space-y-2">
                                    {s.agenda.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-border transition-colors group">
                                            {s.status === 'Completed' ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                            ) : (
                                                <div className="h-4 w-4 rounded-full border-2 border-slate-300 mt-0.5 shrink-0" />
                                            )}
                                            <span className={`text-sm ${s.status === 'Completed' ? 'text-muted-foreground line-through' : ''}`}>
                                                {item}
                                            </span>
                                            {s.status !== 'Completed' && (
                                                <Button variant="ghost" size="sm" className="h-6 text-[10px] ml-auto opacity-0 group-hover:opacity-100 uppercase tracking-wider">
                                                    Promote to Action
                                                </Button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                {s.status !== 'Completed' && (
                                    <div className="mt-4 flex gap-2">
                                        <Input placeholder="Quick add agenda item..." className="h-8 text-sm" value={newItems[s.week] || ''} onChange={e => setNewItems(prev => ({ ...prev, [s.week]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') addAgenda(s.week, s.team) }} />
                                        <Button size="sm" variant="secondary" className="h-8" onClick={() => addAgenda(s.week, s.team)}>Add</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4 text-muted-foreground" /> Schedule Audit Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative border-l ml-4 space-y-6 pb-4">
                                {logs.length === 0 && <p className="text-sm text-muted-foreground pl-4">No audit events.</p>}
                                {logs.map((log: any, i: number) => (
                                    <div key={i} className="relative pl-6">
                                        <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-background" />
                                        <p className="text-sm text-foreground capitalize">{log.action} <span className="font-semibold">{log.module}</span></p>
                                        <p className="text-xs text-muted-foreground mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
