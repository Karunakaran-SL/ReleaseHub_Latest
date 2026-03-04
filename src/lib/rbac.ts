// ============================================================
// RBAC Helper utilities
// ============================================================

import { DEFAULT_ROLES, type Action, type FeatureKey } from './permissions';
import { isAdminRole, normalizeRoles } from './role-utils';

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
 * Check if ANY of the user's roles has a specific permission action on a feature.
 * Admins always have full access.
 */
export function hasPermission(
    userRoles: string[] | string | undefined | null,
    feature: FeatureKey | string,
    action: Action
): boolean {
    if (!userRoles) return false;
    if (isAdminRole(userRoles)) return true;

    const normalizedRoles = normalizeRoles(userRoles);

    // Return true if ANY role grants this permission
    return normalizedRoles.some(role => {
        const permissions = getRolePermissions(role);
        const actions = permissions[feature] ?? [];
        return actions.includes(action);
    });
}

/** Shorthand: can the roles view a feature? */
export function canView(userRoles: string[] | string | undefined | null, feature: FeatureKey | string): boolean {
    return hasPermission(userRoles, feature, 'view');
}

/** Shorthand: can the roles create in a feature? */
export function canCreate(userRoles: string[] | string | undefined | null, feature: FeatureKey | string): boolean {
    return hasPermission(userRoles, feature, 'create');
}

/** Shorthand: can the roles edit in a feature? */
export function canEdit(userRoles: string[] | string | undefined | null, feature: FeatureKey | string): boolean {
    return hasPermission(userRoles, feature, 'edit');
}

/** Shorthand: can the roles delete in a feature? */
export function canDelete(userRoles: string[] | string | undefined | null, feature: FeatureKey | string): boolean {
    return hasPermission(userRoles, feature, 'delete');
}
