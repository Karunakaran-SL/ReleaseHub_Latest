
import clientPromise from '@/lib/mongodb';
import type { AnyCmdbEntity, DependencyTree, Product, CmdbTenant, CmdbComponent, CmdbApplication, CmdbInterface, EntityType } from './definitions';

type AllData = {
    products: Product[];
    tenants: CmdbTenant[];
    components: CmdbComponent[];
    applications: CmdbApplication[];
    interfaces: CmdbInterface[];
    specifications: any[]; // Assuming specifications have at least id, name, version
};

// Fetches all data from the database collections.
export async function fetchAllData(): Promise<AllData> {
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

// Generates a dependency tree for a single product based on the new nested schema.
export async function generateDependencyTree(product: Product, allData: AllData): Promise<any> {
    
    // 1. Find specifications for the product
    const productSpecifications = allData.specifications.filter(spec => 
        product.specifications?.some(s => s.id === spec.id)
    ).map(s => ({ id: s.id, name: s.name, version: s.version }));

    // 2. Find tenants associated with the product
    const productTenants = allData.tenants.filter(tenant => 
        tenant.products?.some(p => p.id === product._id)
    );

    const tenantsTree = productTenants.map(tenant => {
        // 3. For each tenant, find its components
        const tenantComponents = allData.components.filter(comp => 
            comp.tenants?.some(t => t.id === tenant._id)
        ).map(comp => {
            return {
                id: comp.id,
                name: comp.name,
                version: comp.version,
                parents: [{ id: tenant.id, name: tenant.name, version: tenant.version }],
                dependent_components: comp.dependent_components || [],
                dependent_applications: comp.dependent_applications || [],
                interfaces: {
                    provided: (comp.provided_interfaces || []).map(p => ({...p, type: 'provided'})),
                    required: (comp.dependent_interfaces || []).map(r => ({...r, type: 'required'})),
                }
            };
        });

        // 4. For each tenant, find its applications
        const tenantApplications = allData.applications.filter(app => 
            app.tenants?.some(t => t.id === tenant._id)
        ).map(app => {
            return {
                id: app.id,
                name: app.name,
                version: app.version,
                parents: [{ id: tenant.id, name: tenant.name, version: tenant.version }],
                dependent_components: app.dependent_components || [],
                dependent_applications: app.dependent_applications || [],
                interfaces: {
                    provided: (app.provided_interfaces || []).map(p => ({...p, type: 'provided'})),
                    required: (app.dependent_interfaces || []).map(r => ({...r, type: 'required'})),
                }
            };
        });
        
        return {
            id: tenant.id,
            name: tenant.name,
            version: tenant.version,
            parents: [{ id: product._id, name: product.name, version: product.version }],
            dependent_tenants: tenant.dependent_tenants || [],
            components: tenantComponents,
            applications: tenantApplications
        };
    });

    // 5. Construct the final tree object
    const tree = {
        _id: `${product._id}_Tree`,
        id: product._id,
        name: product.name,
        version: product.version,
        specifications: productSpecifications,
        tenants: tenantsTree,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
                { _id: tree._id },
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
