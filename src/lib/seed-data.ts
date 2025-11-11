
import clientPromise from '@/lib/mongodb';
import { generateAndStoreAllProductTrees } from '@/lib/dependency-graph';
import type { Product, CmdbTenant, CmdbComponent, CmdbApplication, CmdbInterfaceType, CmdbInterface } from './definitions';

const initialProducts: Omit<Product, '_id' | 'created_at' | 'updated_at'>[] = [
  {
    "name": "OneStopShop Portal",
    "owner": "Platform Engineering", "owner_email": "platform@example.com",
    "product_image": "https://picsum.photos/seed/OneStopShopPortal/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "StandardApproval", "name": "Standard Approval" },
    "custom_workflows": [],
    "cmdb": { "id": "GlobalCMDB", "name": "Global CMDB" },
    "compliance_checks": [{ "id": "SOC2", "name": "SOC2" }, { "id": "GDPR", "name": "GDPR" }],
    "deployment_type": { "id": "Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/oss-portal",
    "artifacts_repo": "http://artifacts.example.com/oss-portal",
    "pipeline": "http://cicd.example.com/oss-portal",
    "specifications": [{ "id": "ArgoCDSyncSpec", "name": "ArgoCD Sync Spec" }, { "id": "SingleSignOnSpec", "name": "Single Sign-On Spec" }],
    "version": "1.0.0",
  },
  {
    "name": "Unified Data Fabric",
    "owner": "Data Platform Team", "owner_email": "data-platform@example.com",
    "product_image": "https://picsum.photos/seed/UnifiedDataFabric/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "DataGovernanceReview", "name": "Data Governance Review" },
    "custom_workflows": [],
    "cmdb": { "id": "GlobalCMDB", "name": "Global CMDB" },
    "compliance_checks": [{ "id": "HIPAA", "name": "HIPAA" }],
    "deployment_type": { "id": "Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/data-fabric",
    "artifacts_repo": "http://artifacts.example.com/data-fabric",
    "pipeline": "http://cicd.example.com/data-fabric",
    "specifications": [{ "id": "SparkProcessing", "name": "Spark Processing" }, { "id": "KafkaStreaming", "name": "Kafka Streaming" }],
    "version": "1.0.0",
  }
];

const initialSpecifications = [
  { "name": "ArgoCD Sync Spec", "vendor": "CNCF" },
  { "name": "Single Sign-On Spec", "vendor": "OpenID" },
  { "name": "Spark Processing", "vendor": "Apache" },
  { "name": "Kafka Streaming", "vendor": "Apache" },
  { "name": "Kubeflow Pipelines", "vendor": "Google" },
  { "name": "PyTorch Distribution", "vendor": "Facebook" },
  { "name": "KubeEdge Node Spec", "vendor": "CNCF" },
  { "name": "MQTT Broker Spec", "vendor": "OASIS" },
  { "name": "Istio Service Mesh", "vendor": "CNCF" },
  { "name": "SPIFFE Identity", "vendor": "CNCF" }
];

const fullSpecifications = initialSpecifications.map(spec => ({
    _id: spec.name.replace(/[^a-zA-Z0-9]/g, ''),
    id: spec.name.replace(/[^a-zA-Z0-9]/g, ''),
    ...spec,
    hw_type: { "id": "Virtual", "name": "Virtual" },
    total_cpu: 32, 
    memory_gb: 128, 
    storage_gb: 1024,
    hypervisor: { "id": "KVM", "name": "KVM" },
    image: `https://picsum.photos/seed/${spec.name.replace(/[^a-zA-Z0-9]/g, '')}/40/40`,
    service_contract_type: { "id": "CommunitySupport", "name": "Community Support" },
    contact_point_email: "community@cncf.io",
    contact_point_phone: "N/A",
    network_cards: [{ "id": "VirtualNIC10Gbps", "name": "Virtual NIC 10Gbps" }],
    plug_power_cords: [{ "id": "VirtualPower", "name": "Virtual Power" }],
    custom_fields: [{ "key": "ManagedBy", "value": "Platform Team" }],
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString()
}));


const initialDeploymentTypes = [
    { "name": "Airgapped", "description": "Deployment in an isolated, offline environment." },
    { "name": "Cloud", "description": "Deployment to a public or private cloud." },
    { "name": "On-Prem", "description": "Deployment to on-premises servers." }
];

const initialWorkflows = [
    { "name": "Standard Approval", "description": "Standard linear workflow." },
    { "name": "Data Governance Review", "description": "Workflow with parallel approval steps." },
    { "name": "Hardware Compatibility Review", "description": "Security review for hardware." },
    { "name": "Peer Security Review", "description": "Mandatory security review for sensitive products." }
];

const initialInterfaceTypes: Omit<CmdbInterfaceType, '_id'>[] = [
    { id: 'REST', name: 'REST API' },
    { id: 'GraphQL', name: 'GraphQL API' },
    { id: 'gRPC', name: 'gRPC Service' },
    { id: 'KafkaTopic', name: 'Kafka Topic' },
    { id: 'DatabaseConnection', name: 'Database Connection' },
];

const initialTenants: Omit<CmdbTenant, '_id'| 'created_at' | 'updated_at'>[] = Array.from({ length: 10 }, (_, i) => ({
    id: `Tenant${i + 1}`,
    name: `Tenant ${i + 1}`,
    description: `Description for Tenant ${i + 1}.`,
    version: `1.0.${i}`,
    products: i < 5 ? [{ id: 'OneStopShopPortal', name: 'OneStopShop Portal'}] : [{ id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}],
    dependent_tenants: i > 0 ? [{ id: `Tenant${i}`, name: `Tenant ${i}`, version: `1.0.${i-1}` }] : [],
    phases: [],
}));

const initialComponents: Omit<CmdbComponent, '_id' | 'created_at' | 'updated_at'>[] = Array.from({ length: 20 }, (_, i) => ({
    id: `Component${i+1}`,
    name: `Component ${i+1}`,
    version: `1.${i % 5}.0`,
    tenants: [{id: `Tenant${(i % 10) + 1}`, name: `Tenant ${(i % 10) + 1}`}],
    provided_interfaces: [{id: `InterfaceComp${i+1}`, name: `Interface from Component ${i+1}`}],
    phases: [],
}));

const initialApplications: Omit<CmdbApplication, '_id' | 'created_at' | 'updated_at'>[] = Array.from({ length: 20 }, (_, i) => ({
    id: `App${i+1}`,
    name: `Application ${i+1}`,
    version: `2.${i % 3}.0`,
    tenants: [{id: `Tenant${(i % 10) + 1}`, name: `Tenant ${(i % 10) + 1}`}],
    dependent_interfaces: [{id: `InterfaceComp${i+1}`, name: `Interface from Component ${i+1}`}],
    phases: [],
}));

const initialInterfaces: Omit<CmdbInterface, '_id' | 'created_at' | 'updated_at'>[] = [
    ...Array.from({ length: 20 }, (_, i) => ({
        id: `InterfaceComp${i+1}`,
        name: `Interface from Component ${i+1}`,
        type: { id: 'REST', name: 'REST API' },
        version: `v1`,
        owner_name: `Team for Component ${i+1}`,
        owner_email: `team-comp${i+1}@example.com`,
        source: { id: `Component${i+1}`, name: `Component ${i+1}` },
        security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } },
    })),
     ...Array.from({ length: 30 }, (_, i) => ({
        id: `ExternalInterface${i+1}`,
        name: `External Interface ${i+1}`,
        type: { id: 'GraphQL', name: 'GraphQL API' },
        version: `v2`,
        owner_name: `Partner Team ${i+1}`,
        owner_email: `partner${i+1}@example.com`,
        source: { id: `Application${(i % 20) + 1}`, name: `Application ${(i % 20) + 1}` },
        security: { internal: { secure: true, authentication: true }, external: { secure: true, authentication: true } },
    })),
];


