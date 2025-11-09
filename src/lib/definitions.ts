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
  airgapped_details?: {
    id: string;
    name: string;
  };
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
