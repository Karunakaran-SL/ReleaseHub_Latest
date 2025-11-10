
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
    const collection = db.collection('dependency_trees');
    
    const allEntities = [
        ...allData.tenants.map(t => ({ ...t, entityType: 'tenant' as EntityType })),
        ...allData.components.map(c => ({ ...c, entityType: 'component' as EntityType })),
        ...allData.applications.map(a => ({ ...a, entityType: 'application' as EntityType })),
        ...allData.interfaces.map(i => ({ ...i, entityType: 'interface' as EntityType })),
        ...allData.products.map(p => ({ ...p, entityType: 'product' as EntityType })),
    ] as (AnyCmdbEntity & { entityType: EntityType })[];

    const rootEntity = allEntities.find(e => e._id.toString() === entityId && e.entityType === entityType);
    
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
    const visited = new Set<string>([`${rootEntity.entityType}:${rootEntity._id.toString()}`]);

    const addEntityToQueue = (entity: AnyCmdbEntity & { entityType: EntityType }) => {
        const key = `${entity.entityType}:${entity._id.toString()}`;
        if (!visited.has(key)) {
            visited.add(key);
            queue.push(entity);
            
            switch (entity.entityType) {
                case 'product': relatedProducts.add(entity._id.toString()); break;
                case 'tenant': relatedTenants.add(entity._id.toString()); break;
                case 'component': relatedComponents.add(entity._id.toString()); break;
                case 'application': relatedApplications.add(entity._id.toString()); break;
                case 'interface': relatedInterfaces.add(entity._id.toString()); break;
            }
        }
    };
    
    addEntityToQueue(rootEntity);

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
            ];
            
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
        ];

        downstreamDeps.forEach(dep => {
            const found = allEntities.find(e => e.id === dep.id);
            if (found) {
                addEntityToQueue(found);
            }
        });
    }

    const tree: Omit<DependencyTree, '_id'> = {
        rootEntityType: rootEntity.entityType,
        rootEntityId: rootEntity._id.toString(),
        product: allData.products.find(p => relatedProducts.has(p._id.toString())) || null,
        specifications: Array.from(relatedSpecifications).map(id => allData.specifications.find(s => s._id.toString() === id)).filter(Boolean) as any,
        tenants: Array.from(relatedTenants).map(id => allData.tenants.find(t => t._id.toString() === id)).filter(Boolean) as CmdbTenant[],
        components: Array.from(relatedComponents).map(id => allData.components.find(c => c._id.toString() === id)).filter(Boolean) as CmdbComponent[],
        applications: Array.from(relatedApplications).map(id => allData.applications.find(a => a._id.toString() === id)).filter(Boolean) as CmdbApplication[],
        interfaces: Array.from(relatedInterfaces).map(id => allData.interfaces.find(i => i._id.toString() === id)).filter(Boolean) as CmdbInterface[],
        metadata: {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
    };
    
    // Upsert into DB
    await collection.updateOne(
        { rootEntityId: rootEntity._id.toString() },
        { $set: tree },
        { upsert: true }
    );
    
    const finalDoc = await collection.findOne({ rootEntityId: rootEntity._id.toString() });

    return finalDoc as DependencyTree | null;
}

export async function revalidateDependencyTree(entityId: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
  try {
    // We do not await this, it can run in the background.
    // This will hit the PUT endpoint in [...params]/route.ts to regenerate the tree for the given entity.
    fetch(`${baseUrl}/api/dependency-tree/product/${entityId}`, {
        method: 'PUT'
    }).catch(e => console.error("background fetch for revalidation failed", e));
  } catch (error) {
      console.error(
        `Failed to trigger dependency tree revalidation for entity ${entityId}:`,
        error
      );
  }
}