export async function seedDatabase() {
    const client = await clientPromise;
    const db = client.db();

    const collectionsToSeed = [
        { name: 'products', data: initialProducts.map(p => ({...p, _id: p.name.replace(/[^a-zA-Z0-9]/g, ''), created_at: new Date().toISOString(), updated_at: new Date().toISOString()})) },
        { name: 'specifications', data: fullSpecifications },
        { name: 'deployment_types', data: initialDeploymentTypes.map(d => ({ ...d, _id: d.name.replace(/[^a-zA-Z0-9]/g, '') })) },
        { name: 'workflows', data: initialWorkflows.map(w => ({ ...w, _id: w.name.replace(/[^a-zA-Z0-9]/g, '') })) },
        { name: 'cmdb_tenants', data: initialTenants.map(t => ({ ...t, _id: t.id.replace(/[^a-zA-Z0-9]/g, ''), created_at: new Date().toISOString(), updated_at: new Date().toISOString() })) },
        { name: 'cmdb_components', data: initialComponents.map(c => ({ ...c, _id: c.id.replace(/[^a-zA-Z0-9]/g, ''), created_at: new Date().toISOString(), updated_at: new Date().toISOString() })) },
        { name: 'cmdb_applications', data: initialApplications.map(a => ({ ...a, _id: a.id.replace(/[^a-zA-Z0-9]/g, ''), created_at: new Date().toISOString(), updated_at: new Date().toISOString() })) },
        { name: 'cmdb_interface_types', data: initialInterfaceTypes.map(i => ({ ...i, _id: i.id.replace(/[^a-zA-Z0-9]/g, '') })) },
        { name: 'cmdb_interfaces', data: initialInterfaces.map(i => ({ ...i, _id: i.id.replace(/[^a-zA-Z0-9]/g, ''), created_at: new Date().toISOString(), updated_at: new Date().toISOString() })) },
    ];
    
    let seededCount = 0;
    let skippedCount = 0;

    for (const collection of collectionsToSeed) {
        const count = await db.collection(collection.name).countDocuments();
        if (count === 0) {
            await db.collection(collection.name).insertMany(collection.data as any[]);
            seededCount++;
        } else {
            skippedCount++;
        }
    }
    
    // Always run this after seeding to create the dependency graphs
    await generateAndStoreAllProductTrees();

    return { seededCount, skippedCount };
}
