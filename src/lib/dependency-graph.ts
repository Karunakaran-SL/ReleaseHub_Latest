
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
        product.specifications?.some(s => s.id === spec._id)
    ).map(s => ({ id: s.id, name: s.name, version: s.version || '1.0' }));

    // 2. Find tenants associated with the product
    const productTenants = allData.tenants.filter(tenant => 
        tenant.products?.some(p => p.id === product._id)
    );

    const tenantsTree = productTenants.map(tenant => {
        // For each tenant, find its components and applications
        const tenantComponents = allData.components.filter(comp => comp.tenants?.some(t => t.id === tenant._id))
            .map(c => {
                const provides_interfaces = allData.interfaces.filter(i => c.provided_interfaces?.some(pi => pi.id === i.id));
                const depends_on_interfaces = allData.interfaces.filter(i => c.dependent_interfaces?.some(di => di.id === i.id));
                return {...c, version: c.version || '1.0.0', provides_interfaces, depends_on_interfaces};
            });
            
        const tenantApplications = allData.applications.filter(app => app.tenants?.some(t => t.id === tenant._id))
            .map(a => {
                const provides_interfaces = allData.interfaces.filter(i => a.provided_interfaces?.some(pi => pi.id === i.id));
                const depends_on_interfaces = allData.interfaces.filter(i => a.dependent_interfaces?.some(di => di.id === i.id));
                return {...a, version: a.version || '1.0.0', provides_interfaces, depends_on_interfaces};
            });

        // Get the latest version of the tenant for the default tree
        const allVersionsOfTenant = allData.tenants.filter(t => t.name === tenant.name).sort((a,b) => (b.version || '0').localeCompare(a.version || '0'));
        const latestVersion = allVersionsOfTenant[0]?.version || tenant.version || '1.0.0';

        return {
            id: tenant.id,
            name: tenant.name,
            version: latestVersion,
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
            console.error(`Failed to generate tree for product ${product._id}:`, error);
            failedUpdates++;
        }
    }
    return { successfulUpdates, failedUpdates };
}
