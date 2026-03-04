// ============================================================
// RBAC Helper utilities
// ============================================================

import { DEFAULT_ROLES, type Action, type FeatureKey } from './permissions';
import { isAdminRole, normalizeRole } from './role-utils';

// In-memory roles cache (populated from DB when available)
let _rolesCache: Record<string, { permissions: Record<string, Action[]> }> | null = null;

export function setRolesCache(roles: Record<string, { permissions: Record<string, Action[]> }>) {
    _rolesCache = roles;
}

export function clearRolesCache() {
    _rolesCache = null;
}

function getRolePermissions(role: string): Record<string, Action[]> {
    if (_rolesCache && _rolesCache[role]) {
        return _rolesCache[role].permissions;
    }
    return (DEFAULT_ROLES[role]?.permissions ?? {}) as Record<string, Action[]>;
}

/**
 * Check if a role has a specific permission action on a feature.
 * Admins always have full access.
 */
export function hasPermission(
    userRole: string | undefined | null,
    feature: FeatureKey | string,
    action: Action
): boolean {
    if (!userRole) return false;
    if (isAdminRole(userRole)) return true;
    const normalized = normalizeRole(userRole);
    const permissions = getRolePermissions(normalized);
    const actions = permissions[feature] ?? [];
    return actions.includes(action);
}

/** Shorthand: can the role view a feature? */
export function canView(userRole: string | undefined | null, feature: FeatureKey | string): boolean {
    return hasPermission(userRole, feature, 'view');
}

/** Shorthand: can the role create in a feature? */
export function canCreate(userRole: string | undefined | null, feature: FeatureKey | string): boolean {
    return hasPermission(userRole, feature, 'create');
}

/** Shorthand: can the role edit in a feature? */
export function canEdit(userRole: string | undefined | null, feature: FeatureKey | string): boolean {
    return hasPermission(userRole, feature, 'edit');
}

/** Shorthand: can the role delete in a feature? */
export function canDelete(userRole: string | undefined | null, feature: FeatureKey | string): boolean {
    return hasPermission(userRole, feature, 'delete');
}
