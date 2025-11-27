
import clientPromise from '@/lib/mongodb';
import { generateAndStoreAllProductTrees } from '@/lib/dependency-graph';
import type { Product, CmdbTenant, CmdbComponent, CmdbApplication, CmdbInterfaceType, CmdbInterface, OnboardingConfiguration, OnboardingPhase, License, ProductLicensing, Specification, Deployment, Simulator, Emulator, DevelopmentEnvironment, TestEnvironment, SdkApp, Baseline } from './definitions';

const appCatalogData = [
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Airship",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/airship.svg",
    "website": "https://www.airshipit.org/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Akri",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/akri.svg",
    "website": "https://docs.akri.sh",
    "description": ""
  },
  {
    "category": "Databases",
    "subcategory": "Automation & Configuration",
    "name": "Couler",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/couler.svg",
    "website": "https://couler-proj.github.io/couler/index.html",
    "description": ""
  },
  {
    "category": "Databases",
    "subcategory": "Automation & Configuration",
    "name": "DevStream",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/devstream.svg",
    "website": "https://www.devstream.io/",
    "description": ""
  },
  {
    "category": "Security",
    "subcategory": "Automation & Configuration",
    "name": "Foreman",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/foreman.svg",
    "website": "https://theforeman.org/",
    "description": ""
  },
  {
    "category": "Security",
    "subcategory": "Automation & Configuration",
    "name": "Goose",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/goose.svg",
    "website": "https://block.github.io/goose/",
    "description": ""
  },
  {
    "category": "Install",
    "subcategory": "Automation & Configuration",
    "name": "Gthulhu",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/gthulhu.svg",
    "website": "https://gthulhu.github.io/docs/",
    "description": "Gthulhu optimizes cloud-native workloads using the Linux Scheduler Extension for different application scenarios."
  },
  {
    "category": "Install",
    "subcategory": "Automation & Configuration",
    "name": "Idem Project",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/idem-project.svg",
    "website": "https://www.idemproject.io",
    "description": "Idem reduces your cloud configuration to data – for you! Instead of Infrastructure as Code, Idem delivers Infrastructure as Data. The cloud becomes simplified, easier to maintain, easier to discover, and easier to use."
  },
  {
    "category": "Pipeline",
    "subcategory": "Automation & Configuration",
    "name": "Juju",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/juju.svg",
    "website": "https://jaas.ai/",
    "description": ""
  },
  {
    "category": "Pipeline",
    "subcategory": "Automation & Configuration",
    "name": "kagent",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kagent.svg",
    "website": "https://kagent.dev/",
    "description": "Kagent is an open source programming framework designed for DevOps and platform engineers to run AI agents in Kubernetes"
  },
  {
    "category": "Messaging",
    "subcategory": "Automation & Configuration",
    "name": "Kairos",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kairos.svg",
    "website": "https://kairos.io",
    "description": ""
  },
  {
    "category": "Messaging",
    "subcategory": "Automation & Configuration",
    "name": "Kapitan",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kapitan.svg",
    "website": "https://kapitan.dev/",
    "description": "A configuration management system for platform engineering and other things"
  },
  {
    "category": "Storage",
    "subcategory": "Automation & Configuration",
    "name": "KCL",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kcl.svg",
    "website": "https://kcl-lang.io/",
    "description": "A constraint-based record & functional language mainly used in configuration and policy scenarios."
  },
  {
    "category": "Storage",
    "subcategory": "Automation & Configuration",
    "name": "KitOps",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kitops.svg",
    "website": "https://kitops.org/",
    "description": "An open standard for packaging, managing, and deploying ML models and artifacts across different systems"
  },
  {
    "category": "Load Balancer",
    "subcategory": "Automation & Configuration",
    "name": "kiosk",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kiosk.svg",
    "website": "https://github.com/loft-sh/kiosk",
    "description": ""
  },
  {
    "category": "Load Balancer",
    "subcategory": "Automation & Configuration",
    "name": "Kosko",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kosko.svg",
    "website": "https://kosko.dev",
    "description": "Kosko can help you organize your Kubernetes manifests in TypeScript, manage multiple environments, ensure type safety using OpenAPI schema, and find issues in your manifests."
  },
  {
    "category": "API Gateway",
    "subcategory": "Automation & Configuration",
    "name": "kpt",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kpt.svg",
    "website": "https://kpt.dev",
    "description": ""
  },
  {
    "category": "PI Gateway",
    "subcategory": "Automation & Configuration",
    "name": "Kratix",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kratix.svg",
    "website": "https://www.kratix.io/",
    "description": ""
  },
  {
    "category": "Compliance",
    "subcategory": "Automation & Configuration",
    "name": "Kubean",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubean.svg",
    "website": "https://kubean-io.github.io/kubean/",
    "description": "Product ready cluster lifecycle management toolchains based on kubespray and other cluster LCM engine."
  },
  {
    "category": "Compliance",
    "subcategory": "Automation & Configuration",
    "name": "KubeDL",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubedl.svg",
    "website": "https://kubedl.io",
    "description": ""
  },
  {
    "category": "Scaling",
    "subcategory": "Automation & Configuration",
    "name": "KubeEdge",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kube-edge.svg",
    "website": "https://kubeedge.io/en/",
    "description": ""
  },
  {
    "category": "Scaling",
    "subcategory": "Automation & Configuration",
    "name": "Kubefirst",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubefirst.svg",
    "website": "https://docs.kubefirst.com",
    "description": "Instant operational open source gitops platforms for platform engineering, infrastructure, and software teams"
  },
  {
    "category": "Observability",
    "subcategory": "Automation & Configuration",
    "name": "KubeZoo",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubezoo.svg",
    "website": "https://kubewharf.github.io",
    "description": ""
  },
  {
    "category": "Observability",
    "subcategory": "Automation & Configuration",
    "name": "KusionStack",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kusionstack.svg",
    "website": "https://kusionstack.io/",
    "description": ""
  }
];

