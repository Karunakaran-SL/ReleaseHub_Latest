
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
    
    const rootEntity = allEntities.find(e => e._id === entityId);
    
    if (!rootEntity) {
        console.error(`Root entity not found with _id: ${entityId}`);
        return null;
    }

    const relatedEntities = new Map<string, EntityWithRelations>();
    const queue: EntityWithRelations[] = [rootEntity];
    const visited = new Set<string>([`${rootEntity.entityType}:${rootEntity.id}`]);

    const addEntityToQueue = (entity: EntityWithRelations | undefined) => {
        if (!entity) return;
        const key = `${entity.entityType}:${entity.id}`;
        relatedEntities.set(key, entity);
        if (!visited.has(key)) {
            visited.add(key);
            queue.push(entity);
        }
    };
    
    while (queue.length > 0) {
        const current = queue.shift()!;
        const currentKey = `${current.entityType}:${current.id}`;
        relatedEntities.set(currentKey, current);
        
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

    const finalEntities = Array.from(relatedEntities.values());

    const rootProduct = finalEntities.find(e => e.entityType === 'product' && e._id === (rootEntity.entityType === 'product' ? rootEntity._id : (rootEntity as any).products?.[0]?.id)) as Product;

    const tree: DependencyTree = {
        _id: rootEntity.id,
        rootEntityType: rootEntity.entityType,
        rootEntityId: rootEntity.id,
        product: rootProduct || null,
        specifications: allData.specifications.filter(s => finalEntities.some(e => e.entityType === 'product' && (e as Product).specifications?.some(sp => sp.id === s.id))),
        tenants: finalEntities.filter(e => e.entityType === 'tenant') as CmdbTenant[],
        components: finalEntities.filter(e => e.entityType === 'component') as CmdbComponent[],
        applications: finalEntities.filter(e => e.entityType === 'application') as CmdbApplication[],
        interfaces: finalEntities.filter(e => e.entityType === 'interface') as CmdbInterface[],
        metadata: {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
    };
    
    return tree;
}

export async function revalidateDependencyTree(productId: string): Promise<void> {
    const client = await clientPromise;
    const db = client.db();
    const tree = await generateDependencyTree('product', productId);
    if (tree) {
        await db.collection('dependency_trees').updateOne(
            { _id: productId },
            { $set: tree },
            { upsert: true }
        );
    }
}
