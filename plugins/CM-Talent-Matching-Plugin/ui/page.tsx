'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Gauge, RefreshCw, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const API = '/api/plugins/cm-talent-matching';
const ROLES_API = '/api/plugins/cm-roles';

export default function TalentMatchingWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><TalentMatchingPage /></DashboardLayout>;
}

function TalentMatchingPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [loading, setLoading] = useState(false);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        const [m, r] = await Promise.all([
            fetch(API + (selectedRole ? `?roleId=${selectedRole}` : '')).then(r => r.json()),
            fetch(ROLES_API).then(r => r.json()),
        ]);
        if (m.data) setMatches(m.data);
        if (r.data) setRoles(r.data);
        setLoading(false);
    }, [selectedRole]);
    useEffect(() => { fetch_(); }, [fetch_]);

    const initials = (n: string) => n.split(' ').map(x => x[0]).join('').toUpperCase();
    const scoreColor = (s: number) => s >= 80 ? 'text-emerald-600' : s >= 60 ? 'text-blue-600' : s >= 40 ? 'text-orange-500' : 'text-rose-500';
    const scoreBg = (s: number) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-blue-500' : s >= 40 ? 'bg-orange-400' : 'bg-rose-400';

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-violet-100 text-violet-700 rounded-lg flex items-center justify-center"><Zap className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Talent Matching</h1><p className="text-sm text-muted-foreground">Weighted skill-to-role scoring engine</p></div>
                </div>
                <div className="flex gap-2">
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="w-64"><SelectValue placeholder="Filter by role…" /></SelectTrigger>
                        <SelectContent><SelectItem value="">Best match across all roles</SelectItem>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button variant="outline" onClick={fetch_}><RefreshCw className="h-4 w-4" /></Button>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
                {loading && <div className="text-center py-16 text-muted-foreground">Computing matches…</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matches.map((m, i) => (
                        <Card key={m.id} className="shadow-none hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    {i === 0 && <Trophy className="h-5 w-5 text-yellow-500 absolute -mt-3 -ml-1" />}
                                    <Avatar className="h-10 w-10"><AvatarFallback className="bg-violet-100 text-violet-700 text-sm">{initials(m.name)}</AvatarFallback></Avatar>
                                    <div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{m.name}</p><p className="text-xs text-muted-foreground">{m.department}</p></div>
                                    <div className="text-right">
                                        <p className={`text-2xl font-bold ${scoreColor(m.matchScore)}`}>{m.matchScore}%</p>
                                        <p className="text-[10px] text-muted-foreground">match</p>
                                    </div>
                                </div>
                                {/* Score bar */}
                                <div className="h-2 bg-slate-100 rounded-full mb-2 overflow-hidden">
                                    <div className={`h-full rounded-full ${scoreBg(m.matchScore)} transition-all`} style={{ width: `${m.matchScore}%` }} />
                                </div>
                                {m.bestRole && !selectedRole && <p className="text-[11px] text-muted-foreground">Best fit: {m.bestRole}</p>}
                                {/* Breakdown */}
                                <div className="mt-2 space-y-1">
                                    {(m.breakdown || []).slice(0, 3).map((b: any) => (
                                        <div key={b.competencyId} className="flex items-center gap-2 text-[11px]">
                                            <div className={`w-1.5 h-1.5 rounded-full ${b.gap === 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                            <span className="text-muted-foreground flex-1">Skill #{b.competencyId.replace('COMP-', '')}</span>
                                            <span className={b.match >= 80 ? 'text-emerald-600' : 'text-rose-500'}>{b.match}%</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
