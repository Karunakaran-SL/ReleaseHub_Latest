



export type User = {
  _id: string;
  username: string;
  password?: string;
};

export type SessionPayload = {
  userId: string;
  username: string;
  expiresAt: Date;
};

export type Product = {
  _id: string;
  name: string;
  owner: string;
  owner_email: string;
  product_image: string;
  approval_needed: boolean;
  default_workflow: {
    id: string;
    name: string;
  };
  custom_workflows: {
    id: string;
    name: string;
  }[];
  cmdb: {
    id: string;
    name: string;
  };
  compliance_checks: {
    id:string;
    name: string;
  }[];
  deployment_type: {
    id: string;
    name: string;
  };
  git_repo: string;
  artifacts_repo: string;
  pipeline: string;
  specifications?: {
    id: string;
    name: string;
  }[];
  created_at: string;
  updated_at: string;
  version: string;
};

export type VirtualNode = {
  vmName: string;
  role: 'Control Plane' | 'Worker';
  cpuCores: number;
  memory: number;
  diskSize: number;
  osType: string;
  networkInterface: string;
  connectivity: 'Public' | 'Private';
  dns: string;
  ssh: {
    username: string;
    sshKey: string;
  };
};

export type Specification = {
    _id: string;
    name: string;
    hw_type?: { id: string; name: string };
    vendor?: string;
    image?: string;
    service_contract_type?: { id: string; name: string };
    contact_point_email?: string;
    contact_point_phone?: string;
    custom_fields?: { key: string; value: string }[];
    
    // Virtual Cluster Fields
    clusterName?: string;
    nodeCount?: {
        controlPlane: number;
        worker: number;
    };
    nodes?: VirtualNode[];

    // Physical Hardware Fields
    symmetric?: boolean;
    total_cpu?: number;
    memory_gb?: number;
    storage_gb?: number;
    bladeCount?: number;
    blades?: {
        name: string;
        cpuType?: string;
        cpuCores?: number;
        memory?: number;
        diskType?: string;
        diskCapacity?: number;
        hasGpu?: boolean;
        gpuType?: string;
        gpuCores?: number;
        networkInterfaces?: {
            name: string;
            type: string;
            speed: string;
        }[];
    }[];
    network_cards?: { id: string; name: string }[];
    plug_power_cords?: { id: string; name: string }[];
    hypervisor?: { id: string; name: string };
    cpuArchitecture?: string;
    virtualizationSupport?: boolean;
    biosVersion?: string;
    firmwareVersion?: string;
    networkTopology?: {
        managementVLAN?: string;
        storageVLAN?: string;
        workloadVLAN?: string;
    };
    ipAddressPool?: {
        management?: string;
        storage?: string;
        workload?: string;
    };
    iloCredentials?: {
        username?: string;
        password?: string;
    };
    diskLayout?: {
        osDisk?: string;
        dataDisk?: string;
    };
    raidConfiguration?: string;
    timeSync?: string;
    sshKeys?: string;
};


export type AuditLog = {
    _id: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    entity: string;
    entityId: string;
    user: string;
    comment: string;
    timestamp: string;
};

export type OnboardingFormField = {
    type: 'Checkbox' | 'RadioBox' | 'TextField' | 'DropDown' | 'Link';
    name: string;
    label: string;
    options?: string[];
    helpText?: string;
    proof?: boolean;
    proofLink?: string;
};

export type OnboardingPhase = {
    id: string,
    name: string;
    ownerName: string;
    ownerEmail: string;
    sendEmailOnComplete: boolean;
    statusOptions: string[];
    fields: OnboardingFormField[];
};

export type OnboardingConfiguration = {
    _id: string;
    name: string;
    version: number;
    phases: OnboardingPhase[];
};

// CMDB Types
export type CmdbPhase = {
  id: string;
  name: string;
  version: string;
  status: string;
  fields: {
    name: string;
    value: any;
    proof: Record<string, any>;
  }[];
};

export type CmdbTenant = {
  _id: string;
  id: string;
  name: string;
  description?: string;
  version?: string;
  artifact_location?: string;
  dependent_tenants?: { id: string; name: string, version?: string }[];
  resources?: {
    cpu?: number;
    memory_gb?: number;
    storage_gb?: number;
  };
  products?: { id: string; name: string }[];
  phases?: CmdbPhase[];
  created_at: string;
  updated_at: string;
};

export type CmdbCommon = {
  _id: string;
  id: string;
  name: string;
  version: string;
  artifact_location?: string;
  artifact_name?: string;
  resources?: {
    default_instances?: number;
    cpu?: number;
    memory?: number;
    storage?: number;
  };
  custom_labels?: { key: string; value: string; }[];
  provided_interfaces?: { id: string; name: string; }[];
  dependent_interfaces?: { id: string; name: string; }[];
  dependent_components?: { id: string; name: string; }[];
  dependent_applications?: { id: string; name: string; }[];
  phases: CmdbPhase[];
  created_at: string;
  updated_at: string;
  tenants?: { id: string; name: string; }[];
  description?: string;
};

export type CmdbComponent = CmdbCommon;
export type CmdbApplication = CmdbCommon;

