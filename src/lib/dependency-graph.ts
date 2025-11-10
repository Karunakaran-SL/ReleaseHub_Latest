
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

type EntityWithRelations = AnyCmdbEntity & { entityType: EntityType };

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


export async function generateDependencyTree(entityType: EntityType, entityId: string): Promise<DependencyTree | null> {
    const allData = await fetchAllData();
    
    const allEntities = [
        ...allData.tenants.map(t => ({ ...t, entityType: 'tenant' as EntityType })),
        ...allData.components.map(c => ({ ...c, entityType: 'component' as EntityType })),
        ...allData.applications.map(a => ({ ...a, entityType: 'application' as EntityType })),
        ...allData.interfaces.map(i => ({ ...i, entityType: 'interface' as EntityType })),
        ...allData.products.map(p => ({ ...p, entityType: 'product' as EntityType })),
    ] as EntityWithRelations[];

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
    
    const queue: EntityWithRelations[] = [rootEntity];
    const visited = new Set<string>([`${rootEntity.entityType}:${rootEntity.id}`]);

    const addEntityToQueue = (entity: EntityWithRelations | undefined) => {
        if (!entity) return;
        const key = `${entity.entityType}:${entity.id}`;
        if (!visited.has(key)) {
            visited.add(key);
            queue.push(entity);
        }
    };
    
    while (queue.length > 0) {
        const current = queue.shift()!;

        // Add current entity to its respective set
        switch (current.entityType) {
            case 'product': relatedProducts.add(current.id); break;
            case 'tenant': relatedTenants.add(current.id); break;
            case 'component': relatedComponents.add(current.id); break;
            case 'application': relatedApplications.add(current.id); break;
            case 'interface': relatedInterfaces.add(current.id); break;
        }
        
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
            
            if (dependencies.some(dep => dep && dep.id === current.id)) {
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
            ((current as CmdbInterface).source ? [(current as CmdbInterface).source] : []),
            ...((current as CmdbTenant).products || [])
        ].filter(Boolean);

        downstreamDeps.forEach(dep => {
            const found = allEntities.find(e => e.id === dep.id);
            addEntityToQueue(found);
        });
    }

    const tree: DependencyTree = {
        _id: rootEntity.id,
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
