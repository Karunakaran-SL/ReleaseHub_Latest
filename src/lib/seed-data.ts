
import clientPromise from '@/lib/mongodb';
import { generateAndStoreAllProductTrees } from '@/lib/dependency-graph';
import type { Product, CmdbTenant, CmdbComponent, CmdbApplication, CmdbInterfaceType, CmdbInterface } from './definitions';

const initialProducts: Omit<Product, '_id' | 'created_at' | 'updated_at'>[] = [
  {
    "name": "OneStopShop Portal",
    "owner": "Platform Engineering", "owner_email": "platform@example.com",
    "product_image": "https://picsum.photos/seed/product1/40/40",
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
    "product_image": "https://picsum.photos/seed/product2/40/40",
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
  },
  {
    "name": "AI/ML Workbench",
    "owner": "AI Research Group", "owner_email": "ai-research@example.com",
    "product_image": "https://picsum.photos/seed/product3/40/40",
    "approval_needed": false,
    "default_workflow": { "id": "StandardApproval", "name": "Standard Approval" },
    "custom_workflows": [],
    "cmdb": { "id": "GlobalCMDB", "name": "Global CMDB" },
    "compliance_checks": [],
    "deployment_type": { "id": "Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/ml-workbench",
    "artifacts_repo": "http://artifacts.example.com/ml-workbench",
    "pipeline": "http://cicd.example.com/ml-workbench",
    "specifications": [{ "id": "KubeflowPipelines", "name": "Kubeflow Pipelines" }, { "id": "PyTorchDistribution", "name": "PyTorch Distribution" }],
    "version": "1.0.0",
  },
  {
    "name": "Edge Computing Orchestrator",
    "owner": "IoT Division", "owner_email": "iot@example.com",
    "product_image": "https://picsum.photos/seed/product4/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "HardwareCompatibilityReview", "name": "Hardware Compatibility Review" },
    "custom_workflows": [],
    "cmdb": { "id": "EdgeCMDB", "name": "Edge CMDB" },
    "compliance_checks": [{ "id": "FedRAMP", "name": "FedRAMP" }],
    "deployment_type": { "id": "Airgapped", "name": "Airgapped" },
    "git_repo": "http://git.example.com/platform/edge-orchestrator",
    "artifacts_repo": "http://artifacts.example.com/edge-orchestrator",
    "pipeline": "http://cicd.example.com/edge-orchestrator",
    "specifications": [{ "id": "KubeEdgeNodeSpec", "name": "KubeEdge Node Spec" }, { "id": "MQTTSpec", "name": "MQTT Broker Spec" }],
    "version": "1.0.0",
  },
  {
    "name": "Zero-Trust Security Fabric",
    "owner": "Cybersecurity Office", "owner_email": "security@example.com",
    "product_image": "https://picsum.photos/seed/product5/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "PeerSecurityReview", "name": "Peer Security Review" },
    "custom_workflows": [],
    "cmdb": { "id": "GlobalCMDB", "name": "Global CMDB" },
    "compliance_checks": [{ "id": "SOC2", "name": "SOC2" }, { "id": "FedRAMP", "name": "FedRAMP" }],
    "deployment_type": { "id": "Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/security-fabric",
    "artifacts_repo": "http://artifacts.example.com/security-fabric",
    "pipeline": "http://cicd.example.com/security-fabric",
    "specifications": [{ "id": "IstioServiceMesh", "name": "Istio Service Mesh" }, { "id": "SPIFFEIdentity", "name": "SPIFFE Identity" }],
    "version": "1.0.0",
  }
];

const initialSpecifications = [
  // For Product_OSS_Portal
  { "name": "ArgoCD Sync Spec", "vendor": "CNCF" },
  { "name": "Single Sign-On Spec", "vendor": "OpenID" },
  // For Product_Data_Fabric
  { "name": "Spark Processing", "vendor": "Apache" },
  { "name": "Kafka Streaming", "vendor": "Apache" },
  // For Product_ML_Platform
  { "name": "Kubeflow Pipelines", "vendor": "Google" },
  { "name": "PyTorch Distribution", "vendor": "Facebook" },
  // For Product_Edge_Orchestrator
  { "name": "KubeEdge Node Spec", "vendor": "CNCF" },
  { "name": "MQTT Broker Spec", "vendor": "OASIS" },
  // For Product_Security_Fabric
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
    { "name": "Flow 1", "description": "Standard linear workflow." },
    { "name": "Flow 2", "description": "Workflow with parallel approval steps." },
    { "name": "Security Review", "description": "Mandatory security review for sensitive products." }
];

const initialInterfaceTypes: Omit<CmdbInterfaceType, '_id'>[] = [
    { id: 'REST', name: 'REST API' },
    { id: 'GraphQL', name: 'GraphQL API' },
    { id: 'gRPC', name: 'gRPC Service' },
    { id: 'KafkaTopic', name: 'Kafka Topic' },
];

const initialInterfaces: Omit<CmdbInterface, '_id' | 'created_at' | 'updated_at'>[] = [
  {
    id: 'AuthServiceREST',
    name: 'Authentication Service REST API',
    type: { id: 'REST', name: 'REST API' },
    version: 'v1.2.0',
    owner_name: 'Identity Team',
    owner_email: 'identity@example.com',
    source: { id: 'AuthService', name: 'Authentication Service' },
    security: { internal: { secure: true, authentication: true }, external: { secure: true, authentication: true } },
  },
  {
    id: 'DataIngestKafka',
    name: 'Data Ingest Kafka Topic',
    type: { id: 'KafkaTopic', name: 'Kafka Topic' },
    version: 'v1.0.0',
    owner_name: 'Data Platform Team',
    owner_email: 'data-platform@example.com',
    source: { id: 'DataIngestService', name: 'Data Ingest Service' },
    security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } },
  },
];

