

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
export type CmdbTenant = {
  _id: string;
  id: string;
  name: string;
  description?: string;
  onboarding_status?: Record<string, any>;
  version?: string;
  artifact_location?: string;
  dependent_tenants?: string[];
  products?: string[];
};

export type CmdbComponent = {
  _id: string;
  id: string;
  name: string;
  description?: string;
};

export type CmdbApplication = {
  _id: string;
  id: string;
  name: string;
  description?: string;
};

export type CmdbInterface = {
  _id: string;
  id: string;
  name: string;
  description?: string;
};
