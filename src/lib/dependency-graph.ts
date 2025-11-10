
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { AnyCmdbEntity, DependencyTree, Product, CmdbTenant, CmdbComponent, CmdbApplication, CmdbInterface, EntityType } from './definitions';

type AllData = {
    products: Product[];
    tenants: CmdbTenant[];
    components: CmdbComponent[];
    applications: CmdbApplication[];
    interfaces: CmdbInterface[];
    specifications: any[];
};

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


export async function generateDependencyTree(entityType: string, entityId: string): Promise<DependencyTree | null> {
    const allData = await fetchAllData();
    const client = await clientPromise;
    const db = client.db();
    
    const allEntities = [
        ...allData.tenants.map(t => ({ ...t, entityType: 'tenant' as EntityType })),
        ...allData.components.map(c => ({ ...c, entityType: 'component' as EntityType })),
        ...allData.applications.map(a => ({ ...a, entityType: 'application' as EntityType })),
        ...allData.interfaces.map(i => ({ ...i, entityType: 'interface' as EntityType })),
        ...allData.products.map(p => ({ ...p, entityType: 'product' as EntityType })),
    ] as (AnyCmdbEntity & { entityType: EntityType })[];

    const rootEntity = allEntities.find(e => e.id === entityId && e.entityType === entityType);
    
    if (!rootEntity) {
        console.error(`Root entity not found for type: ${entityType} and id: ${entityId}`);
        return null;
    }

    const relatedTenants = new Set<string>();
    const relatedComponents = new Set<string>();
    const relatedApplications = new Set<string>();
    const relatedInterfaces = new Set<string>();
    const relatedSpecifications = new Set<string>();
    const relatedProducts = new Set<string>();
    
    const queue: (AnyCmdbEntity & { entityType: EntityType })[] = [rootEntity];
    const visited = new Set<string>([`${rootEntity.entityType}:${rootEntity.id}`]);

    const addEntityToQueue = (entity: AnyCmdbEntity & { entityType: EntityType }) => {
        const key = `${entity.entityType}:${entity.id}`;
        if (!visited.has(key)) {
            visited.add(key);
            queue.push(entity);
        }
    };
    
     // Initial population of sets based on root entity
    switch (rootEntity.entityType) {
        case 'product': relatedProducts.add(rootEntity.id); break;
        case 'tenant': relatedTenants.add(rootEntity.id); break;
        case 'component': relatedComponents.add(rootEntity.id); break;
        case 'application': relatedApplications.add(rootEntity.id); break;
        case 'interface': relatedInterfaces.add(rootEntity.id); break;
    }


    while (queue.length > 0) {
        const current = queue.shift()!;
        
        // Find what depends on the current item (Upstream)
        allEntities.forEach(upstreamEntity => {
            const dependencies = [
                ...((upstreamEntity as CmdbTenant).dependent_tenants || []),
                ...((upstreamEntity as CmdbComponent | CmdbApplication).dependent_components || []),
                ...((upstreamEntity as CmdbComponent | CmdbApplication).dependent_applications || []),
                ...((upstreamEntity as CmdbComponent | CmdbApplication).dependent_interfaces || []),
                ...((upstreamEntity as Product).specifications || []),
                ((upstreamEntity as CmdbInterface).source ? [((upstreamEntity as CmdbInterface).source)] : []),
                ...((upstreamEntity as CmdbTenant).products || [])
            ].filter(Boolean);
            
            if (dependencies.some(dep => dep.id === current.id)) {
                addEntityToQueue(upstreamEntity);
            }
        });
        
        // Find what the current item depends on (Downstream)
        const downstreamDeps = [
            ...((current as CmdbTenant).dependent_tenants || []),
            ...((current as CmdbComponent | CmdbApplication).dependent_components || []),
            ...((current as CmdbComponent | CmdbApplication).dependent_applications || []),
            ...((current as CmdbComponent | CmdbApplication).dependent_interfaces || []),
            ...((current as Product).specifications || []),
            ((current as CmdbInterface).source ? [((current as CmdbInterface).source)] : []),
            ...((current as CmdbTenant).products || [])
        ].filter(Boolean);

        downstreamDeps.forEach(dep => {
            const found = allEntities.find(e => e.id === dep.id);
            if (found) {
                addEntityToQueue(found);
            }
        });
    }

    // Populate sets after traversal
    visited.forEach(key => {
        const [type, id] = key.split(':');
        const entity = allEntities.find(e => e.entityType === type && e.id === id);
        if (entity) {
             switch (entity.entityType) {
                case 'product': relatedProducts.add(entity.id); break;
                case 'tenant': relatedTenants.add(entity.id); break;
                case 'component': relatedComponents.add(entity.id); break;
                case 'application': relatedApplications.add(entity.id); break;
                case 'interface': relatedInterfaces.add(entity.id); break;
            }
        }
    });

    const tree: DependencyTree = {
        _id: new ObjectId().toString(),
        rootEntityType: rootEntity.entityType,
        rootEntityId: rootEntity.id,
        product: allData.products.find(p => relatedProducts.has(p.id)) || null,
        specifications: Array.from(relatedSpecifications).map(id => allData.specifications.find(s => s.id === id)).filter(Boolean) as any,
        tenants: Array.from(relatedTenants).map(id => allData.tenants.find(t => t.id === id)).filter(Boolean) as CmdbTenant[],
        components: Array.from(relatedComponents).map(id => allData.components.find(c => c.id === id)).filter(Boolean) as CmdbComponent[],
        applications: Array.from(relatedApplications).map(id => allData.applications.find(a => a.id === id)).filter(Boolean) as CmdbApplication[],
        interfaces: Array.from(relatedInterfaces).map(id => allData.interfaces.find(i => i.id === id)).filter(Boolean) as CmdbInterface[],
        metadata: {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
    };
    
    return tree;
}

export async function revalidateDependencyTree(entityId: string): Promise<void> {
  // No-op as we are generating on the fly and not caching in DB anymore
}
