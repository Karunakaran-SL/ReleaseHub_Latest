'use client';

import { hasPermission, canView, canCreate, canEdit, canDelete } from '@/lib/rbac';
import type { Action, FeatureKey } from '@/lib/permissions';

interface RbacGuardProps {
    userRole: string[] | string | undefined | null;
    feature: FeatureKey | string;
    action: Action;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on the user's role permission.
 * If the user lacks the required permission, renders `fallback` (default: null).
 *
 * Usage:
 *   <RbacGuard userRole={user?.role} feature="products" action="create">
 *     <Button>New Product</Button>
 *   </RbacGuard>
 */
export function RbacGuard({ userRole, feature, action, children, fallback = null }: RbacGuardProps) {
    if (!hasPermission(userRole, feature, action)) {
        return <>{fallback}</>;
    }
    return <>{children}</>;
}

/** Guard that shows children only if user.role === 'admin' */
export function AdminOnly({ userRole, children, fallback = null }: { userRole?: string | null; children: React.ReactNode; fallback?: React.ReactNode }) {
    if (userRole !== 'admin') return <>{fallback}</>;
    return <>{children}</>;
}

// Re-export helpers for convenience
export { hasPermission, canView, canCreate, canEdit, canDelete };
