
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { AnyCmdbEntity, DependencyTree, Product, CmdbTenant, CmdbComponent, CmdbApplication, CmdbInterface } from './definitions';

type AllData = {
    products: Product[];
    tenants: CmdbTenant[];
    components: CmdbComponent[];
    applications: CmdbApplication[];
    interfaces: CmdbInterface[];
    specifications: any[]; // Assuming specifications have a similar structure
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

    const allEntities = [
        ...allData.tenants.map(t => ({ ...t, entityType: 'tenant' })),
        ...allData.components.map(c => ({ ...c, entityType: 'component' })),
        ...allData.applications.map(a => ({ ...a, entityType: 'application' })),
        ...allData.interfaces.map(i => ({ ...i, entityType: 'interface' })),
        ...allData.products.map(p => ({ ...p, entityType: 'product' })),
    ] as AnyCmdbEntity[];
    
    const rootEntity = allEntities.find(e => e._id.toString() === entityId);
    if (!rootEntity) return null;

    const relatedTenants = new Set<string>();
    const relatedComponents = new Set<string>();
    const relatedApplications = new Set<string>();
    const relatedInterfaces = new Set<string>();
    const relatedSpecifications = new Set<string>();
    const relatedProducts = new Set<string>();
    
    if (rootEntity.entityType === 'product') {
        relatedProducts.add(rootEntity._id.toString());
        (rootEntity as Product).specifications?.forEach(spec => {
            const foundSpec = allData.specifications.find(s => s.id === spec.id);
            if (foundSpec) relatedSpecifications.add(foundSpec._id.toString());
        });
    }

    const queue: AnyCmdbEntity[] = [rootEntity];
    const visited = new Set<string>([rootEntity._id.toString()]);
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (!current) continue;
        
        switch (current.entityType) {
            case 'product':
                const product = current as Product;
                relatedProducts.add(product._id.toString());
                allData.tenants.forEach(tenant => {
                    if (tenant.products?.some(p => p.id === product.id) && !visited.has(tenant._id.toString())) {
                        relatedTenants.add(tenant._id.toString());
                        visited.add(tenant._id.toString());
                        queue.push(allEntities.find(e => e._id.toString() === tenant._id.toString())!);
                    }
                });
                break;
            case 'tenant':
                const tenant = current as CmdbTenant;
                relatedTenants.add(tenant._id.toString());
                 const entitiesUsingTenant = allEntities.filter(e => 
                    (e.entityType === 'component' || e.entityType === 'application') &&
                    (e as CmdbComponent).tenants?.some(t => t.id === tenant.id)
                );
                entitiesUsingTenant.forEach(entity => {
                    if (!visited.has(entity._id.toString())) {
                        if (entity.entityType === 'component') relatedComponents.add(entity._id.toString());
                        if (entity.entityType === 'application') relatedApplications.add(entity._id.toString());
                        visited.add(entity._id.toString());
                        queue.push(entity);
                    }
                });
                break;
            case 'component':
            case 'application':
                const entity = current as (CmdbComponent | CmdbApplication);
                if (entity.entityType === 'component') relatedComponents.add(entity._id.toString());
                if (entity.entityType === 'application') relatedApplications.add(entity._id.toString());

                const dependencies = [
                    ...(entity.dependent_components || []),
                    ...(entity.dependent_applications || []),
                    ...(entity.dependent_interfaces || []),
                ];
                dependencies.forEach(dep => {
                    const found = allEntities.find(e => e.id === dep.id);
                    if (found && !visited.has(found._id.toString())) {
                         if(found.entityType === 'component') relatedComponents.add(found._id.toString());
                         if(found.entityType === 'application') relatedApplications.add(found._id.toString());
                         if(found.entityType === 'interface') relatedInterfaces.add(found._id.toString());
                        visited.add(found._id.toString());
                        queue.push(found);
                    }
                });
                break;
            case 'interface':
                 const intf = current as CmdbInterface;
                 relatedInterfaces.add(intf._id.toString());
                 if (intf.source?.id) {
                    const source = allEntities.find(e => e.id === intf.source.id);
                    if (source && !visited.has(source._id.toString())) {
                        if(source.entityType === 'component') relatedComponents.add(source._id.toString());
                        if(source.entityType === 'application') relatedApplications.add(source._id.toString());
                        visited.add(source._id.toString());
                        queue.push(source);
                    }
                 }
                break;
        }
    }
    
    const tree: Omit<DependencyTree, '_id' | 'productId'> = {
        rootEntityType: rootEntity.entityType,
        rootEntityId: rootEntity._id.toString(),
        product: allData.products.find(p => p._id.toString() === Array.from(relatedProducts)[0]) || null,
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
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('dependency_trees');
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
    // We do not await this, it can run in the background. This is a bit of a simplification.
    // In a real-world scenario, you might want to know the entity type to rebuild.
    // For now, we assume we're always rebuilding from a product context if not specified.
    // Let's just revalidate the product tree for simplicity.
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
