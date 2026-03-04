'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, AlertOctagon, GraduationCap, TrendingDown, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function IntelligenceManagerWrapper() {
    const mockUser: User = { _id: "65b9", username: "admin", email: "admin@corp.com", roles: ["admin"], role: "admin" };
    return (
        <DashboardLayout user={mockUser}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <IntelligenceManager />
            </div>
        </DashboardLayout>
    );
}

function IntelligenceManager() {
    const { toast } = useToast();

    const [risks, setRisks] = useState([
        { id: 'R-001', title: 'Data Migration Delay', prob: 4, impact: 5, score: 20, status: 'Owned' },
        { id: 'R-002', title: 'Vendor Key Rotation', prob: 2, impact: 3, score: 6, status: 'Mitigated' }
    ]);

    const handleCreateRisk = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const prob = Number(formData.get('prob'));
        const impact = Number(formData.get('impact'));

        const score = prob * impact;

        if (score > 15) {
            toast({ title: "Portfolio Escalation [R-2]", description: `Risk Score is ${score}. This exceeds the threshold and has been escalated.`, variant: "destructive" });
        } else {
            toast({ title: "Risk Logged", description: `Risk Score calculated as ${score}` });
        }

        setRisks([...risks, { id: `R-${Math.floor(Math.random() * 1000)}`, title, prob, impact, score, status: 'Owned' }]);
        e.currentTarget.reset();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-medium">Organizational Intelligence</h3>
                    <p className="text-sm text-muted-foreground">Risks, Skills Matrix, DORA DevOps Metrics, and Financials.</p>
                </div>
            </div>

            <Tabs defaultValue="risks" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="risks">Risk Register</TabsTrigger>
                    <TabsTrigger value="skills">Skill Matrix</TabsTrigger>
                    <TabsTrigger value="dora">DORA Metrics</TabsTrigger>
                    <TabsTrigger value="fin">Financials</TabsTrigger>
                </TabsList>

                <TabsContent value="risks" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Log Risk</CardTitle>
                            <CardDescription>Risks with Score {'>'} 15 auto-escalate [R-2].</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateRisk} className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2 col-span-1">
                                        <Label>Risk Title</Label>
                                        <Input name="title" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Probability (1-5)</Label>
                                        <Input name="prob" type="number" min="1" max="5" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Impact (1-5)</Label>
                                        <Input name="impact" type="number" min="1" max="5" required />
                                    </div>
                                </div>
                                <Button type="submit">Log Risk & Calculate Score</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {risks.sort((a, b) => b.score - a.score).map(r => (
                            <Card key={r.id} className={r.score > 15 ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20' : ''}>
                                <CardHeader className="pb-2 flex-row justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base">{r.title}</CardTitle>
                                        <CardDescription className="text-xs font-mono">{r.id}</CardDescription>
                                    </div>
                                    <Badge variant={r.score > 15 ? 'destructive' : 'outline'}>
                                        Score: {r.score}
                                    </Badge>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="skills" className="pt-4">
                    <Card>
                        <CardHeader><CardTitle>Competency Engine</CardTitle></CardHeader>
                        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground border-t">
                            Skill Matrix & Feature-Skill Gap mapping [SK-2] coming soon.
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dora" className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Deployment Freq', val: '4.2/day', icon: TrendingDown },
                            { label: 'Lead Time', val: '12 hrs', icon: TrendingDown },
                            { label: 'MTTR', val: '45 mins', icon: AlertOctagon },
                            { label: 'Change Fail Rate', val: '2.1%', icon: AlertOctagon }
                        ].map((d, i) => (
                            <Card key={i}>
                                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{d.label}</CardTitle></CardHeader>
                                <CardContent className="text-2xl font-bold">{d.val}</CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="fin" className="pt-4">
                    <Card>
                        <CardHeader><CardTitle>Financial Rollup</CardTitle></CardHeader>
                        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground border-t">
                            PI Cost Tracking [FIN-1] and Velocity Forecasting [FIN-2] coming soon.
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
