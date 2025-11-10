

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
  id: string;
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
  dependent_tenants?: { id: string; name: string }[];
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

export type AnyCmdbEntity = (CmdbTenant | CmdbComponent | CmdbApplication | CmdbInterface | Product) & { entityType: EntityType };

export type EntityType = 'tenant' | 'component' | 'application' | 'interface' | 'product';


export type DependencyTree = {
  _id: string; // Mongo ObjectID
  productId: string; // The ID of the root product
  product: {
    id: string;
    name: string;
    version: string;
    description?: string;
  };
  specifications: { id: string; name: string; version: string; }[];
  tenants: Partial<CmdbTenant>[];
  components: Partial<CmdbComponent>[];
  applications: Partial<CmdbApplication>[];
  interfaces: Partial<CmdbInterface>[];
  metadata: {
    created_