const initialOnboardingConfig = {
    _id: "default_tenant_onboarding_v1",
    name: 'Tenant Onboarding',
    version: 1,
    phases: [{
        id: 'phase1', name: 'Information Gathering', ownerName: 'John Doe', ownerEmail: 'john.doe@example.com', sendEmailOnComplete: true, statusOptions: ['Not Started', 'In Progress', 'Done'],
        fields: [{ type: 'TextField' as 'TextField', name: 'tenantName', label: 'Tenant Name', helpText: 'The official name of the tenant' }]
    }]
};

const defaultApprovalConfig = {
    _id: "default_approval_v1",
    name: "Default Approval",
    version: 1,
    phases: [{
        id: 'approval1', name: 'Standard Approval', ownerName: 'Release Manager', ownerEmail: 'release@example.com', sendEmailOnComplete: true, statusOptions: ['Pending', 'Approved', 'Rejected'],
        fields: [{ type: 'Checkbox' as 'Checkbox', name: 'approved', label: 'I approve this request', proof: true }]
    }]
};

const initialProducts: Omit<Product, '_id'>[] = [
    {
        name: 'OneStopShop Portal',
        owner: 'Alice',
        owner_email: 'alice@example.com',
        product_image: 'https://picsum.photos/seed/product1/400/400',
        approval_needed: true,
        default_workflow: { id: 'wf-standard', name: 'Standard Approval Workflow' },
        custom_workflows: [],
        cmdb: { id: 'cmdb-main', name: 'Main CMDB' },
        compliance_checks: [{ id: 'cc-pci', name: 'PCI DSS' }],
        deployment_type: { id: 'dt-cloud', name: 'Cloud' },
        git_repo: 'https://github.com/example/onestopshop',
        artifacts_repo: 'https://jfrog.example.com/artifactory/onestopshop',
        pipeline: 'https://jenkins.example.com/job/onestopshop',
        specifications: [{ id: 'StandardVirtual', name: 'Standard Virtual Server' }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: '1.2.3',
    }
];

const initialTenants: Omit<CmdbTenant, '_id'>[] = [
    {
        id: 'acme-corp',
        name: 'ACME Corporation',
        description: 'Primary tenant for ACME Corporation.',
        version: '1.0.0',
        products: [{ id: 'OneStopShopPortal', name: 'OneStopShop Portal' }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

const initialComponents: Omit<CmdbComponent, '_id'>[] = [
    {
        id: 'auth-service',
        name: 'Authentication Service',
        version: '2.1.0',
        tenants: [{ id: 'acme-corp', name: 'ACME Corporation' }],
        phases: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

const initialApplications: Omit<CmdbApplication, '_id'>[] = [
    {
        id: 'dashboard-ui',
        name: 'Dashboard UI',
        version: '1.5.0',
        tenants: [{ id: 'acme-corp', name: 'ACME Corporation' }],
        dependent_components: [{ id: 'auth-service', name: 'Authentication Service' }],
        phases: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

const initialInterfaceTypes: Omit<CmdbInterfaceType, '_id'>[] = [
    { id: 'rest-api', name: 'REST API', description: 'A RESTful API endpoint' }
];

const initialInterfaces: Omit<CmdbInterface, '_id'>[] = [
    {
        id: 'auth-api-v2',
        name: 'Authentication API v2',
        type: { id: 'rest-api', name: 'REST API' },
        version: '2.1.0',
        owner_name: 'Auth Team',
        owner_email: 'auth-team@example.com',
        source: { id: 'auth-service', name: 'Authentication Service' },
        security: { internal: { secure: true, authentication: true }, external: { secure: true, authentication: true } },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

const initialWorkflows: any[] = [
  { _id: 'wf-standard', id: 'wf-standard', name: 'Standard Approval Workflow', description: 'Default workflow for approvals.'}
];

const initialComplianceChecks: any[] = [
  { _id: 'cc-pci', id: 'cc-pci', name: 'PCI DSS', description: 'Payment Card Industry Data Security Standard'}
];

const initialDeploymentTypes: any[] = [
  { _id: 'dt-cloud', id: 'dt-cloud', name: 'Cloud', description: 'Standard cloud deployment.'}
];

const initialServiceContracts: any[] = [];
const initialSpecVendors: any[] = [];
const initialSpecHwTypes: any[] = [];
const initialSpecNetworkCards: any[] = [];
const initialSpecPlugPowerCords: any[] = [];
const initialSpecCpuTypes: any[] = [];
const initialSpecGpuTypes: any[] = [];
const initialSpecDiskTypes: any[] = [];
const initialSpecHypervisors: any[] = [];
const initialLicenses: any[] = [];
const initialProductLicensing: any[] = [];
const fullSpecifications: any[] = [];
const initialPlatformFoundations: any[] = [];
const initialDevEnvironments: any[] = [];
const initialTestEnvironments: any[] = [];
const initialSimulators: any[] = [];
const initialEmulators: any[] = [];
const initialSdkApps: any[] = [];
const initialBaselines: Omit<Baseline, '_id'>[] = [
    {
        product: { id: 'OneStopShopPortal', name: 'OneStopShop Portal', version: '1.2.3' },
        specifications: [{ id: 'StandardVirtual', name: 'Standard Virtual Server', version: '1.0' }],
        tenants: [],
        status: 'RELEASED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'seeduser',
        artifacts: [],
        package_properties: { location: '', checksum_md5: '', checksum_sha256: '' }
    }
];
const initialDeployments: Omit<Deployment, '_id'>[] = [
    {
        productId: 'OneStopShopPortal',
        specificationId: 'StandardVirtual',
        hypervisorId: 'vmware-esxi',
        foundationComponentIds: ['auth-service'],
        security: {},
        details: {
            deploymentId: 'DEP-US-001',
            customer: 'ACME Corporation',
            country: 'United States'
        },
        createdBy: 'seeduser',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE'
    }
];

export async function seedDatabase() {
  const client = await clientPromise;
  const db = client.db();
  
  let seededCount = 0;
  let skippedCount = 0;

  const seedCollection = async (collectionName: string, data: any[]) => {
    const collection = db.collection(collectionName);
    const count = await collection.countDocuments();
    if (count === 0 && data.length > 0) {
      if (collectionName === 'products') {
        const productsWithId = data.map(p => ({...p, _id: p.name.replace(/[^a-zA-Z0-9]/g, '')}));
        await collection.insertMany(productsWithId);
      } else if (collectionName.startsWith('cmdb_') || collectionName === 'workflows' || collectionName === 'compliance_checks' || collectionName === 'deployment_types') {
         await collection.insertMany(data.map(d => ({ ...d, _id: d.id })));
      } else {
        await collection.insertMany(data);
      }
      seededCount++;
      console.log(`Seeded ${collectionName} with ${data.length} documents.`);
    } else {
      skippedCount++;
      console.log(`Skipped seeding ${collectionName}: collection is not empty or no data to seed.`);
    }
  };
  
  await seedCollection('app_catalog', appCatalogData);
  await seedCollection('products', initialProducts);
  await seedCollection('cmdb_tenants', initialTenants);
  await seedCollection('cmdb_components', initialComponents);
  await seedCollection('cmdb_applications', initialApplications);
  await seedCollection('cmdb_interface_types', initialInterfaceTypes);
  await seedCollection('cmdb_interfaces', initialInterfaces);
  await seedCollection('workflows', initialWorkflows);
  await seedCollection('compliance_checks', initialComplianceChecks);
  await seedCollection('deployment_types', initialDeploymentTypes);
  await seedCollection('service_contracts', initialServiceContracts);
  await seedCollection('specification_vendors', initialSpecVendors);
  await seedCollection('specification_hw_types', initialSpecHwTypes);
  await seedCollection('specification_network_cards', initialSpecNetworkCards);
  await seedCollection('specification_plug_power_cords', initialSpecPlugPowerCords);
  await seedCollection('specification_cpu_types', initialSpecCpuTypes);
  await seedCollection('specification_gpu_types', initialSpecGpuTypes);
  await seedCollection('specification_disk_types', initialSpecDiskTypes);
  await seedCollection('specification_hypervisors', initialSpecHypervisors);
  await seedCollection('licenses', initialLicenses);
  await seedCollection('product_licensing', initialProductLicensing);
  await seedCollection('specifications', fullSpecifications);
  await seedCollection('platform_foundations', initialPlatformFoundations);
  await seedCollection('development_environments', initialDevEnvironments);
  await seedCollection('test_environments', initialTestEnvironments);
  await seedCollection('simulators', initialSimulators);
  await seedCollection('emulators', initialEmulators);
  await seedCollection('sdk_apps', initialSdkApps);
  await seedCollection('baselines', initialBaselines);
  await seedCollection('deployments', initialDeployments);

  // Seed settings collections
  await seedCollection('settings_tenant_onboarding', [initialOnboardingConfig]);
  await seedCollection('settings_component_onboarding', [{ ...initialOnboardingConfig, _id: 'default_component_onboarding_v1', name: 'Component Onboarding'}]);
  await seedCollection('settings_application_onboarding', [{ ...initialOnboardingConfig, _id: 'default_application_onboarding_v1', name: 'Application Onboarding'}]);
  await seedCollection('settings_baseline_onboarding', [{ ...initialOnboardingConfig, _id: 'default_baseline_validation_v1', name: 'Baseline Validation'}]);
  
  const approvalTypes = [
    'product_onboarding',
    'tenant_approval',
    'components_approval',
    'application_approval',
    'interface_approval',
    'baseline_approval',
    'deployment_approval',
    'upgrade_approval',
    'migration_approval',
    'decommission_approval',
    'license_approval',
    'export_control_approval',
    'security_approval',
  ];
  
  for (const type of approvalTypes) {
      await seedCollection(`settings_approval_${type}`, [{
          ...defaultApprovalConfig,
          _id: `default_${type}_v1`,
          name: `${type.replace(/_/g, ' ')} Approval`
      }]);
  }

  // After seeding, generate dependency trees
  await generateAndStoreAllProductTrees();
  
  return { seededCount, skippedCount };
}