const initialComponents: Omit<CmdbComponent, '_id' | 'created_at' | 'updated_at'>[] = [
    {
        id: 'AuthService',
        name: 'Authentication Service',
        version: '1.5.2',
        tenants: [{id: 'PlatformTenant', name: 'Platform Tenant'}],
        provided_interfaces: [{ id: 'AuthServiceREST', name: 'Authentication Service REST API' }],
        phases: [],
    },
    {
        id: 'DataIngestService',
        name: 'Data Ingest Service',
        version: '2.1.0',
        tenants: [{id: 'PlatformTenant', name: 'Platform Tenant'}],
        provided_interfaces: [{ id: 'DataIngestKafka', name: 'Data Ingest Kafka Topic' }],
        phases: [],
    }
];

const initialApplications: Omit<CmdbApplication, '_id' | 'created_at' | 'updated_at'>[] = [
    {
        id: 'DashboardApp',
        name: 'Dashboard Application',
        version: '3.0.0',
        tenants: [{id: 'PlatformTenant', name: 'Platform Tenant'}],
        dependent_interfaces: [{ id: 'AuthServiceREST', name: 'Authentication Service REST API' }],
        phases: [],
    },
     {
        id: 'AnalyticsApp',
        name: 'Analytics Application',
        version: '1.2.0',
        tenants: [{id: 'PlatformTenant', name: 'Platform Tenant'}],
        dependent_interfaces: [{ id: 'DataIngestKafka', name: 'Data Ingest Kafka Topic' }],
        phases: [],
    }
];

const initialTenants: Omit<CmdbTenant, '_id'| 'created_at' | 'updated_at'>[] = [
    {
        id: 'PlatformTenant',
        name: 'Platform Tenant',
        description: 'The main tenant for all platform services.',
        version: '1.0.0',
        products: [{ id: 'OneStopShopPortal', name: 'OneStopShop Portal'}, { id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}],
        phases: [],
    },
    {
        id: 'FinanceTenant',
        name: 'Finance Tenant',
        description: 'Tenant for the finance department applications.',
        version: '1.0.0',
        products: [{ id: 'OneStopShopPortal', name: 'OneStopShop Portal'}],
        phases: [],
    }
];

export async function seedDatabase() {
    const client = await clientPromise;
    const db = client.db();

    const collectionsToSeed = [
        { name: 'products', data: initialProducts.map(p => ({...p, _id: p.name.replace(/[^a-zA-Z0-9]/g, ''), created_at: new Date().toISOString(), updated_at: new Date().toISOString()})) },
        { name: 'specifications', data: fullSpecifications },
        { name: 'deployment_types', data: initialDeploymentTypes.map(d => ({ ...d, _id: d.name.replace(/[^a-zA-Z0-9]/g, '') })) },
        { name: 'workflows', data: initialWorkflows.map(w => ({ ...w, _id: w.name.replace(/[^a-zA-Z0-9]/g, '') })) },
        { name: 'cmdb_tenants', data: initialTenants.map(t => ({ ...t, _id: t.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })) },
        { name: 'cmdb_components', data: initialComponents.map(c => ({ ...c, _id: c.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })) },
        { name: 'cmdb_applications', data: initialApplications.map(a => ({ ...a, _id: a.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })) },
        { name: 'cmdb_interface_types', data: initialInterfaceTypes.map(i => ({ ...i, _id: i.id })) },
        { name: 'cmdb_interfaces', data: initialInterfaces.map(i => ({ ...i, _id: i.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })) },
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

