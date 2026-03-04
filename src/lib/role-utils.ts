/**
 * Normalizes a raw role string from the DB to our internal role key.
 * Handles legacy role names and case variants.
 */
export function normalizeRole(raw: string | undefined | null): string {
    if (!raw) return 'viewer';
    const r = raw.trim().toLowerCase();
    if (r === 'admin' || r === 'administrator') return 'admin';
    if (r === 'release_engineer' || r === 'release engineer') return 'release_engineer';
    if (r === 'platform_engineer' || r === 'platform engineer') return 'platform_engineer';
    if (r === 'auditor') return 'auditor';
    if (r === 'viewer') return 'viewer';
    // Unknown roles fall back to viewer
    return 'viewer';
}

/** Returns true if the role string represents an admin, regardless of casing. */
export function isAdminRole(role: string | undefined | null): boolean {
    if (!role) return false;
    const r = role.trim().toLowerCase();
    return r === 'admin' || r === 'administrator';
}
