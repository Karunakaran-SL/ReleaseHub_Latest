
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

const initialTenants: Omit<CmdbTenant, '_id'| 'created_at' | 'updated_at'>[] = [
    { id: 'CorePlatformServices', name: 'Core Platform Services', description: 'Holds core infrastructure components.', version: '2.0.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}, {id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}], phases: [] },
    { id: 'CustomerAnalytics', name: 'Customer Analytics', description: 'Tenant for customer-facing analytics dashboards.', version: '1.5.0', products: [{id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}], dependent_tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services', version: '2.0.0'}], phases: [] },
    { id: 'RetailOperations', name: 'Retail Operations', description: 'Manages retail and e-commerce services.', version: '1.2.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}], dependent_tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services', version: '2.0.0'}], phases: [] },
    { id: 'SupplyChainLogistics', name: 'Supply Chain Logistics', description: 'Tenant for SCM and logistics.', version: '3.0.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}], dependent_tenants: [{id: 'RetailOperations', name: 'Retail Operations', version: '1.2.0'}], phases: [] },
    { id: 'MarketingAutomation', name: 'Marketing Automation', description: 'Handles marketing campaigns and user outreach.', version: '1.0.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}], dependent_tenants: [{id: 'CustomerAnalytics', name: 'Customer Analytics', version: '1.5.0'}], phases: [] },
    { id: 'FraudDetection', name: 'Fraud Detection', description: 'Real-time fraud detection services.', version: '2.1.0', products: [{id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}], dependent_tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services', version: '2.0.0'}], phases: [] },
    { id: 'BillingAndPayments', name: 'Billing and Payments', description: 'Handles all financial transactions.', version: '4.0.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}], dependent_tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services', version: '2.0.0'}], phases: [] },
    { id: 'HumanResources', name: 'Human Resources', description: 'Internal HR systems.', version: '1.8.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}], phases: [] },
    { id: 'DataScienceWorkbench', name: 'Data Science Workbench', description: 'Environment for data scientists.', version: '1.3.0', products: [{id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}], dependent_tenants: [{id: 'CustomerAnalytics', name: 'Customer Analytics', version: '1.5.0'}], phases: [] },
    { id: 'IoTPlatform', name: 'IoT Platform', description: 'Platform for managing IoT devices.', version: '2.5.0', products: [{id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}], dependent_tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services', version: '2.0.0'}], phases: [] },
];

const initialComponents: Omit<CmdbComponent, '_id' | 'created_at' | 'updated_at'>[] = [
    { id: 'AuthNService', name: 'AuthN Service', version: '3.1.0', tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services'}], provided_interfaces: [{id: 'AuthNTokenAPI', name: 'AuthN Token API'}], phases: [] },
    { id: 'AuthZService', name: 'AuthZ Service', version: '2.5.0', tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services'}], provided_interfaces: [{id: 'AuthZCheckAPI', name: 'AuthZ Check API'}], dependent_interfaces: [{id: 'AuthNTokenAPI', name: 'AuthN Token API'}], phases: [] },
    { id: 'DataIngestor', name: 'Data Ingestor', version: '1.8.0', tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services'}], provided_interfaces: [{id: 'DataIngestTopic', name: 'Data Ingest Topic'}], phases: [] },
    { id: 'DataProcessor', name: 'Data Processor', version: '2.2.0', tenants: [{id: 'CustomerAnalytics', name: 'Customer Analytics'}], dependent_interfaces: [{id: 'DataIngestTopic', name: 'Data Ingest Topic'}], provided_interfaces: [{id: 'ProcessedAnalyticsTopic', name: 'Processed Analytics Topic'}], phases: [] },
    { id: 'ProductCatalog', name: 'Product Catalog', version: '4.0.0', tenants: [{id: 'RetailOperations', name: 'Retail Operations'}], provided_interfaces: [{id: 'ProductCatalogDB', name: 'Product Catalog DB'}], phases: [] },
    { id: 'InventoryService', name: 'Inventory Service', version: '3.5.0', tenants: [{id: 'RetailOperations', name: 'Retail Operations'}], dependent_interfaces: [{id: 'ProductCatalogDB', name: 'Product Catalog DB'}], provided_interfaces: [{id: 'InventoryCheckAPI', name: 'Inventory Check API'}], phases: [] },
    { id: 'ShippingCalculator', name: 'Shipping Calculator', version: '1.2.0', tenants: [{id: 'SupplyChainLogistics', name: 'Supply Chain Logistics'}], provided_interfaces: [{id: 'ShippingRateAPI', name: 'Shipping Rate API'}], phases: [] },
    { id: 'ShipmentTracker', name: 'Shipment Tracker', version: '2.0.0', tenants: [{id: 'SupplyChainLogistics', name: 'Supply Chain Logistics'}], provided_interfaces: [{id: 'ShipmentStatusAPI', name: 'Shipment Status API'}], phases: [] },
    { id: 'EmailService', name: 'Email Service', version: '5.1.0', tenants: [{id: 'MarketingAutomation', name: 'Marketing Automation'}], provided_interfaces: [{id: 'SendEmailAPI', name: 'Send Email API'}], phases: [] },
    { id: 'PushNotificationService', name: 'Push Notification Service', version: '2.3.0', tenants: [{id: 'MarketingAutomation', name: 'Marketing Automation'}], provided_interfaces: [{id: 'SendPushAPI', name: 'Send Push API'}], phases: [] },
    { id: 'RiskEngine', name: 'Risk Engine', version: '3.0.0', tenants: [{id: 'FraudDetection', name: 'Fraud Detection'}], dependent_interfaces: [{id: 'DataIngestTopic', name: 'Data Ingest Topic'}], provided_interfaces: [{id: 'FraudScoreAPI', name: 'Fraud Score API'}], phases: [] },
    { id: 'PaymentGateway', name: 'Payment Gateway', version: '6.2.0', tenants: [{id: 'BillingAndPayments', name: 'Billing and Payments'}], provided_interfaces: [{id: 'ProcessPaymentAPI', name: 'Process Payment API'}], phases: [] },
    { id: 'InvoiceGenerator', name: 'Invoice Generator', version: '2.8.0', tenants: [{id: 'BillingAndPayments', name: 'Billing and Payments'}], provided_interfaces: [{id: 'InvoiceAPI', name: 'Invoice API'}], phases: [] },
    { id: 'PayrollProcessor', name: 'Payroll Processor', version: '4.1.0', tenants: [{id: 'HumanResources', name: 'Human Resources'}], phases: [] },
    { id: 'BenefitsManager', name: 'Benefits Manager', version: '1.5.0', tenants: [{id: 'HumanResources', name: 'Human Resources'}], phases: [] },
    { id: 'JupyterHub', name: 'Jupyter Hub', version: '2.0.0', tenants: [{id: 'DataScienceWorkbench', name: 'Data Science Workbench'}], phases: [] },
    { id: 'MLModelServing', name: 'ML Model Serving', version: '1.7.0', tenants: [{id: 'DataScienceWorkbench', name: 'Data Science Workbench'}], dependent_interfaces: [{id: 'ProcessedAnalyticsTopic', name: 'Processed Analytics Topic'}], phases: [] },
    { id: 'DeviceRegistry', name: 'Device Registry', version: '3.2.0', tenants: [{id: 'IoTPlatform', name: 'IoT Platform'}], provided_interfaces: [{id: 'DeviceRegistryAPI', name: 'Device Registry API'}], phases: [] },
    { id: 'MQTTBroker', name: 'MQTT Broker', version: '5.0.0', tenants: [{id: 'IoTPlatform', name: 'IoT Platform'}], dependent_interfaces: [{id: 'DeviceRegistryAPI', name: 'Device Registry API'}], phases: [] },
    { id: 'TimeSeriesDB', name: 'Time Series DB', version: '2.9.0', tenants: [{id: 'IoTPlatform', name: 'IoT Platform'}], phases: [] },
];

const initialApplications: Omit<CmdbApplication, '_id' | 'created_at' | 'updated_at'>[] = [
    { id: 'UserProfileApp', name: 'User Profile App', version: '1.5.0', tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services'}], dependent_interfaces: [{id: 'AuthNTokenAPI', name: 'AuthN Token API'}, {id: 'AuthZCheckAPI', name: 'AuthZ Check API'}], phases: [] },
    { id: 'AnalyticsDashboard', name: 'Analytics Dashboard', version: '2.1.0', tenants: [{id: 'CustomerAnalytics', name: 'Customer Analytics'}], dependent_interfaces: [{id: 'ProcessedAnalyticsTopic', name: 'Processed Analytics Topic'}], phases: [] },
    { id: 'RetailStorefront', name: 'Retail Storefront', version: '3.2.0', tenants: [{id: 'RetailOperations', name: 'Retail Operations'}], dependent_interfaces: [{id: 'ProductCatalogDB', name: 'Product Catalog DB'}, {id: 'InventoryCheckAPI', name: 'Inventory Check API'}, {id: 'ProcessPaymentAPI', name: 'Process Payment API'}], phases: [] },
    { id: 'WarehouseManager', name: 'Warehouse Manager', version: '1.8.0', tenants: [{id: 'SupplyChainLogistics', name: 'Supply Chain Logistics'}], dependent_interfaces: [{id: 'InventoryCheckAPI', name: 'Inventory Check API'}, {id: 'ShipmentStatusAPI', name: 'Shipment Status API'}], phases: [] },
    { id: 'MarketingCampaignDashboard', name: 'Marketing Campaign Dashboard', version: '1.1.0', tenants: [{id: 'MarketingAutomation', name: 'Marketing Automation'}], dependent_interfaces: [{id: 'SendEmailAPI', name: 'Send Email API'}, {id: 'SendPushAPI', name: 'Send Push API'}], phases: [] },
    { id: 'FraudAnalystConsole', name: 'Fraud Analyst Console', version: '2.4.0', tenants: [{id: 'FraudDetection', name: 'Fraud Detection'}], dependent_interfaces: [{id: 'FraudScoreAPI', name: 'Fraud Score API'}], phases: [] },
    { id: 'BillingDashboard', name: 'Billing Dashboard', version: '3.0.0', tenants: [{id: 'BillingAndPayments', name: 'Billing and Payments'}], dependent_interfaces: [{id: 'InvoiceAPI', name: 'Invoice API'}], phases: [] },
    { id: 'EmployeePortal', name: 'Employee Portal', version: '2.5.0', tenants: [{id: 'HumanResources', name: 'Human Resources'}], dependent_interfaces: [], phases: [] },
    { id: 'DSModelBuilder', name: 'DS Model Builder', version: '1.9.0', tenants: [{id: 'DataScienceWorkbench', name: 'Data Science Workbench'}], dependent_interfaces: [], phases: [] },
    { id: 'DeviceProvisioner', name: 'Device Provisioner', version: '2.2.0', tenants: [{id: 'IoTPlatform', name: 'IoT Platform'}], dependent_interfaces: [{id: 'DeviceRegistryAPI', name: 'Device Registry API'}], phases: [] },
    { id: 'AdminConsole', name: 'Admin Console', version: '1.0.0', tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services'}], dependent_interfaces: [{id: 'AuthZCheckAPI', name: 'AuthZ Check API'}], phases: [] },
    { id: 'ReportGeneratorApp', name: 'Report Generator App', version: '1.2.0', tenants: [{id: 'CustomerAnalytics', name: 'Customer Analytics'}], dependent_interfaces: [{id: 'ProcessedAnalyticsTopic', name: 'Processed Analytics Topic'}], phases: [] },
    { id: 'ShoppingCartApp', name: 'Shopping Cart App', version: '2.5.0', tenants: [{id: 'RetailOperations', name: 'Retail Operations'}], dependent_interfaces: [{id: 'InventoryCheckAPI', name: 'Inventory Check API'}, {id: 'ProcessPaymentAPI', name: 'Process Payment API'}], phases: [] },
    { id: 'FleetManagementApp', name: 'Fleet Management App', version: '1.4.0', tenants: [{id: 'SupplyChainLogistics', name: 'Supply Chain Logistics'}], dependent_interfaces: [{id: 'ShipmentStatusAPI', name: 'Shipment Status API'}], phases: [] },
    { id: 'ABTestingApp', name: 'A/B Testing App', version: '1.0.0', tenants: [{id: 'MarketingAutomation', name: 'Marketing Automation'}], dependent_interfaces: [], phases: [] },
    { id: 'TransactionMonitor', name: 'Transaction Monitor', version: '3.1.0', tenants: [{id: 'FraudDetection', name: 'Fraud Detection'}], dependent_interfaces: [{id: 'FraudScoreAPI', name: 'Fraud Score API'}], phases: [] },
    { id: 'SubscriptionManager', name: 'Subscription Manager', version: '2.0.0', tenants: [{id: 'BillingAndPayments', name: 'Billing and Payments'}], dependent_interfaces: [{id: 'ProcessPaymentAPI', name: 'Process Payment API'}], phases: [] },
    { id: 'TimeOffManager', name: 'Time Off Manager', version: '1.3.0', tenants: [{id: 'HumanResources', name: 'Human Resources'}], dependent_interfaces: [], phases: [] },
    { id: 'FeatureStoreApp', name: 'Feature Store App', version: '1.1.0', tenants: [{id: 'DataScienceWorkbench', name: 'Data Science Workbench'}], dependent_interfaces: [], phases: [] },
    { id: 'DeviceMonitorDashboard', name: 'Device Monitor Dashboard', version: '2.0.0', tenants: [{id: 'IoTPlatform', name: 'IoT Platform'}], dependent_interfaces: [], phases: [] },
];

const initialInterfaces: Omit<CmdbInterface, '_id' | 'created_at' | 'updated_at'>[] = [
    { id: 'AuthNTokenAPI', name: 'AuthN Token API', type: { id: 'REST', name: 'REST API' }, version: 'v3', owner_name: 'Auth Team', owner_email: 'auth@example.com', source: { id: 'AuthNService', name: 'AuthN Service' }, security: { internal: { secure: true, authentication: false }, external: { secure: false, authentication: false } } },
    { id: 'AuthZCheckAPI', name: 'AuthZ Check API', type: { id: 'gRPC', name: 'gRPC Service' }, version: 'v2', owner_name: 'Auth Team', owner_email: 'auth@example.com', source: { id: 'AuthZService', name: 'AuthZ Service' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'DataIngestTopic', name: 'Data Ingest Topic', type: { id: 'KafkaTopic', name: 'Kafka Topic' }, version: 'v1', owner_name: 'Data Platform', owner_email: 'data-platform@example.com', source: { id: 'DataIngestor', name: 'Data Ingestor' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'ProcessedAnalyticsTopic', name: 'Processed Analytics Topic', type: { id: 'KafkaTopic', name: 'Kafka Topic' }, version: 'v1', owner_name: 'Analytics Team', owner_email: 'analytics@example.com', source: { id: 'DataProcessor', name: 'Data Processor' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'ProductCatalogDB', name: 'Product Catalog DB', type: { id: 'DatabaseConnection', name: 'Database Connection' }, version: 'v1', owner_name: 'Retail Team', owner_email: 'retail@example.com', source: { id: 'ProductCatalog', name: 'Product Catalog' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'InventoryCheckAPI', name: 'Inventory Check API', type: { id: 'REST', name: 'REST API' }, version: 'v2', owner_name: 'Retail Team', owner_email: 'retail@example.com', source: { id: 'InventoryService', name: 'Inventory Service' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'ShippingRateAPI', name: 'Shipping Rate API', type: { id: 'GraphQL', name: 'GraphQL API' }, version: 'v1', owner_name: 'Logistics Team', owner_email: 'logistics@example.com', source: { id: 'ShippingCalculator', name: 'Shipping Calculator' }, security: { internal: { secure: true, authentication: true }, external: { secure: true, authentication: true } } },
    { id: 'ShipmentStatusAPI', name: 'Shipment Status API', type: { id: 'REST', name: 'REST API' }, version: 'v3', owner_name: 'Logistics Team', owner_email: 'logistics@example.com', source: { id: 'ShipmentTracker', name: 'Shipment Tracker' }, security: { internal: { secure: true, authentication: true }, external: { secure: true, authentication: true } } },
    { id: 'SendEmailAPI', name: 'Send Email API', type: { id: 'REST', name: 'REST API' }, version: 'v4', owner_name: 'Marketing Team', owner_email: 'marketing@example.com', source: { id: 'EmailService', name: 'Email Service' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'SendPushAPI', name: 'Send Push API', type: { id: 'REST', name: 'REST API' }, version: 'v2', owner_name: 'Marketing Team', owner_email: 'marketing@example.com', source: { id: 'PushNotificationService', name: 'Push Notification Service' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'FraudScoreAPI', name: 'Fraud Score API', type: { id: 'gRPC', name: 'gRPC Service' }, version: 'v3', owner_name: 'Security Team', owner_email: 'security@example.com', source: { id: 'RiskEngine', name: 'Risk Engine' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'ProcessPaymentAPI', name: 'Process Payment API', type: { id: 'REST', name: 'REST API' }, version: 'v5', owner_name: 'Billing Team', owner_email: 'billing@example.com', source: { id: 'PaymentGateway', name: 'Payment Gateway' }, security: { internal: { secure: true, authentication: true }, external: { secure: true, authentication: true } } },
    { id: 'InvoiceAPI', name: 'Invoice API', type: { id: 'GraphQL', name: 'GraphQL API' }, version: 'v2', owner_name: 'Billing Team', owner_email: 'billing@example.com', source: { id: 'InvoiceGenerator', name: 'Invoice Generator' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'DeviceRegistryAPI', name: 'Device Registry API', type: { id: 'REST', name: 'REST API' }, version: 'v1', owner_name: 'IoT Team', owner_email: 'iot@example.com', source: { id: 'DeviceRegistry', name: 'Device Registry' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    // Adding 36 more dummy interfaces to reach 50+
    ...Array.from({ length: 36 }, (_, i) => ({
        id: `ExternalInterface${i + 1}`,
        name: `External Interface ${i + 1}`,
        type: { id: i % 2 === 0 ? 'GraphQL' : 'REST', name: i % 2 === 0 ? 'GraphQL API' : 'REST API' },
        version: `v1`,
        owner_name: `Partner Team ${i + 1}`,
        owner_email: `partner${i + 1}@example.com`,
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
