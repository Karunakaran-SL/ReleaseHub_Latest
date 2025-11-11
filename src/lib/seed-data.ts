
import clientPromise from '@/lib/mongodb';
import { generateAndStoreAllProductTrees } from '@/lib/dependency-graph';
import type { Product, CmdbTenant, CmdbComponent, CmdbApplication, CmdbInterfaceType } from './definitions';

const initialProducts: Omit<Product, '_id' | 'created_at' | 'updated_at'>[] = [
  {
    "name": "OneStopShop Portal",
    "owner": "Platform Engineering", "owner_email": "platform@example.com",
    "product_image": "https://picsum.photos/seed/product1/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "Workflow_Standard_Approval", "name": "Standard Approval" },
    "custom_workflows": [],
    "cmdb": { "id": "CMDB_Global", "name": "Global CMDB" },
    "compliance_checks": [{ "id": "Compliance_SOC2", "name": "SOC2" }, { "id": "Compliance_GDPR", "name": "GDPR" }],
    "deployment_type": { "id": "Deployment_Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/oss-portal",
    "artifacts_repo": "http://artifacts.example.com/oss-portal",
    "pipeline": "http://cicd.example.com/oss-portal",
    "specifications": [{ "id": "Spec_ArgoCD_v2.8", "name": "ArgoCD Sync Spec" }, { "id": "Spec_SSO_v1.2", "name": "Single Sign-On Spec" }],
    "version": "1.0.0",
  },
  {
    "name": "Unified Data Fabric",
    "owner": "Data Platform Team", "owner_email": "data-platform@example.com",
    "product_image": "https://picsum.photos/seed/product2/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "Workflow_Data_Governance", "name": "Data Governance Review" },
    "custom_workflows": [],
    "cmdb": { "id": "CMDB_Global", "name": "Global CMDB" },
    "compliance_checks": [{ "id": "Compliance_HIPAA", "name": "HIPAA" }],
    "deployment_type": { "id": "Deployment_Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/data-fabric",
    "artifacts_repo": "http://artifacts.example.com/data-fabric",
    "pipeline": "http://cicd.example.com/data-fabric",
    "specifications": [{ "id": "Spec_Spark_v3.5", "name": "Spark Processing" }, { "id": "Spec_Kafka_v3.7", "name": "Kafka Streaming" }],
    "version": "1.0.0",
  },
  {
    "name": "AI/ML Workbench",
    "owner": "AI Research Group", "owner_email": "ai-research@example.com",
    "product_image": "https://picsum.photos/seed/product3/40/40",
    "approval_needed": false,
    "default_workflow": { "id": "Workflow_Standard_Approval", "name": "Standard Approval" },
    "custom_workflows": [],
    "cmdb": { "id": "CMDB_Global", "name": "Global CMDB" },
    "compliance_checks": [],
    "deployment_type": { "id": "Deployment_Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/ml-workbench",
    "artifacts_repo": "http://artifacts.example.com/ml-workbench",
    "pipeline": "http://cicd.example.com/ml-workbench",
    "specifications": [{ "id": "Spec_Kubeflow_v1.8", "name": "Kubeflow Pipelines" }, { "id": "Spec_PyTorch_v2.1", "name": "PyTorch Distribution" }],
    "version": "1.0.0",
  },
  {
    "name": "Edge Computing Orchestrator",
    "owner": "IoT Division", "owner_email": "iot@example.com",
    "product_image": "https://picsum.photos/seed/product4/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "Workflow_Hardware_Review", "name": "Hardware Compatibility Review" },
    "custom_workflows": [],
    "cmdb": { "id": "CMDB_Edge", "name": "Edge CMDB" },
    "compliance_checks": [{ "id": "Compliance_FedRAMP", "name": "FedRAMP" }],
    "deployment_type": { "id": "Deployment_Airgapped", "name": "Airgapped" },
    "git_repo": "http://git.example.com/platform/edge-orchestrator",
    "artifacts_repo": "http://artifacts.example.com/edge-orchestrator",
    "pipeline": "http://cicd.example.com/edge-orchestrator",
    "specifications": [{ "id": "Spec_KubeEdge_v1.15", "name": "KubeEdge Node Spec" }, { "id": "Spec_MQTT_v5.0", "name": "MQTT Broker Spec" }],
    "version": "1.0.0",
  },
  {
    "name": "Zero-Trust Security Fabric",
    "owner": "Cybersecurity Office", "owner_email": "security@example.com",
    "product_image": "https://picsum.photos/seed/product5/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "Workflow_Security_Review", "name": "Peer Security Review" },
    "custom_workflows": [],
    "cmdb": { "id": "CMDB_Global", "name": "Global CMDB" },
    "compliance_checks": [{ "id": "Compliance_SOC2", "name": "SOC2" }, { "id": "Compliance_FedRAMP", "name": "FedRAMP" }],
    "deployment_type": { "id": "Deployment_Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/security-fabric",
    "artifacts_repo": "http://artifacts.example.com/security-fabric",
    "pipeline": "http://cicd.example.com/security-fabric",
    "specifications": [{ "id": "Spec_Istio_v1.20", "name": "Istio Service Mesh" }, { "id": "Spec_SPIFFE_v1.2", "name": "SPIFFE Identity" }],
    "version": "1.0.0",
  }
];

const initialSpecifications = [
  // For Product_OSS_Portal
  { "_id": "Spec_ArgoCD_v2.8", "name": "ArgoCD Sync Spec", "vendor": "CNCF" },
  { "_id": "Spec_SSO_v1.2", "name": "Single Sign-On Spec", "vendor": "OpenID" },
  // For Product_Data_Fabric
  { "_id": "Spec_Spark_v3.5", "name": "Spark Processing", "vendor": "Apache" },
  { "_id": "Spec_Kafka_v3.7", "name": "Kafka Streaming", "vendor": "Apache" },
  // For Product_ML_Platform
  { "_id": "Spec_Kubeflow_v1.8", "name": "Kubeflow Pipelines", "vendor": "Google" },
  { "_id": "Spec_PyTorch_v2.1", "name": "PyTorch Distribution", "vendor": "Facebook" },
  // For Product_Edge_Orchestrator
  { "_id": "Spec_KubeEdge_v1.15", "name": "KubeEdge Node Spec", "vendor": "CNCF" },
  { "_id": "Spec_MQTT_v5.0", "name": "MQTT Broker Spec", "vendor": "OASIS" },
  // For Product_Security_Fabric
  { "_id": "Spec_Istio_v1.20", "name": "Istio Service Mesh", "vendor": "CNCF" },
  { "_id": "Spec_SPIFFE_v1.2", "name": "SPIFFE Identity", "vendor": "CNCF" }
];

const fullSpecifications = initialSpecifications.map(spec => ({
    ...spec,
    hw_type: { "id": "HWType_Virtual", "name": "Virtual" },
    total_cpu: 32, 
    memory_gb: 128, 
    storage_gb: 1024,
    hypervisor: { "id": "Hypervisor_KVM", "name": "KVM" },
    image: `https://picsum.photos/seed/${spec._id}/40/40`,
    service_contract_type: { "id": "ServiceContract_Community", "name": "Community Support" },
    contact_point_email: "community@cncf.io",
    contact_point_phone: "N/A",
    network_cards: [{ "id": "NetworkCard_Virtual_10G", "name": "Virtual NIC 10Gbps" }],
    plug_power_cords: [{ "id": "PowerCord_Virtual", "name": "Virtual Power" }],
    custom_fields: [{ "key": "Managed By", "value": "Platform Team" }],
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString()
}));


const initialDeploymentTypes = [
    { "_id": "Deployment_Airgapped", "id": "Deployment_Airgapped", "name": "Airgapped", "description": "Deployment in an isolated, offline environment." },
    { "_id": "Deployment_Cloud", "id": "Deployment_Cloud", "name": "Cloud", "description": "Deployment to a public or private cloud." },
    { "_id": "Deployment_OnPrem", "id": "Deployment_OnPrem", "name": "On-Prem", "description": "Deployment to on-premises servers." }
];

const initialWorkflows = [
    { "_id": "Workflow_Flow_1", "id": "Workflow_Flow_1", "name": "Flow 1", "description": "Standard linear workflow." },
    { "_id": "Workflow_Flow_2", "id": "Workflow_Flow_2", "name": "Flow 2", "description": "Workflow with parallel approval steps." },
    { "_id": "Workflow_Security_Review", "id": "Workflow_Security_Review", "name": "Security Review", "description": "Mandatory security review for sensitive products." }
];

export async function seedDatabase() {
    const client = await clientPromise;
    const db = client.db();

    const collectionsToSeed = [
        { name: 'products', data: initialProducts.map(p => ({...p, _id: `Product_${p.name.replace(/\s+/g, '_')}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString()})) },
        { name: 'specifications', data: fullSpecifications },
        { name: 'deployment_types', data: initialDeploymentTypes },
        { name: 'workflows', data: initialWorkflows },
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
