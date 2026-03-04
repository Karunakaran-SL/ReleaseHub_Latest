/**
 * Normalizes an array of raw role strings (or a single legacy string) to an array of internal role keys.
 * Handles legacy role names and case variants.
 */
export function normalizeRoles(raw: string[] | string | undefined | null): string[] {
    if (!raw) return ['viewer'];
    const rolesArray = Array.isArray(raw) ? raw : [raw];
    if (rolesArray.length === 0) return ['viewer'];

    return rolesArray.map(rStr => {
        const r = rStr.trim().toLowerCase();
        if (r === 'admin' || r === 'administrator') return 'admin';
        if (r === 'release_engineer' || r === 'release engineer') return 'release_engineer';
        if (r === 'platform_engineer' || r === 'platform engineer') return 'platform_engineer';
        if (r === 'auditor') return 'auditor';
        if (r === 'viewer') return 'viewer';
        return r;
    });
}

/** Returns true if any role in the array represents an admin, regardless of casing. */
export function isAdminRole(roles: string[] | string | undefined | null): boolean {
    if (!roles) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.some(role => {
        const r = role.trim().toLowerCase();
        return r === 'admin' || r === 'administrator';
    });
}
