
import clientPromise from '@/lib/mongodb';
import type { AnyCmdbEntity, DependencyTree, Product, CmdbTenant, CmdbComponent, CmdbApplication, CmdbInterface, EntityType } from './definitions';

type AllData = {
    products: Product[];
    tenants: CmdbTenant[];
    components: CmdbComponent[];
    applications: CmdbApplication[];
    interfaces: CmdbInterface[];
    specifications: any[];
};

// Fetches all data from the database collections.
async function fetchAllData(): Promise<AllData> {
    const client = await clientPromise;
    const db = client.db();
    
    const [products, tenants, components, applications, interfaces, specifications] = await Promise.all([
        db.collection('products').find({}).toArray(),
        db.collection('cmdb_tenants').find({}).toArray(),
        db.collection('cmdb_components').find({}).toArray(),
        db.collection('cmdb_applications').find({}).toArray(),
        db.collection('cmdb_interfaces').find({}).toArray(),
        db.collection('specifications').find({}).toArray(),
    ]);

    return { 
        products: products as any, 
        tenants: tenants as any, 
        components: components as any, 
        applications: applications as any, 
        interfaces: interfaces as any,
        specifications: specifications as any
    };
}

// Generates a dependency tree for a single product.
export async function generateDependencyTree(product: Product, allData: AllData): Promise<DependencyTree> {
    const allEntitiesMap = new Map<string, AnyCmdbEntity>();
    allData.tenants.forEach(t => allEntitiesMap.set(t.id, { ...t, entityType: 'tenant' }));
    allData.components.forEach(c => allEntitiesMap.set(c.id, { ...c, entityType: 'component' }));
    allData.applications.forEach(a => allEntitiesMap.set(a.id, { ...a, entityType: 'application' }));
    allData.interfaces.forEach(i => allEntitiesMap.set(i.id, { ...i, entityType: 'interface' }));

    const visited = new Set<string>();
    const involvedTenants = new Map<string, CmdbTenant>();
    const involvedComponents = new Map<string, CmdbComponent>();
    const involvedApplications = new Map<string, CmdbApplication>();
    const involvedInterfaces = new Map<string, CmdbInterface>();

    // Start traversal from tenants associated with the product
    const initialTenantIds = allData.tenants.filter(t => t.products?.some(p => p.id === product.id)).map(t => t.id);
    const queue = [...initialTenantIds];

    initialTenantIds.forEach(id => visited.add(`tenant:${id}`));

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        const currentEntity = allEntitiesMap.get(currentId);

        if (!currentEntity) continue;

        if (currentEntity.entityType === 'tenant') {
            involvedTenants.set(currentId, currentEntity as CmdbTenant);
            const tenant = currentEntity as CmdbTenant;
            // Add dependent tenants to the queue
            tenant.dependent_tenants?.forEach(dep => {
                if (!visited.has(`tenant:${dep.id}`)) {
                    visited.add(`tenant:${dep.id}`);
                    queue.push(dep.id);
                }
            });
             // Find components & apps within this tenant and add to queue
            allData.components.forEach(c => {
                if (c.tenants?.some(t => t.id === tenant.id) && !visited.has(`component:${c.id}`)) {
                    visited.add(`component:${c.id}`);
                    queue.push(c.id);
                }
            });
            allData.applications.forEach(a => {
                if (a.tenants?.some(t => t.id === tenant.id) && !visited.has(`application:${a.id}`)) {
                    visited.add(`application:${a.id}`);
                    queue.push(a.id);
                }
            });

        } else if (currentEntity.entityType === 'component') {
            involvedComponents.set(currentId, currentEntity as CmdbComponent);
            const component = currentEntity as CmdbComponent;
            const deps = [
                ...(component.dependent_components || []).map(d => ({...d, type: 'component'})),
                ...(component.dependent_applications || []).map(d => ({...d, type: 'application'})),
                ...(component.dependent_interfaces || []).map(d => ({...d, type: 'interface'}))
            ];
            deps.forEach(dep => {
                if (!visited.has(`${dep.type}:${dep.id}`)) {
                    visited.add(`${dep.type}:${dep.id}`);
                    queue.push(dep.id);
                }
            });

        } else if (currentEntity.entityType === 'application') {
            involvedApplications.set(currentId, currentEntity as CmdbApplication);
            const application = currentEntity as CmdbApplication;
             const deps = [
                ...(application.dependent_components || []).map(d => ({...d, type: 'component'})),
                ...(application.dependent_applications || []).map(d => ({...d, type: 'application'})),
                ...(application.dependent_interfaces || []).map(d => ({...d, type: 'interface'}))
            ];
             deps.forEach(dep => {
                if (!visited.has(`${dep.type}:${dep.id}`)) {
                    visited.add(`${dep.type}:${dep.id}`);
                    queue.push(dep.id);
                }
            });
        } else if (currentEntity.entityType === 'interface') {
             involvedInterfaces.set(currentId, currentEntity as CmdbInterface);
        }
    }
    
    // Once all entities are collected, build the nested structure
    const finalTenants = Array.from(involvedTenants.values()).map(tenant => {
        const tenantComponents = allData.components.filter(c => c.tenants?.some(t => t.id === tenant.id) && involvedComponents.has(c.id));
        const tenantApplications = allData.applications.filter(a => a.tenants?.some(t => t.id === tenant.id) && involvedApplications.has(a.id));
        return {
            ...tenant,
            components: tenantComponents,
            applications: tenantApplications,
        }
    });

    const tree: DependencyTree = {
        _id: product.id,
        id: product.id,
        name: product.name,
        description: (product as any).description,
        version: (product as any).version,
        product: product,
        specifications: allData.specifications.filter(s => product.specifications?.some(ps => ps.id === s.id)),
        tenants: finalTenants,
        components: Array.from(involvedComponents.values()),
        applications: Array.from(involvedApplications.values()),
        interfaces: Array.from(involvedInterfaces.values()),
        metadata: {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
    };
    
    return tree;
}

export async function generateAndStoreAllProductTrees() {
    const allData = await fetchAllData();
    const client = await clientPromise;
    const db = client.db();
    const dependencyTreesCollection = db.collection('dependency_trees');

    let successfulUpdates = 0;
    let failedUpdates = 0;
    
    for (const product of allData.products) {
        try {
            const tree = await generateDependencyTree(product, allData);
            await dependencyTreesCollection.updateOne(
                { _id: product.id },
                { $set: tree },
                { upsert: true }
            );
            successfulUpdates++;
        } catch (error) {
            console.error(`Failed to generate tree for product ${product.id}:`, error);
            failedUpdates++;
        }
    }
    return { successfulUpdates, failedUpdates };
}
