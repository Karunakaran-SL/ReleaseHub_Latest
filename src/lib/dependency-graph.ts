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
export async function generateProductDependencyTree(product: Product, allData: AllData): Promise<any> {
    
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
                return {...c, version: c.version || '1.0.0', provides_interfaces, depends_on_interfaces, entityType: 'component'};
            });
            
        const tenantApplications = allData.applications.filter(app => app.tenants?.some(t => t.id === tenant._id))
            .map(a => {
                const provides_interfaces = allData.interfaces.filter(i => a.provided_interfaces?.some(pi => pi.id === i.id));
                const depends_on_interfaces = allData.interfaces.filter(i => a.dependent_interfaces?.some(di => di.id === i.id));
                return {...a, version: a.version || '1.0.0', provides_interfaces, depends_on_interfaces, entityType: 'application'};
            });

        // Get the latest version of the tenant for the default tree
        const allVersionsOfTenant = allData.tenants.filter(t => t.name === tenant.name).sort((a,b) => (b.version || '0').localeCompare(a.version || '0'));
        const latestVersion = allVersionsOfTenant[0]?.version || tenant.version || '1.0.0';

        return {
            id: tenant.id,
            name: tenant.name,
            version: latestVersion,
            entityType: 'tenant',
            parents: [{ id: product._id, name: product.name, version: product.version, entityType: 'product' }],
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
        entityType: 'product',
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
            const tree = await generateProductDependencyTree(product, allData);
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

export async function generateDependencyTree(entityType: EntityType, entityId: string): Promise<any> {
    const allData = await fetchAllData();
    let centralNode: AnyCmdbEntity | null = null;
    let parents: AnyCmdbEntity[] = [];
    let children: AnyCmdbEntity[] = [];

    const findAndAddEntityType = (items: any[], type: EntityType) => items.map(item => ({...item, entityType: type}));

    const allEntities = [
        ...findAndAddEntityType(allData.products, 'product'),
        ...findAndAddEntityType(allData.tenants, 'tenant'),
        ...findAndAddEntityType(allData.components, 'component'),
        ...findAndAddEntityType(allData.applications, 'application'),
    ];

    centralNode = allEntities.find(e => e.id === entityId || e._id === entityId) || null;

    if (!centralNode) {
        throw new Error(`Entity ${entityId} of type ${entityType} not found.`);
    }

    // Find parents (what this node depends on)
    if ('dependent_tenants' in centralNode && centralNode.dependent_tenants) {
        centralNode.dependent_tenants.forEach(dep => {
            const parent = allEntities.find(e => e.id === dep.id && e.entityType === 'tenant');
            if (parent) parents.push(parent);
        });
    }
    if ('dependent_components' in centralNode && centralNode.dependent_components) {
        centralNode.dependent_components.forEach(dep => {
            const parent = allEntities.find(e => e.id === dep.id && e.entityType === 'component');
            if (parent) parents.push(parent);
        });
    }
    if ('dependent_applications' in centralNode && centralNode.dependent_applications) {
        centralNode.dependent_applications.forEach(dep => {
            const parent = allEntities.find(e => e.id === dep.id && e.entityType === 'application');
            if (parent) parents.push(parent);
        });
    }
    if ('tenants' in centralNode && centralNode.tenants) { // Component or App -> Tenant
         centralNode.tenants.forEach(dep => {
            const parent = allEntities.find(e => e.id === dep.id && e.entityType === 'tenant');
            if (parent) parents.push(parent);
        });
    }
     if ('products' in centralNode && centralNode.products) { // Tenant -> Product
         centralNode.products.forEach(dep => {
            const parent = allEntities.find(e => e.id === dep.id && e.entityType === 'product');
            if (parent) parents.push(parent);
        });
    }


    // Find children (what depends on this node)
    allEntities.forEach(e => {
        if (e.id === centralNode!.id) return; // Skip self

        const dependsOnCurrent = (deps: {id: string}[]) => deps && deps.some(d => d.id === centralNode!.id);

        if ('dependent_tenants' in e && dependsOnCurrent(e.dependent_tenants!)) children.push(e);
        if ('dependent_components' in e && dependsOnCurrent(e.dependent_components!)) children.push(e);
        if ('dependent_applications' in e && dependsOnCurrent(e.dependent_applications!)) children.push(e);
        if ('tenants' in e && dependsOnCurrent(e.tenants!)) children.push(e);
        if ('products' in e && dependsOnCurrent(e.products!)) children.push(e);
    });

    return {
        id: centralNode.id,
        name: centralNode.name,
        version: centralNode.version,
        entityType: centralNode.entityType,
        parents: [...new Map(parents.map(item => [item.id, item])).values()],
        children: [...new Map(children.map(item => [item.id, item])).values()]
    };
}
