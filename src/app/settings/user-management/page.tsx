'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User } from '@/lib/definitions';
import { FEATURES, FEATURE_LABELS, type Action, type FeatureKey } from '@/lib/permissions';
import { isAdminRole } from '@/lib/role-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    UserPlus, Pencil, Trash2, ShieldCheck, Users, Lock, KeyRound, Loader2,
    AlertCircle, CheckCircle2, RefreshCw, Eye, EyeOff, Check, X, Info,
    Shield, UserCog, Plus, Puzzle, Tag, Settings2,
} from 'lucide-react';

const ACTIONS: Action[] = ['view', 'create', 'edit', 'delete'];
const SYSTEM_FEATURES = Object.values(FEATURES) as string[];

const ROLE_BADGE: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200',
    release_engineer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
    platform_engineer: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200',
    auditor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
    viewer: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-200',
};

type RoleData = { name: string; label: string; description: string; permissions: Record<string, string[]>; isDefault?: boolean; pluginId?: string };
type FeatureData = { key: string; label: string; description: string; isSystem: boolean; pluginId?: string | null };
type DbUser = { _id: string; username: string; roles?: string[]; role?: string; email?: string; createdAt?: string; createdBy?: string };

function Toast({ message, type, onDismiss }: { message: string; type: 'success' | 'error'; onDismiss: () => void }) {
    return (
        <div onClick={onDismiss} className={`fixed bottom-6 right-6 z-50 flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 shadow-2xl text-sm font-medium ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
            {type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message}
        </div>
    );
}

function PermBadge({ allowed }: { allowed: boolean }) {
    return allowed ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <X className="mx-auto h-4 w-4 text-slate-300 dark:text-slate-600" />;
}

function RoleChip({ role, label }: { role: string; label: string }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE[role] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {label}
        </span>
    );
}

const EMPTY_NEW_ROLE = { name: '', label: '', description: '' };
const EMPTY_NEW_FEATURE = { key: '', label: '', description: '' };
type NewUserForm = { username: string; password?: string; roles: string[]; role?: string; email?: string };
const EMPTY_NEW_USER: NewUserForm = { username: '', password: '', roles: ['viewer'], role: undefined, email: '' };

export default function UserManagementPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [users, setUsers] = useState<DbUser[]>([]);
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [features, setFeatures] = useState<FeatureData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<string>('admin');
    const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
    const [savingRole, setSavingRole] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // User dialogs
    const [showAddUser, setShowAddUser] = useState(false);
    const [showEditUser, setShowEditUser] = useState(false);
    const [showDeleteUser, setShowDeleteUser] = useState(false);
    const [showResetPw, setShowResetPw] = useState(false);
    const [showUserDetail, setShowUserDetail] = useState(false);
    const [editingUser, setEditingUser] = useState<DbUser | null>(null);
    const [deletingUser, setDeletingUser] = useState<DbUser | null>(null);
    const [resetPwUser, setResetPwUser] = useState<DbUser | null>(null);
    const [detailUser, setDetailUser] = useState<DbUser | null>(null);

    // Role dialogs
    const [showCreateRole, setShowCreateRole] = useState(false);
    const [showDeleteRole, setShowDeleteRole] = useState(false);
    const [deletingRole, setDeletingRole] = useState<RoleData | null>(null);
    const [newRole, setNewRole] = useState(EMPTY_NEW_ROLE);
    const [roleError, setRoleError] = useState('');
    const [roleLoading, setRoleLoading] = useState(false);

    // Feature dialogs
    const [showCreateFeature, setShowCreateFeature] = useState(false);
    const [showDeleteFeature, setShowDeleteFeature] = useState(false);
    const [deletingFeature, setDeletingFeature] = useState<FeatureData | null>(null);
    const [newFeature, setNewFeature] = useState(EMPTY_NEW_FEATURE);
    const [featureError, setFeatureError] = useState('');
    const [featureLoading, setFeatureLoading] = useState(false);

    // Add user form
    const [newUser, setNewUser] = useState(EMPTY_NEW_USER);
    const [addError, setAddError] = useState('');
    const [addLoading, setAddLoading] = useState(false);
    // Edit User
    const [editRoles, setEditRoles] = useState<string[]>([]); // Changed from editRole to editRoles
    const [editEmail, setEditEmail] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    const fetchUsers = useCallback(async () => {
        const res = await fetch('/api/users');
        if (res.ok) setUsers((await res.json()).users ?? []);
    }, []);

    const fetchRoles = useCallback(async () => {
        const res = await fetch('/api/roles');
        if (res.ok) setRoles((await res.json()).roles ?? []);
    }, []);

    const fetchFeatures = useCallback(async () => {
        const res = await fetch('/api/features');
        if (res.ok) setFeatures((await res.json()).features ?? []);
    }, []);

    useEffect(() => {
        getUser().then(u => { setCurrentUser(u as unknown as User); setIsAdmin(isAdminRole(u?.roles)); });
        Promise.all([fetchUsers(), fetchRoles(), fetchFeatures()]).finally(() => setLoading(false));
    }, [fetchUsers, fetchRoles, fetchFeatures]);

    useEffect(() => {
        const role = roles.find(r => r.name === selectedRole);
        if (role) setRolePermissions({ ...role.permissions });
    }, [selectedRole, roles]);

    function togglePermission(feature: string, action: Action) {
        setRolePermissions(prev => {
            const cur = prev[feature] ?? [];
            return { ...prev, [feature]: cur.includes(action) ? cur.filter(a => a !== action) : [...cur, action] };
        });
    }

    async function saveRolePermissions() {
        setSavingRole(true);
        try {
            const role = roles.find(r => r.name === selectedRole);
            const res = await fetch(`/api/roles/${selectedRole}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissions: rolePermissions, label: role?.label, description: role?.description }),
            });
            if (res.ok) { await fetchRoles(); showToast(`${role?.label ?? selectedRole} saved.`, 'success'); }
            else showToast((await res.json()).message || 'Failed.', 'error');
        } finally { setSavingRole(false); }
    }

    async function handleCreateRole(e: React.FormEvent) {
        e.preventDefault(); setRoleError(''); setRoleLoading(true);
        try {
            const res = await fetch('/api/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newRole, permissions: {} }),
            });
            const data = await res.json();
            if (!res.ok) { setRoleError(data.message); return; }
            setShowCreateRole(false); setNewRole(EMPTY_NEW_ROLE);
            await fetchRoles(); showToast(`Role "${newRole.label}" created.`, 'success');
            setSelectedRole(newRole.name);
        } catch { setRoleError('Unexpected error.'); }
        finally { setRoleLoading(false); }
    }

    async function handleDeleteRole() {
        if (!deletingRole) return;
        const res = await fetch(`/api/roles/${deletingRole.name}`, { method: 'DELETE' });
        setShowDeleteRole(false);
        if (res.ok) { await fetchRoles(); showToast(`Role "${deletingRole.label}" deleted.`, 'success'); setSelectedRole('admin'); }
        else showToast((await res.json()).message || 'Failed.', 'error');
    }

    async function handleCreateFeature(e: React.FormEvent) {
        e.preventDefault(); setFeatureError(''); setFeatureLoading(true);
        try {
            const res = await fetch('/api/features', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFeature),
            });
            const data = await res.json();
            if (!res.ok) { setFeatureError(data.message); return; }
            setShowCreateFeature(false); setNewFeature(EMPTY_NEW_FEATURE);
            await fetchFeatures(); showToast(`Feature "${newFeature.label}" created.`, 'success');
        } catch { setFeatureError('Unexpected error.'); }
        finally { setFeatureLoading(false); }
    }

    async function handleDeleteFeature() {
        if (!deletingFeature) return;
        const res = await fetch(`/api/features/${deletingFeature.key}`, { method: 'DELETE' });
        setShowDeleteFeature(false);
        if (res.ok) { await fetchFeatures(); showToast(`Feature "${deletingFeature.label}" deleted.`, 'success'); }
        else showToast((await res.json()).message || 'Failed.', 'error');
    }

    async function handleAddUser(e: React.FormEvent) {
        e.preventDefault(); setAddError(''); setAddLoading(true);
        console.log("=== TRYING TO ADD USER ===", newUser);
        try {
            const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
            const textResponse = await res.text();
            console.log("=== API RESPONSE STATUS ===", res.status, "BODY ===", textResponse);

            let data;
            try { data = JSON.parse(textResponse); } catch (e) { data = { message: textResponse }; }

            if (!res.ok) { setAddError(data.message); return; }
            setShowAddUser(false); setNewUser(EMPTY_NEW_USER); await fetchUsers(); showToast('User created.', 'success');
        } catch (err) { console.error("=== FATAL ADD USER ERROR ===", err); setAddError('Unexpected error.'); }
        finally { setAddLoading(false); }
    }

    async function handleEditUser(e: React.FormEvent) {
        e.preventDefault(); if (!editingUser) return;
        setEditLoading(true);
        try {
            const res = await fetch(`/api/users/${editingUser._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roles: editRoles, email: editEmail }) }); // Changed role to roles
            if (!res.ok) { showToast('Error updating user', 'error'); return; }
            setShowEditUser(false); await fetchUsers(); showToast('User updated', 'success');
        } catch { showToast('Unexpected error', 'error'); }
        finally { setEditLoading(false); }
    }

    async function handleDeleteUser() {
        if (!deletingUser) return;
        const res = await fetch(`/api/users/${deletingUser._id}`, { method: 'DELETE' });
        setShowDeleteUser(false);
        if (res.ok) { await fetchUsers(); showToast('User deleted.', 'success'); }
        else showToast((await res.json()).message || 'Failed.', 'error');
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault(); if (!resetPwUser) return; setResetLoading(true);
        try {
            const res = await fetch(`/api/users/${resetPwUser._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newPassword }) });
            if (res.ok) { setShowResetPw(false); setNewPassword(''); showToast('Password reset.', 'success'); }
            else showToast((await res.json()).message || 'Failed.', 'error');
        } finally { setResetLoading(false); }
    }

    const roleStats = roles.map(r => ({
        ...r,
        count: users.filter(u => u.roles?.includes(r.name) || u.role === r.name).length // Updated to check roles array
    }));
    const customFeatures = features.filter(f => !f.isSystem);
    const detailRole = roles.find(r => r.name === detailUser?.role); // Kept for detailUser, which might still use single role

    // All features for permission matrix (system + custom from DB)
    const allFeatureKeys = features.map(f => f.key);
    const featureLabelFor = (key: string) => features.find(f => f.key === key)?.label ?? FEATURE_LABELS[key as FeatureKey] ?? key;

    return (
        <DashboardLayout user={currentUser}>
            <main className="flex-1 p-6 md:p-10 max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <div className="rounded-xl bg-blue-100 dark:bg-blue-900/30 p-2"><Shield className="h-7 w-7 text-blue-600 dark:text-blue-400" /></div>
                            User Management
                        </h1>
                        <p className="text-muted-foreground mt-1 ml-[52px]">Manage users, roles, and feature-level permissions.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { fetchUsers(); fetchRoles(); fetchFeatures(); }} className="gap-2 self-start sm:self-auto">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                </div>

                {!isAdmin && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-4 text-amber-800 dark:text-amber-300">
                        <Info className="h-5 w-5 shrink-0" />
                        <span className="text-sm">Read-only access. Only administrators can create, edit, or delete users, roles, and features.</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-32"><Loader2 className="h-10 w-10 animate-spin text-muted-foreground" /></div>
                ) : (
                    <>
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                            <Card className="col-span-2 md:col-span-1 border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background">
                                <CardContent className="p-4">
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{users.length}</div>
                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Users className="h-3 w-3" /> Total Users</div>
                                </CardContent>
                            </Card>
                            {roleStats.map(r => (
                                <Card key={r.name} className="bg-muted/40">
                                    <CardContent className="p-4">
                                        <div className="text-2xl font-bold">{r.count}</div>
                                        <div className="text-xs text-muted-foreground mt-1 truncate">{r.label}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Tabs defaultValue="users" className="space-y-6">
                            <TabsList className="grid w-full max-w-xl grid-cols-4">
                                <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm"><Users className="h-3.5 w-3.5" /> Users</TabsTrigger>
                                <TabsTrigger value="roles" className="gap-1.5 text-xs sm:text-sm"><Lock className="h-3.5 w-3.5" /> Roles</TabsTrigger>
                                <TabsTrigger value="features" className="gap-1.5 text-xs sm:text-sm"><Tag className="h-3.5 w-3.5" /> Features</TabsTrigger>
                                <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm"><ShieldCheck className="h-3.5 w-3.5" /> Overview</TabsTrigger>
                            </TabsList>

                            {/* ══ USERS TAB ══ */}
                            <TabsContent value="users" className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">{users.length} user{users.length !== 1 ? 's' : ''} registered</p>
                                    {isAdmin && (
                                        <Button onClick={() => { setNewUser(EMPTY_NEW_USER); setAddError(''); setShowPw(false); setShowAddUser(true); }} className="gap-2">
                                            <UserPlus className="h-4 w-4" /> Add User
                                        </Button>
                                    )}
                                </div>
                                <Card>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Username</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead>Created By</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map(u => (
                                                <TableRow key={u._id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                                {u.username.charAt(0).toUpperCase()}
                                                            </div>
                                                            {u.username}
                                                            {u._id === currentUser?._id && <Badge variant="outline" className="text-[10px] py-0 h-4">you</Badge>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">{u.email || '—'}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {(u.roles || (u.role ? [u.role] : ['viewer'])).map((roleKey: string) => (
                                                                <RoleChip key={roleKey} role={roleKey} label={roles.find(r => r.name === roleKey)?.label ?? roleKey} />
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">{u.createdBy || '—'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button variant="ghost" size="icon" title="View capabilities" onClick={() => { setDetailUser(u); setShowUserDetail(true); }} className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                                                            {isAdmin && (
                                                                <>
                                                                    <Button variant="ghost" size="icon" title="Edit" onClick={() => { setEditingUser(u); setEditRoles(u.roles || (u.role ? [u.role] : ['viewer'])); setEditEmail(u.email ?? ''); setShowEditUser(true); }} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                                                                    <Button variant="ghost" size="icon" title="Reset password" onClick={() => { setResetPwUser(u); setNewPassword(''); setShowPw(false); setShowResetPw(true); }} className="h-8 w-8"><KeyRound className="h-4 w-4" /></Button>
                                                                    <Button variant="ghost" size="icon" title="Delete" disabled={u._id === currentUser?._id} onClick={() => { setDeletingUser(u); setShowDeleteUser(true); }} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30"><Trash2 className="h-4 w-4" /></Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {users.length === 0 && (
                                                <TableRow><TableCell colSpan={6} className="py-16 text-center text-muted-foreground"><Users className="h-10 w-10 mx-auto mb-3 opacity-20" />No users found.</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </TabsContent>

                            {/* ══ ROLES TAB ══ */}
                            <TabsContent value="roles" className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    <div className="space-y-2 min-w-[220px]">
                                        <Label className="text-sm font-medium">Select Role to Configure</Label>
                                        <div className="flex gap-2">
                                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {roles.map(r => (
                                                        <SelectItem key={r.name} value={r.name}>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`inline-block h-2 w-2 rounded-full ${r.pluginId ? 'bg-green-500' : r.isDefault === false ? 'bg-orange-500' : r.name === 'admin' ? 'bg-red-500' : r.name === 'release_engineer' ? 'bg-blue-500' : r.name === 'platform_engineer' ? 'bg-purple-500' : r.name === 'auditor' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                                                                {r.label}
                                                                {r.pluginId && <span className="text-[10px] text-muted-foreground">(plugin)</span>}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {isAdmin && (
                                                <Button variant="outline" size="icon" title="Create new role" onClick={() => { setNewRole(EMPTY_NEW_ROLE); setRoleError(''); setShowCreateRole(true); }}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {roles.find(r => r.name === selectedRole) && (
                                        <Card className="flex-1 bg-muted/40">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <RoleChip role={selectedRole} label={roles.find(r => r.name === selectedRole)?.label ?? selectedRole} />
                                                        <span className="text-xs text-muted-foreground">{users.filter(u => u.role === selectedRole).length} user(s)</span>
                                                        {roles.find(r => r.name === selectedRole)?.pluginId && (
                                                            <Badge variant="outline" className="text-[10px]"><Puzzle className="h-2.5 w-2.5 mr-1" />Plugin</Badge>
                                                        )}
                                                    </div>
                                                    {isAdmin && !roles.find(r => r.name === selectedRole)?.isDefault && selectedRole !== 'admin' && !['admin', 'release_engineer', 'platform_engineer', 'auditor', 'viewer'].includes(selectedRole) && (
                                                        <Button variant="ghost" size="sm" className="text-red-500 h-7 px-2 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => { setDeletingRole(roles.find(r => r.name === selectedRole) ?? null); setShowDeleteRole(true); }}>
                                                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Role
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{roles.find(r => r.name === selectedRole)?.description || 'No description.'}</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4 text-muted-foreground" />Permission Matrix</CardTitle>
                                            {isAdmin && (
                                                <Button onClick={saveRolePermissions} disabled={savingRole || selectedRole === 'admin'} size="sm" className="gap-2">
                                                    {savingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                                    Save Permissions
                                                </Button>
                                            )}
                                        </div>
                                        <CardDescription>
                                            {selectedRole === 'admin' ? 'Administrator always has full access to all features.' : isAdmin ? 'Check/uncheck to grant or revoke access. Click Save when done.' : 'Read-only permission view.'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/30">
                                                        <TableHead className="w-52 font-semibold">Feature</TableHead>
                                                        <TableHead className="w-16 font-semibold text-xs text-muted-foreground">Source</TableHead>
                                                        {ACTIONS.map(a => <TableHead key={a} className="text-center capitalize font-semibold w-24">{a}</TableHead>)}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {allFeatureKeys.map(fKey => {
                                                        const perms = rolePermissions[fKey] ?? [];
                                                        const feat = features.find(f => f.key === fKey);
                                                        return (
                                                            <TableRow key={fKey} className="hover:bg-muted/20">
                                                                <TableCell className="font-medium text-sm py-3">{featureLabelFor(fKey)}</TableCell>
                                                                <TableCell className="py-3">
                                                                    {feat?.pluginId ? <Badge variant="outline" className="text-[9px] py-0 h-4 gap-1"><Puzzle className="h-2 w-2" />Plugin</Badge> : feat?.isSystem ? <span className="text-[10px] text-muted-foreground">System</span> : <Badge variant="outline" className="text-[9px] py-0 h-4">Custom</Badge>}
                                                                </TableCell>
                                                                {ACTIONS.map(action => (
                                                                    <TableCell key={action} className="text-center py-3">
                                                                        {isAdmin && selectedRole !== 'admin' ? (
                                                                            <Checkbox checked={perms.includes(action)} onCheckedChange={() => togglePermission(fKey, action)} aria-label={`${action} ${fKey}`} />
                                                                        ) : (
                                                                            <PermBadge allowed={selectedRole === 'admin' || perms.includes(action)} />
                                                                        )}
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* ══ FEATURES TAB ══ */}
                            <TabsContent value="features" className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{features.length} features ({SYSTEM_FEATURES.length} system, {customFeatures.length} custom)</p>
                                    </div>
                                    {isAdmin && (
                                        <Button onClick={() => { setNewFeature(EMPTY_NEW_FEATURE); setFeatureError(''); setShowCreateFeature(true); }} className="gap-2">
                                            <Plus className="h-4 w-4" /> Add Feature
                                        </Button>
                                    )}
                                </div>
                                <Card>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Key</TableHead>
                                                <TableHead>Label</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Source</TableHead>
                                                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {features.map(f => (
                                                <TableRow key={f.key}>
                                                    <TableCell className="font-mono text-xs">{f.key}</TableCell>
                                                    <TableCell className="font-medium">{f.label}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">{f.description || '—'}</TableCell>
                                                    <TableCell>
                                                        {f.pluginId ? (
                                                            <Badge variant="outline" className="gap-1 text-[10px]"><Puzzle className="h-2.5 w-2.5" />{f.pluginId}</Badge>
                                                        ) : f.isSystem ? (
                                                            <Badge variant="secondary" className="text-[10px]"><Settings2 className="h-2.5 w-2.5 mr-1" />System</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px]">Custom</Badge>
                                                        )}
                                                    </TableCell>
                                                    {isAdmin && (
                                                        <TableCell className="text-right">
                                                            {!f.isSystem && (
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => { setDeletingFeature(f); setShowDeleteFeature(true); }}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </TabsContent>

                            {/* ══ OVERVIEW TAB ══ */}
                            <TabsContent value="overview" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-muted-foreground" />All Roles Permissions Overview</CardTitle>
                                        <CardDescription>Compare what every role can and cannot do across all features.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/30">
                                                        <TableHead className="w-44 font-semibold sticky left-0 bg-background z-10">Feature</TableHead>
                                                        <TableHead className="w-20 text-center text-xs font-semibold">Action</TableHead>
                                                        {roles.map(r => <TableHead key={r.name} className="text-center min-w-[110px]"><RoleChip role={r.name} label={r.label} /></TableHead>)}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {allFeatureKeys.map(fKey => (
                                                        ACTIONS.map((action, ai) => (
                                                            <TableRow key={`${fKey}-${action}`} className={ai === 0 ? 'border-t-2' : ''}>
                                                                <TableCell className={`text-sm sticky left-0 bg-background z-10 ${ai === 0 ? 'font-semibold pt-3' : 'text-muted-foreground pt-1'}`}>{ai === 0 ? featureLabelFor(fKey) : ''}</TableCell>
                                                                <TableCell className="text-center text-xs text-muted-foreground capitalize py-1.5">{action}</TableCell>
                                                                {roles.map(r => (
                                                                    <TableCell key={r.name} className="text-center py-1.5">
                                                                        <PermBadge allowed={isAdminRole(r.name) || (r.permissions[fKey] ?? []).includes(action)} />
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        ))
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </>
                )}

                {/* ── Add User Dialog ── */}
                <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Add New User</DialogTitle>
                            <DialogDescription>Create a new user account with an assigned role.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddUser} className="space-y-4 mt-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><Label htmlFor="nu-username">Username *</Label><Input id="nu-username" required value={newUser.username} onChange={e => setNewUser(f => ({ ...f, username: e.target.value }))} placeholder="john.doe" /></div>
                                <div className="space-y-1.5"><Label htmlFor="nu-email">Email</Label><Input id="nu-email" type="email" value={newUser.email} onChange={e => setNewUser(f => ({ ...f, email: e.target.value }))} placeholder="john@acme.com" /></div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="nu-password">Password *</Label>
                                <div className="relative"><Input id="nu-password" type={showPw ? 'text' : 'password'} required value={newUser.password} onChange={e => setNewUser(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 chars" /><button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Roles *</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                                    {roles.map(r => (
                                        <div key={r.name} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`nu-role-${r.name}`}
                                                checked={newUser.roles?.includes(r.name) ?? false}
                                                onCheckedChange={(c) => {
                                                    setNewUser(prev => {
                                                        const currentRoles = prev.roles || [];
                                                        const newRoles = c ? [...currentRoles, r.name] : currentRoles.filter(x => x !== r.name);
                                                        return { ...prev, roles: newRoles.length ? newRoles : ['viewer'] };
                                                    });
                                                }}
                                            />
                                            <Label htmlFor={`nu-role-${r.name}`} className="text-sm cursor-pointer font-normal">{r.label}</Label>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">Select one or more roles.</p>
                            </div>
                            {addError && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-900"><AlertCircle className="h-4 w-4 shrink-0" />{addError}</div>}
                            <DialogFooter><Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button><Button type="submit" disabled={addLoading} className="gap-2">{addLoading && <Loader2 className="h-4 w-4 animate-spin" />}Create User</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ── Edit User Dialog ── */}
                <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
                    <DialogContent>
                        <DialogHeader><DialogTitle className="flex items-center gap-2"><UserCog className="h-5 w-5" /> Edit: <strong>{editingUser?.username}</strong></DialogTitle></DialogHeader>
                        <form onSubmit={handleEditUser} className="space-y-4 mt-2">
                            <div className="space-y-1.5"><Label htmlFor="eu-email">Email</Label><Input id="eu-email" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} /></div>
                            <div className="space-y-1.5">
                                <Label>Roles</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                                    {roles.map(r => (
                                        <div key={r.name} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`eu-role-${r.name}`}
                                                checked={editRoles.includes(r.name)}
                                                onCheckedChange={(c) => {
                                                    setEditRoles(prev => {
                                                        const newRoles = c ? [...prev, r.name] : prev.filter(x => x !== r.name);
                                                        return newRoles.length ? newRoles : ['viewer'];
                                                    });
                                                }}
                                            />
                                            <Label htmlFor={`eu-role-${r.name}`} className="text-sm cursor-pointer font-normal">{r.label}</Label>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">Select one or more roles.</p>
                            </div>
                            <DialogFooter><Button type="button" variant="outline" onClick={() => setShowEditUser(false)}>Cancel</Button><Button type="submit" disabled={editLoading} className="gap-2">{editLoading && <Loader2 className="h-4 w-4 animate-spin" />}Save</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ── Reset Password Dialog ── */}
                <Dialog open={showResetPw} onOpenChange={setShowResetPw}>
                    <DialogContent>
                        <DialogHeader><DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Reset Password — {resetPwUser?.username}</DialogTitle></DialogHeader>
                        <form onSubmit={handleResetPassword} className="space-y-4 mt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="rp-pw">New Password</Label>
                                <div className="relative"><Input id="rp-pw" type={showPw ? 'text' : 'password'} required minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)} /><button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
                            </div>
                            <DialogFooter><Button type="button" variant="outline" onClick={() => setShowResetPw(false)}>Cancel</Button><Button type="submit" disabled={resetLoading} className="gap-2">{resetLoading && <Loader2 className="h-4 w-4 animate-spin" />}Reset</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ── Create Role Dialog ── */}
                <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Create New Role</DialogTitle>
                            <DialogDescription>Define a custom role. You can configure its permissions after creation.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateRole} className="space-y-4 mt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="cr-name">Role Key *</Label>
                                <Input id="cr-name" required value={newRole.name} onChange={e => setNewRole(f => ({ ...f, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') }))} placeholder="e.g. support_engineer" />
                                <p className="text-xs text-muted-foreground">Lowercase letters, numbers, underscores only.</p>
                            </div>
                            <div className="space-y-1.5"><Label htmlFor="cr-label">Display Name *</Label><Input id="cr-label" required value={newRole.label} onChange={e => setNewRole(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Support Engineer" /></div>
                            <div className="space-y-1.5"><Label htmlFor="cr-desc">Description</Label><Textarea id="cr-desc" value={newRole.description} onChange={e => setNewRole(f => ({ ...f, description: e.target.value }))} placeholder="Describe what this role can do..." rows={3} /></div>
                            {roleError && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:text-red-400 dark:border-red-900"><AlertCircle className="h-4 w-4 shrink-0" />{roleError}</div>}
                            <DialogFooter><Button type="button" variant="outline" onClick={() => setShowCreateRole(false)}>Cancel</Button><Button type="submit" disabled={roleLoading} className="gap-2">{roleLoading && <Loader2 className="h-4 w-4 animate-spin" />}Create Role</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ── Create Feature Dialog ── */}
                <Dialog open={showCreateFeature} onOpenChange={setShowCreateFeature}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><Tag className="h-5 w-5" /> Add Custom Feature</DialogTitle>
                            <DialogDescription>Create a custom feature that will appear in all role permission matrices.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateFeature} className="space-y-4 mt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="cf-key">Feature Key *</Label>
                                <Input id="cf-key" required value={newFeature.key} onChange={e => setNewFeature(f => ({ ...f, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') }))} placeholder="e.g. incident_management" />
                                <p className="text-xs text-muted-foreground">Lowercase letters, numbers, underscores only.</p>
                            </div>
                            <div className="space-y-1.5"><Label htmlFor="cf-label">Display Label *</Label><Input id="cf-label" required value={newFeature.label} onChange={e => setNewFeature(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Incident Management" /></div>
                            <div className="space-y-1.5"><Label htmlFor="cf-desc">Description</Label><Textarea id="cf-desc" value={newFeature.description} onChange={e => setNewFeature(f => ({ ...f, description: e.target.value }))} placeholder="What does this feature cover?" rows={2} /></div>
                            {featureError && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:text-red-400 dark:border-red-900"><AlertCircle className="h-4 w-4 shrink-0" />{featureError}</div>}
                            <DialogFooter><Button type="button" variant="outline" onClick={() => setShowCreateFeature(false)}>Cancel</Button><Button type="submit" disabled={featureLoading} className="gap-2">{featureLoading && <Loader2 className="h-4 w-4 animate-spin" />}Add Feature</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ── User Capabilities Detail ── */}
                <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">{detailUser?.username?.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div className="mb-1">{detailUser?.username}</div>
                                    <div className="flex gap-1">
                                        {(detailUser?.roles || (detailUser?.role ? [detailUser.role] : ['viewer'])).map((roleKey: string) => (
                                            <RoleChip key={roleKey} role={roleKey} label={roles.find(r => r.name === roleKey)?.label ?? roleKey} />
                                        ))}
                                    </div>
                                </div>
                            </DialogTitle>
                            <DialogDescription>User permissions are the combined set of all assigned roles.</DialogDescription>
                        </DialogHeader>
                        <div className="mt-2">
                            {isAdminRole(detailUser?.roles || detailUser?.role) ? (
                                <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-4 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 shrink-0" /> This user is an Administrator with <strong>full access</strong> to all features.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader><TableRow><TableHead>Feature</TableHead>{ACTIONS.map(a => <TableHead key={a} className="text-center capitalize">{a}</TableHead>)}</TableRow></TableHeader>
                                    <TableBody>
                                        {allFeatureKeys.map(fKey => {
                                            const userRolesToUse = detailUser?.roles || (detailUser?.role ? [detailUser.role] : ['viewer']);

                                            // Check across all of user's roles
                                            const hasAction = (a: Action) => {
                                                return userRolesToUse.some(r => {
                                                    const roleDef = roles.find(dbRole => dbRole.name === r);
                                                    return roleDef?.permissions[fKey]?.includes(a);
                                                });
                                            };

                                            const any = ACTIONS.some(a => hasAction(a));
                                            return (
                                                <TableRow key={fKey} className={any ? '' : 'opacity-40'}>
                                                    <TableCell className="font-medium text-sm">{featureLabelFor(fKey)}</TableCell>
                                                    {ACTIONS.map(a => <TableCell key={a} className="text-center"><PermBadge allowed={hasAction(a)} /></TableCell>)}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ── Delete Confirmations ── */}
                <AlertDialog open={showDeleteUser} onOpenChange={setShowDeleteUser}>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete {deletingUser?.username}?</AlertDialogTitle><AlertDialogDescription>This will permanently remove the user. They lose access immediately.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">Delete User</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={showDeleteRole} onOpenChange={setShowDeleteRole}>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete Role: {deletingRole?.label}?</AlertDialogTitle><AlertDialogDescription>This cannot be undone. Users with this role will retain this role ID but lose associated permissions.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteRole} className="bg-red-600 hover:bg-red-700">Delete Role</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={showDeleteFeature} onOpenChange={setShowDeleteFeature}>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete Feature: {deletingFeature?.label}?</AlertDialogTitle><AlertDialogDescription>This will remove the feature from all permission matrices. Existing role permissions referencing this feature key will be retained in the DB.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteFeature} className="bg-red-600 hover:bg-red-700">Delete Feature</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
            </main>
        </DashboardLayout>
    );
}
