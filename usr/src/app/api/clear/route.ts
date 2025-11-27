
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const collectionsToClear = [
    'products',
    'cmdb_tenants',
    'cmdb_components',
    'cmdb_applications',
    'cmdb_interfaces',
    'cmdb_interface_types',
    'specifications',
    'audits',
    'baselines',
    'dependency_trees',
    'workflows',
    'compliance_checks',
    'deployment_types',
    'cmdb',
    'deployments',
    'licenses',
    'product_licensing',
    'specification_cpu_types',
    'specification_gpu_types',
    'specification_disk_types',
    'specification_hw_types',
    'specification_hypervisors',
    'specification_network_cards',
    'specification_plug_power_cords',
    'specification_vendors',
    'service_contracts',
    'settings_application_onboarding',
    'settings_component_onboarding',
    'settings_tenant_onboarding',
    'settings_baseline_onboarding',
    'settings_approval_product_onboarding',
    'settings_approval_tenant_approval',
    'settings_approval_components_approval',
    'settings_approval_application_approval',
    'settings_approval_interface_approval',
    'settings_approval_baseline_approval',
    'settings_approval_deployment_approval',
    'settings_approval_upgrade_approval',
    'settings_approval_migration_approval',
    'settings_approval_decommission_approval',
    'settings_approval_license_approval',
    'settings_approval_export_control_approval',
    'settings_approval_security_approval',
    'platform_foundations',
    'development_environments',
    'test_environments',
    'simulators',
    'emulators',
    'sdk_apps',
    'upgrade_history',
    'app_catalog',
    'users'
];

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();
        
        let clearedCollections = [];
        let failedCollections = [];

        for (const collectionName of collectionsToClear) {
            try {
                await db.collection(collectionName).deleteMany({});
                clearedCollections.push(collectionName);
            } catch (error) {
                // It's possible a collection doesn't exist, which is not a critical failure.
                // We can log it but continue.
                console.warn(`Could not clear collection ${collectionName}, it might not exist.`);
            }
        }
        
        // A simple check to see if at least some core collections were cleared
        const productsCount = await db.collection('products').countDocuments();
        if(productsCount > 0) {
             return NextResponse.json({ 
                message: `Cleanup operation might have failed. Some collections were not cleared.` 
            }, { status: 500 });
        }
        
        await logAuditEvent({
            action: 'DELETE',
            entity: 'database',
            entityId: 'all',
            comment: `All data cleared from specified collections.`,
        });


        return NextResponse.json({ message: `Successfully cleared data from specified collections.` }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