export type CmdbInterfaceType = {
  _id: string;
  id: string;
  name: string;
  description?: string;
};

export type CmdbInterface = {
  _id: string;
  id: string;
  name: string;
  type: {
    id: string;
    name: string;
  };
  version: string;
  description?: string;
  owner_name: string;
  owner_email: string;
  documentation?: string;
  source: {
    id: string;
    name: string;
  };
  security: {
    internal: {
      secure: boolean;
      authentication: boolean;
    };
    external: {
      secure: boolean;
      authentication: boolean;
    };
  };
  additional_docs?: {
    id: string;
    key: string;
    name: string;
    url: string;
  }[];
  custom_fields?: { key: string; value: string; }[];
  created_at: string;
  updated_at: string;
};

export type AnyCmdbEntity = (CmdbTenant | CmdbComponent | CmdbApplication | Product | CmdbInterface) & { id: string; name: string; version: string; entityType: EntityType };

export type EntityType = 'tenant' | 'component' | 'application' | 'interface' | 'product';

export type DependencyTree = {
  _id: string;
  id: string;
  name: string;
  version: string;
  entityType: 'product';
  specifications: { id: string; name: string; version: string; }[];
  tenants: {
    id: string;
    name: string;
    version: string;
    entityType: 'tenant';
    components: (CmdbComponent & {
      entityType: 'component',
      provides_interfaces: CmdbInterface[];
      depends_on_interfaces: CmdbInterface[];
    })[];
    applications: (CmdbApplication & {
      entityType: 'application',
      provides_interfaces: CmdbInterface[];
      depends_on_interfaces: CmdbInterface[];
    })[];
  }[];
};


export type Baseline = {
    _id: string;
    product: {
        id: string;
        name: string;
        version: string;
    };
    specifications: { id: string; name: string; version: string; }[];
    tenants: any[]; // Simplified for now
    status: 'DRAFT' | 'VALIDATING' | 'VALIDATED' | 'RELEASED' | 'ARCHIVED' | 'REJECTED';
    validation_phases?: OnboardingPhase[];
    created_at: string;
    updated_at: string;
    created_by: string;
    artifacts: { name: string; url: string; size: string; }[];
    package_properties: {
        location: string;
        checksum_md5: string;
        checksum_sha256: string;
    };
};

export type DeploymentSummary = {
  deploymentId: string;
  status: string;
  packageLocation: string;
  reportUploadPath: string;
};

export type Deployment = {
    _id: string;
    productId: string;
    specificationId: string;
    hypervisorId: string;
    foundationId?: string; // This will hold the ID of the chosen Platform Foundation
    foundationComponentIds: string[]; // This will be derived from the foundation
    security: {
        encryptionKey?: string;
        signingCert?: string;
        pkiDetails?: string;
        iamToken?: string;
    };
    details: {
        deploymentId: string;
        customer: string;
        factory?: string;
        region?: string;
        country?: string;
        availabilityZone?: string;
        customerKeyPair?: string;
    };
    createdBy: string;
    createdAt: string;
    status: 'PROVISIONING' | 'ACTIVE' | 'UPGRADING' | 'FAILED' | 'DECOMMISSIONED' | 'UPGRADE_APPROVAL';
    foundationSummary?: DeploymentSummary;
    approval_phases?: OnboardingPhase[];
};

export type UpgradeSummary = {
    deploymentId: string;
    status: string;
    packageLocation: string;
    targetSpecificationId: string;
};

export type UpgradeHistory = {
  _id?: string;
  deploymentId: string;
  productId: string;
  targetSpecificationId: string;
  upgradeScope: 'baseline' | 'individual';
  baselineId?: string;
  releaseNotes: string;
  fieldOperations?: string;
  maintenanceWindow: {
    start: string;
    end: string;
  };
  approvers: string[];
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'APPROVAL_IN_PROGRESS';
  initiatedBy: string;
  initiatedAt: string;
  reportUploadUrl?: string; // Location for status uploads
  summary?: UpgradeSummary;
  approval_phases?: OnboardingPhase[];
};

export type License = {
  _id: string;
  id: string;
  name: string;
  type: 'open-source' | 'proprietary' | 'subscription' | 'perpetual';
  owner: string;
  components?: string[];
  products?: string[];
  tenants?: string[];
  apps?: string[];
  integrations?: string[];
  versions?: string[];
  status: 'active' | 'expired' | 'deprecated';
};

export type ProductLicensing = {
  _id: string;
  id: string;
  product_id: string;
  license_model: 'online' | 'offline' | 'hybrid';
  entitlements: string[];
  package_included: boolean;
  validity: string;
  compliance: string;
};

export type DevelopmentEnvironment = {
    _id: string;
    name: string;
    productId: string;
    specificationId: string;
    baselineId?: string;
    tenantIds: string[];
    createdAt: string;
    createdBy: string;
    status: 'PROVISIONING' | 'READY' | 'ERROR' | 'DELETING';
    estimatedCost: number;
    resourceUsage: {
        cpu: string;
        memory: string;
        storage: string;
    };
    dependencySummary?: {
        type: 'Tenant' | 'Component' | 'Application';
        id: string;
        name: string;
        version: string;
    }[];
}
