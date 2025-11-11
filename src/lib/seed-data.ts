
import clientPromise from '@/lib/mongodb';
import { generateAndStoreAllProductTrees } from '@/lib/dependency-graph';
import type { Product, CmdbTenant, CmdbComponent, CmdbApplication, CmdbInterfaceType } from './definitions';

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
    "specifications": [{ "id": "ArgoCDSyncSpec", "name": "ArgoCD Sync Spec" }, { "id": "SingleSign-OnSpec", "name": "Single Sign-On Spec" }],
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

export async function seedDatabase() {
    const client = await clientPromise;
    const db = client.db();

    const collectionsToSeed = [
        { name: 'products', data: initialProducts.map(p => ({...p, _id: p.name.replace(/[^a-zA-Z0-9]/g, ''), created_at: new Date().toISOString(), updated_at: new Date().toISOString()})) },
        { name: 'specifications', data: fullSpecifications },
        { name: 'deployment_types', data: initialDeploymentTypes.map(d => ({ ...d, _id: d.name.replace(/[^a-zA-Z0-9]/g, '') })) },
        { name: 'workflows', data: initialWorkflows.map(w => ({ ...w, _id: w.name.replace(/[^a-zA-Z0-9]/g, '') })) },
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
