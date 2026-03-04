'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Shield, Loader2 } from 'lucide-react';
import Logo from '@/components/logo';

export default function SetupPage() {
    const router = useRouter();
    const [step, setStep] = useState<'checking' | 'setup' | 'done' | 'already-initialized'>('checking');
    const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/system/init')
            .then(r => r.json())
            .then(data => {
                if (data.initialized) {
                    setStep('already-initialized');
                    setTimeout(() => router.push('/login'), 2000);
                } else {
                    setStep('setup');
                }
            })
            .catch(() => setStep('setup'));
    }, [router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (!form.username.trim()) {
            setError('Username is required.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/system/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: form.username, password: form.password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Failed to create account.');
                return;
            }
            setStep('done');
            setTimeout(() => router.push('/login'), 2500);
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (step === 'checking') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="flex flex-col items-center gap-4 text-white">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
                    <p className="text-slate-300">Checking system status...</p>
                </div>
            </div>
        );
    }

    if (step === 'already-initialized') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <Card className="w-full max-w-md border-slate-700 bg-slate-800 text-white shadow-2xl">
                    <CardHeader className="text-center">
                        <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-green-400" />
                        <CardTitle className="text-xl">Already Initialized</CardTitle>
                        <CardDescription className="text-slate-400">
                            This system already has users. Redirecting to login...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (step === 'done') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <Card className="w-full max-w-md border-slate-700 bg-slate-800 text-white shadow-2xl">
                    <CardHeader className="text-center">
                        <CheckCircle2 className="mx-auto mb-2 h-14 w-14 text-green-400" />
                        <CardTitle className="text-2xl text-green-300">Setup Complete!</CardTitle>
                        <CardDescription className="text-slate-300 mt-2">
                            Your admin account has been created. Redirecting to login...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="w-full max-w-lg space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-blue-400">
                        <Shield className="h-5 w-5" />
                        <span className="text-sm font-medium uppercase tracking-widest">First-Time Setup</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Create Admin Account</h1>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto">
                        Welcome to ReleaseHub! No users have been configured yet. Create your administrator account to get started.
                    </p>
                </div>

                {/* Setup card */}
                <Card className="border-slate-700 bg-slate-800/80 backdrop-blur shadow-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-white text-lg">Administrator Details</CardTitle>
                        <CardDescription className="text-slate-400">
                            This account will have full access to all features.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-slate-200">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="e.g. admin"
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                                    value={form.username}
                                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                                    required
                                    autoComplete="username"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-200">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-slate-200">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Re-enter your password"
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                                    value={form.confirmPassword}
                                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5"
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>
                                ) : (
                                    'Create Admin Account'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-slate-500">
                    Additional users can be added from{' '}
                    <span className="text-slate-400">Settings → User Management</span> after setup.
                </p>
            </div>
        </div>
    );
}
