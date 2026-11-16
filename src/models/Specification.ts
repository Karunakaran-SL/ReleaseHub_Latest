// SPDX-License-Identifier: AGPL-3.0-only

export type SpecificationSourceType = 'MARKETPLACE' | 'FILE_IMPORT' | 'STUDIO_CUSTOM';

export type SpecificationType = 'HW' | 'CLOUD' | 'MANAGED_K8S';

export type VendorType = 'OEM' | 'HARDWARE' | 'CLOUD';

export interface VendorMeta {
  publisherName: string;
  vendorType: VendorType | string;
  verified: boolean;
  marketplaceSpecId?: string;
}

export interface HwDetails {
  formFactor: 'RACK' | 'BLADE' | 'STANDALONE_SERVER' | 'EDGE' | string;
  architecture: 'x86_64' | 'ARM64' | 'POWER10' | string;
  airgapSupport: boolean;
  [key: string]: any;
}

export interface CloudDetails {
  provider: 'AWS' | 'AZURE' | 'GCP' | 'OPENSTACK' | 'VMWARE' | string;
  cloudType: 'PUBLIC' | 'PRIVATE' | 'HYBRID' | string;
  region: string;
  [key: string]: any;
}

export interface K8sDetails {
  k8sDistro: 'EKS' | 'GKE' | 'AKS' | 'OPENSHIFT' | 'RANCHER' | 'TALOS' | 'CUSTOM' | string;
  clusterScope: 'CLOUD_MANAGED' | 'ON_PREM' | 'EDGE' | 'HYBRID' | string;
  k8sVersion: string;
  [key: string]: any;
}

export interface SpecDefinition {
  target: string;
  steps?: (string | Record<string, any>)[];
  [key: string]: any;
}

export interface SpecificationInput {
  _id?: string;
  specId: string;
  name: string;
  version?: string;
  specType?: SpecificationType;
  sourceType?: SpecificationSourceType;
  vendorMeta?: VendorMeta;
  hwDetails?: HwDetails;
  cloudDetails?: CloudDetails;
  k8sDetails?: K8sDetails;
  specDefinition?: SpecDefinition;
  target?: string;
  steps?: (string | Record<string, any>)[];
  vendor?: string;
  hw_type?: { id: string; name: string };
  image?: string;
  description?: string;
  [key: string]: any;
}

const VALID_SOURCE_TYPES: SpecificationSourceType[] = [
  'MARKETPLACE',
  'FILE_IMPORT',
  'STUDIO_CUSTOM',
];

const VALID_SPEC_TYPES: SpecificationType[] = ['HW', 'CLOUD', 'MANAGED_K8S'];

export class Specification {
  _id: string;
  specId: string;
  name: string;
  version: string;
  specType: SpecificationType;
  sourceType: SpecificationSourceType;
  vendorMeta?: VendorMeta;
  hwDetails?: HwDetails;
  cloudDetails?: CloudDetails;
  k8sDetails?: K8sDetails;
  specDefinition: SpecDefinition;
  target: string;
  steps: (string | Record<string, any>)[];
  vendor?: string;
  hw_type?: { id: string; name: string };
  image?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;

  constructor(payload: SpecificationInput) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Specification payload must be a valid object.');
    }

    const {
      _id,
      specId,
      name,
      version,
      specType,
      sourceType,
      vendorMeta,
      hwDetails,
      cloudDetails,
      k8sDetails,
      specDefinition,
      target,
      steps,
      ...rest
    } = payload;

    const resolvedSpecId = String(
      specId || _id || String(name || 'spec').replace(/[^a-zA-Z0-9-_]/g, '') || `spec-${Date.now()}`
    );

    const resolvedSpecType: SpecificationType =
      specType && VALID_SPEC_TYPES.includes(specType)
        ? specType
        : k8sDetails
        ? 'MANAGED_K8S'
        : cloudDetails
        ? 'CLOUD'
        : 'HW';

    const resolvedTarget = String(
      target ||
        specDefinition?.target ||
        k8sDetails?.k8sDistro?.toLowerCase() ||
        cloudDetails?.provider?.toLowerCase() ||
        hwDetails?.formFactor?.toLowerCase() ||
        rest.hw_type?.name?.toLowerCase() ||
        'kubernetes'
    );

    const resolvedSteps =
      Array.isArray(steps) && steps.length > 0
        ? steps
        : Array.isArray(specDefinition?.steps) && specDefinition.steps.length > 0
        ? specDefinition.steps
        : ['provision', 'deploy'];

    const resolvedSourceType: SpecificationSourceType =
      sourceType && VALID_SOURCE_TYPES.includes(sourceType)
        ? sourceType
        : vendorMeta
        ? 'MARKETPLACE'
        : 'STUDIO_CUSTOM';

    Object.assign(this, rest);

    this._id = String(_id || resolvedSpecId);
    this.specId = resolvedSpecId;
    this.name = String(name || 'Untitled Specification');
    this.version = String(version || '1.0.0');
    this.specType = resolvedSpecType;
    this.sourceType = resolvedSourceType;

    if (hwDetails) {
      this.hwDetails = {
        formFactor: hwDetails.formFactor,
        architecture: hwDetails.architecture || 'x86_64',
        airgapSupport: Boolean(hwDetails.airgapSupport),
        ...hwDetails,
      };
    }

    if (cloudDetails) {
      this.cloudDetails = {
        provider: cloudDetails.provider,
        cloudType: cloudDetails.cloudType || 'PUBLIC',
        region: cloudDetails.region,
        ...cloudDetails,
      };
    }

    if (k8sDetails) {
      this.k8sDetails = {
        k8sDistro: k8sDetails.k8sDistro,
        clusterScope: k8sDetails.clusterScope || 'CLOUD_MANAGED',
        k8sVersion: k8sDetails.k8sVersion,
        ...k8sDetails,
      };
    }

    if (vendorMeta) {
      this.vendorMeta = {
        publisherName: String(vendorMeta.publisherName || rest.vendor || 'Unknown Publisher'),
        vendorType: String(vendorMeta.vendorType || 'CLOUD'),
        verified: Boolean(vendorMeta.verified),
        ...(vendorMeta.marketplaceSpecId
          ? { marketplaceSpecId: String(vendorMeta.marketplaceSpecId) }
          : { marketplaceSpecId: resolvedSpecId }),
      };
    }

    this.target = resolvedTarget;
    this.steps = resolvedSteps;
    this.specDefinition = {
      ...(specDefinition || {}),
      target: resolvedTarget,
      steps: resolvedSteps,
    };

    if (!this.vendor) {
      this.vendor =
        this.vendorMeta?.publisherName ||
        this.cloudDetails?.provider ||
        this.k8sDetails?.k8sDistro ||
        rest.vendor;
    }

    this.createdAt = rest.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  toDocument(): Record<string, any> {
    const doc: Record<string, any> = { ...this };
    return doc;
  }
}

export default Specification;
