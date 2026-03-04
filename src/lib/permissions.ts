// ============================================================
// RBAC: Features & Default Role Permissions Registry
// ============================================================

export const FEATURES = {
    DASHBOARD: 'dashboard',
    PRODUCTS: 'products',
    SPECIFICATIONS: 'specifications',
    DOCUMENTS: 'documents',
    PLATFORM_ENGINEERING: 'platform_engineering',
    CICD: 'cicd',
    CMDB: 'cmdb',
    RELEASE_MANAGEMENT: 'release_management',
    FLEET_MANAGEMENT: 'fleet_management',
    LICENSE: 'license',
    WORKFLOWS: 'workflows',
    COMPLIANCE: 'compliance',
    AUDITS: 'audits',
    SETTINGS: 'settings',
    USER_MANAGEMENT: 'user_management',
} as const;

export type FeatureKey = typeof FEATURES[keyof typeof FEATURES];
export type Action = 'view' | 'create' | 'edit' | 'delete';

export type FeaturePermissions = {
    [K in FeatureKey]?: Action[];
};

export type RoleDefinition = {
    label: string;
    description: string;
    permissions: FeaturePermissions;
};

export type RolesRegistry = {
    [role: string]: RoleDefinition;
};

// All actions shorthand
const ALL: Action[] = ['view', 'create', 'edit', 'delete'];
const VIEW_ONLY: Action[] = ['view'];
const VIEW_EDIT: Action[] = ['view', 'create', 'edit'];

export const DEFAULT_ROLES: RolesRegistry = {
    admin: {
        label: 'Administrator',
        description: 'Full access to all features including user and system management.',
        permissions: {
            dashboard: ALL,
            products: ALL,
            specifications: ALL,
            documents: ALL,
            platform_engineering: ALL,
            cicd: ALL,
            cmdb: ALL,
            release_management: ALL,
            fleet_management: ALL,
            license: ALL,
            workflows: ALL,
            compliance: ALL,
            audits: ALL,
            settings: ALL,
            user_management: ALL,
        },
    },
    release_engineer: {
        label: 'Release Engineer',
        description: 'Manages products, baselines, specifications, and deployments.',
        permissions: {
            dashboard: ALL,
            products: ALL,
            specifications: ALL,
            documents: VIEW_EDIT,
            platform_engineering: VIEW_ONLY,
            cicd: VIEW_ONLY,
            cmdb: VIEW_ONLY,
            release_management: ALL,
            fleet_management: ALL,
            license: VIEW_ONLY,
            workflows: VIEW_EDIT,
            compliance: VIEW_ONLY,
            audits: VIEW_ONLY,
            settings: VIEW_ONLY,
            user_management: [],
        },
    },
    platform_engineer: {
        label: 'Platform Engineer',
        description: 'Manages CMDB, platform engineering, and environments.',
        permissions: {
            dashboard: ALL,
            products: VIEW_ONLY,
            specifications: VIEW_EDIT,
            documents: VIEW_EDIT,
            platform_engineering: ALL,
            cicd: ALL,
            cmdb: ALL,
            release_management: VIEW_ONLY,
            fleet_management: VIEW_ONLY,
            license: VIEW_ONLY,
            workflows: VIEW_EDIT,
            compliance: VIEW_ONLY,
            audits: VIEW_ONLY,
            settings: VIEW_ONLY,
            user_management: [],
        },
    },
    auditor: {
        label: 'Auditor',
        description: 'Read-only access with full access to audits and compliance.',
        permissions: {
            dashboard: VIEW_ONLY,
            products: VIEW_ONLY,
            specifications: VIEW_ONLY,
            documents: VIEW_ONLY,
            platform_engineering: VIEW_ONLY,
            cicd: VIEW_ONLY,
            cmdb: VIEW_ONLY,
            release_management: VIEW_ONLY,
            fleet_management: VIEW_ONLY,
            license: VIEW_ONLY,
            workflows: VIEW_ONLY,
            compliance: ALL,
            audits: ALL,
            settings: VIEW_ONLY,
            user_management: [],
        },
    },
    viewer: {
        label: 'Viewer',
        description: 'Read-only access to all features.',
        permissions: {
            dashboard: VIEW_ONLY,
            products: VIEW_ONLY,
            specifications: VIEW_ONLY,
            documents: VIEW_ONLY,
            platform_engineering: VIEW_ONLY,
            cicd: VIEW_ONLY,
            cmdb: VIEW_ONLY,
            release_management: VIEW_ONLY,
            fleet_management: VIEW_ONLY,
            license: VIEW_ONLY,
            workflows: VIEW_ONLY,
            compliance: VIEW_ONLY,
            audits: VIEW_ONLY,
            settings: VIEW_ONLY,
            user_management: [],
        },
    },
};

export const FEATURE_LABELS: Record<FeatureKey, string> = {
    dashboard: 'Dashboard',
    products: 'Products',
    specifications: 'Specifications',
    documents: 'Documents',
    platform_engineering: 'Platform Engineering',
    cicd: 'CI/CD',
    cmdb: 'CMDB',
    release_management: 'Release Management',
    fleet_management: 'Fleet Management',
    license: 'License',
    workflows: 'Workflows',
    compliance: 'Compliance',
    audits: 'Audits',
    settings: 'Settings',
    user_management: 'User Management',
};
