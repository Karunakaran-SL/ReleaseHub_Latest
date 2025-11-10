
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
const findById = (collection: AnyCmdbEntity[], id: string) => collection.find(item => item.id === id || item._id === id);

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
    rootProduct.specifications?.forEach(spec => relatedSpecifications.add(spec.id));

    const queue: AnyCmdbEntity[] = [rootProduct as any];
    const visited = new Set<string>([rootProduct.id]);

    while (queue.length > 0) {
        const current = queue.shift();
        if (!current) continue;

        // Find tenants using this product
        allData.tenants.forEach(tenant => {
            if (tenant.products?.some(p => p.id === current.id) && !visited.has(tenant.id)) {
                relatedTenants.add(tenant.id);
                visited.add(tenant.id);
                queue.push(tenant as any);
            }
        });
        
        // Find components/apps using this tenant
        if (current.entityType === 'tenant') {
             allData.components.forEach(comp => {
                if (comp.tenants?.some(t => t.id === current.id) && !visited.has(comp.id)) {
                    relatedComponents.add(comp.id);
                    visited.add(comp.id);
                    queue.push(comp as any);
                }
            });
            allData.applications.forEach(app => {
                if (app.tenants?.some(t => t.id === current.id) && !visited.has(app.id)) {
                    relatedApplications.add(app.id);
                    visited.add(app.id);
                    queue.push(app as any);
                }
            });
        }
        
        // Follow component/app dependencies
        if (current.entityType === 'component' || current.entityType === 'application') {
            const entity = current as (CmdbComponent | CmdbApplication);
            entity.dependent_components?.forEach(dep => {
                 if (!visited.has(dep.id)) {
                    relatedComponents.add(dep.id);
                    visited.add(dep.id);
                    queue.push(findById(allData.components as any, dep.id) as any);
                 }
            });
             entity.dependent_applications?.forEach(dep => {
                 if (!visited.has(dep.id)) {
                    relatedApplications.add(dep.id);
                    visited.add(dep.id);
                    queue.push(findById(allData.applications as any, dep.id) as any);
                 }
            });
             entity.dependent_interfaces?.forEach(dep => {
                 if (!visited.has(dep.id)) {
                    relatedInterfaces.add(dep.id);
                    visited.add(dep.id);
                    queue.push(findById(allData.interfaces as any, dep.id) as any);
                 }
            });
        }
        
        // Follow interface sources
        if (current.entityType === 'interface') {
            const intf = current as CmdbInterface;
            if (intf.source && !visited.has(intf.source.id)) {
                const source = findById(allData.components as any, intf.source.id) || findById(allData.applications as any, intf.source.id);
                 if (source) {
                    if(source.entityType === 'component') relatedComponents.add(source.id);
                    if(source.entityType === 'application') relatedApplications.add(source.id);
                    visited.add(source.id);
                    queue.push(source as any);
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
            const spec = allData.specifications.find(s => s.id === id);
            return { id: spec?.id, name: spec?.name, version: spec?.version || '1.0' };
        }).filter(Boolean),
        tenants: Array.from(relatedTenants).map(id => allData.tenants.find(t => t.id === id)).filter(Boolean) as CmdbTenant[],
        components: Array.from(relatedComponents).map(id => allData.components.find(c => c.id === id)).filter(Boolean) as CmdbComponent[],
        applications: Array.from(relatedApplications).map(id => allData.applications.find(a => a.id === id)).filter(Boolean) as CmdbApplication[],
        interfaces: Array.from(relatedInterfaces).map(id => allData.interfaces.find(i => i.id === id)).filter(Boolean) as CmdbInterface[],
        metadata: {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
    };
    
    // Upsert into DB
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('dependency_trees');
    const result = await collection.updateOne(
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