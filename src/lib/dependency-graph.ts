
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

// Helper function to find an entity by its string ID
const findById = (collection: AnyCmdbEntity[], id: string) => collection.find(item => item._id.toString() === id);

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


export async function generateDependencyTree(productId: string): Promise<DependencyTree | null> {
    const allData = await fetchAllData();
    const rootProduct = allData.products.find(p => p._id.toString() === productId);

    if (!rootProduct) return null;

    const relatedTenants = new Set<string>();
    const relatedComponents = new Set<string>();
    const relatedApplications = new Set<string>();
    const relatedInterfaces = new Set<string>();
    const relatedSpecifications = new Set<string>();
    
    // Add product's direct specifications
    rootProduct.specifications?.forEach(spec => {
        const foundSpec = allData.specifications.find(s => s.id === spec.id);
        if (foundSpec) relatedSpecifications.add(foundSpec._id.toString());
    });

    const queue: AnyCmdbEntity[] = [{...rootProduct, entityType: 'product'} as any];
    const visited = new Set<string>([rootProduct._id.toString()]);
    
    const allEntities = [
        ...allData.tenants.map(t => ({ ...t, entityType: 'tenant' })),
        ...allData.components.map(c => ({ ...c, entityType: 'component' })),
        ...allData.applications.map(a => ({ ...a, entityType: 'application' })),
        ...allData.interfaces.map(i => ({ ...i, entityType: 'interface' })),
        ...allData.products.map(p => ({ ...p, entityType: 'product' })),
    ] as AnyCmdbEntity[];

    while (queue.length > 0) {
        const current = queue.shift();
        if (!current) continue;

        // Find tenants using this product
        if (current.entityType === 'product') {
            allData.tenants.forEach(tenant => {
                if (tenant.products?.some(p => p.id === current.id) && !visited.has(tenant._id.toString())) {
                    relatedTenants.add(tenant._id.toString());
                    visited.add(tenant._id.toString());
                    queue.push(allEntities.find(e => e._id.toString() === tenant._id.toString())!);
                }
            });
        }
        
        // Find components/apps using this tenant
        if (current.entityType === 'tenant') {
             allData.components.forEach(comp => {
                if (comp.tenants?.some(t => t.id === current.id) && !visited.has(comp._id.toString())) {
                    relatedComponents.add(comp._id.toString());
                    visited.add(comp._id.toString());
                    queue.push(allEntities.find(e => e._id.toString() === comp._id.toString())!);
                }
            });
            allData.applications.forEach(app => {
                if (app.tenants?.some(t => t.id === current.id) && !visited.has(app._id.toString())) {
                    relatedApplications.add(app._id.toString());
                    visited.add(app._id.toString());
                    queue.push(allEntities.find(e => e._id.toString() === app._id.toString())!);
                }
            });
        }
        
        // Follow component/app dependencies
        if (current.entityType === 'component' || current.entityType === 'application') {
            const entity = current as (CmdbComponent | CmdbApplication);
            const dependencies = [
                ...(entity.dependent_components || []),
                ...(entity.dependent_applications || []),
            ];

            dependencies.forEach(dep => {
                 if (dep.id && !visited.has(dep.id)) {
                    const found = allEntities.find(e => e.id === dep.id);
                    if (found) {
                        if(found.entityType === 'component') relatedComponents.add(found._id.toString());
                        if(found.entityType === 'application') relatedApplications.add(found._id.toString());
                        visited.add(found._id.toString());
                        queue.push(found);
                    }
                 }
            });

             entity.dependent_interfaces?.forEach(dep => {
                 if (dep.id && !visited.has(dep.id)) {
                    const found = allEntities.find(e => e.id === dep.id);
                    if (found) {
                        relatedInterfaces.add(found._id.toString());
                        visited.add(found._id.toString());
                        queue.push(found);
                    }
                 }
            });
        }
        
        // Follow interface sources
        if (current.entityType === 'interface') {
            const intf = current as CmdbInterface;
            if (intf.source && intf.source.id && !visited.has(intf.source.id)) {
                const source = allEntities.find(e => e.id === intf.source.id);
                 if (source) {
                    if(source.entityType === 'component') relatedComponents.add(source._id.toString());
                    if(source.entityType === 'application') relatedApplications.add(source._id.toString());
                    visited.add(source._id.toString());
                    queue.push(source);
                }
            }
        }
    }
    
    const tree: Omit<DependencyTree, '_id'> = {
        productId: rootProduct._id.toString(),
        product: {
            id: rootProduct.id,
            name: rootProduct.name,
            version: '1.0', // Products don't have version in current model
            description: 'Core product for this dependency tree',
        },
        specifications: Array.from(relatedSpecifications).map(id => {
            const spec = allData.specifications.find(s => s._id.toString() === id);
            return { id: spec?.id, name: spec?.name, version: spec?.version || '1.0' };
        }).filter(Boolean) as any,
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
        { productId: rootProduct._id.toString() },
        { $set: tree },
        { upsert: true }
    );
    
    const finalDoc = await collection.findOne({ productId: rootProduct._id.toString() });

    return finalDoc as DependencyTree | null;
}

export async function revalidateDependencyTree(productId: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
  try {
    // We do not await this, it can run in the background
    fetch(`${baseUrl}/api/dependency-tree/${productId}`, {
        method: 'PUT'
    });
  } catch (error) {
      console.error(
        `Failed to trigger dependency tree revalidation for product ${productId}:`,
        error
      );
  }
}
