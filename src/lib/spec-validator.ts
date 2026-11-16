// SPDX-License-Identifier: AGPL-3.0-only
import Ajv, { ErrorObject } from 'ajv';
import * as yaml from 'js-yaml';
import specificationSchema from '@/schemas/specification.v1.json';

export interface ValidationErrorItem {
  path: string;
  message: string;
  suggestion: string;
  line?: number;
}

export interface ValidationResult {
  isValid: boolean;
  data?: Record<string, any>;
  errors: ValidationErrorItem[];
}

const ajv = new Ajv({ allErrors: true, strict: false });
const validateBaseSchema = ajv.compile(specificationSchema);

const hwTypeSchema = {
  type: 'object',
  required: ['specId', 'name', 'specType', 'hwDetails'],
  properties: {
    specId: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    version: { type: 'string', minLength: 1 },
    specType: { type: 'string', const: 'HW' },
    hwDetails: {
      type: 'object',
      required: ['formFactor', 'architecture', 'airgapSupport'],
      properties: {
        formFactor: { type: 'string', minLength: 1 },
        architecture: { type: 'string', minLength: 1 },
        airgapSupport: { type: 'boolean' },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
};

const cloudTypeSchema = {
  type: 'object',
  required: ['specId', 'name', 'specType', 'cloudDetails'],
  properties: {
    specId: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    version: { type: 'string', minLength: 1 },
    specType: { type: 'string', const: 'CLOUD' },
    cloudDetails: {
      type: 'object',
      required: ['provider', 'cloudType', 'region'],
      properties: {
        provider: { type: 'string', minLength: 1 },
        cloudType: { type: 'string', minLength: 1 },
        region: { type: 'string', minLength: 1 },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
};

const managedK8sTypeSchema = {
  type: 'object',
  required: ['specId', 'name', 'specType', 'k8sDetails'],
  properties: {
    specId: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    version: { type: 'string', minLength: 1 },
    specType: { type: 'string', const: 'MANAGED_K8S' },
    k8sDetails: {
      type: 'object',
      required: ['k8sDistro', 'clusterScope', 'k8sVersion'],
      properties: {
        k8sDistro: { type: 'string', minLength: 1 },
        clusterScope: { type: 'string', minLength: 1 },
        k8sVersion: { type: 'string', minLength: 1 },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
};

const validateHwSchema = ajv.compile(hwTypeSchema);
const validateCloudSchema = ajv.compile(cloudTypeSchema);
const validateK8sSchema = ajv.compile(managedK8sTypeSchema);

const FIELD_SUGGESTIONS: Record<string, Record<string, string>> = {
  '/specId': {
    required: "Add required field 'specId' (e.g., \"specId\": \"spec-1\")",
    type: "Change 'specId' value to a non-empty string like 'spec-1'",
    minLength: "Provide a non-empty string for 'specId' (e.g., 'spec-1')",
  },
  '/name': {
    required: "Add required field 'name' (e.g., \"name\": \"Production Kubernetes Spec\")",
    type: "Change 'name' value to a string like 'My Specification'",
    minLength: "Provide a non-empty string for 'name'",
  },
  '/version': {
    required: "Add required field 'version' as a quoted string (e.g., version: '1.0.0')",
    type: "Change version value to a quoted string like '1.0.0'",
    minLength: "Provide a valid semantic version string for 'version' like '1.0.0'",
  },
  '/target': {
    required: "Add required field 'target' (e.g., 'kubernetes', 'docker', 'blade', or 'virtual')",
    type: "Change 'target' value to a string such as 'kubernetes' or 'docker'",
    minLength: "Specify a target platform string (e.g., 'kubernetes')",
  },
  '/steps': {
    required: "Add required field 'steps' as a list of steps (e.g., steps: ['build', 'deploy'])",
    type: "Change 'steps' to an array of strings or step objects, e.g. ['build', 'deploy']",
    minItems: "Include at least one step in the 'steps' array (e.g., ['provision', 'deploy'])",
  },
  '/hwDetails/formFactor': {
    required: "Specify 'hwDetails.formFactor' (e.g., 'Rack', 'Blade', 'Standalone Server', or 'Edge')",
    type: "Change 'hwDetails.formFactor' to a valid string (e.g., 'Rack' or 'Blade')",
  },
  '/hwDetails/architecture': {
    required: "Specify 'hwDetails.architecture' (e.g., 'x86_64' or 'ARM64')",
    type: "Change 'hwDetails.architecture' to a string like 'x86_64'",
  },
  '/hwDetails/airgapSupport': {
    required: "Specify 'hwDetails.airgapSupport' as a boolean (true or false)",
    type: "Change 'hwDetails.airgapSupport' to a boolean value (true or false)",
  },
  '/cloudDetails/provider': {
    required: "Specify 'cloudDetails.provider' (e.g., 'AWS', 'Azure', 'GCP', 'OpenStack', 'VMware')",
  },
  '/cloudDetails/cloudType': {
    required: "Specify 'cloudDetails.cloudType' (e.g., 'PUBLIC', 'PRIVATE', or 'HYBRID')",
  },
  '/cloudDetails/region': {
    required: "Specify 'cloudDetails.region' (e.g., 'us-east-1' or 'eu-central-1')",
  },
  '/k8sDetails/k8sDistro': {
    required: "Specify 'k8sDetails.k8sDistro' (e.g., 'EKS', 'GKE', 'AKS', 'OpenShift', 'Rancher', 'Talos')",
  },
  '/k8sDetails/clusterScope': {
    required: "Specify 'k8sDetails.clusterScope' (e.g., 'CLOUD_MANAGED', 'ON_PREM', 'EDGE')",
  },
  '/k8sDetails/k8sVersion': {
    required: "Specify 'k8sDetails.k8sVersion' as a string (e.g., '1.30')",
  },
};

function findLineNumberForField(rawContent: string, fieldPath: string): number | undefined {
  const parts = fieldPath.replace(/^\//, '').split('/');
  const cleanField = parts[parts.length - 1];
  if (!cleanField) return undefined;
  const lines = rawContent.split('\n');
  const regex = new RegExp(`^\\s*["']?${cleanField}["']?\\s*:`);
  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) {
      return i + 1;
    }
  }
  return undefined;
}

function mapAjvErrorToRemediation(err: ErrorObject, rawContent: string): ValidationErrorItem {
  let path = err.instancePath || '/';
  if (err.keyword === 'required' && err.params && 'missingProperty' in err.params) {
    const missingProp = String(err.params.missingProperty);
    path = err.instancePath ? `${err.instancePath}/${missingProp}` : `/${missingProp}`;
  }

  const fieldRules = FIELD_SUGGESTIONS[path];
  let suggestion = fieldRules?.[err.keyword];

  if (!suggestion) {
    if (err.keyword === 'required' && err.params && 'missingProperty' in err.params) {
      const prop = String(err.params.missingProperty);
      suggestion = `Add missing required property '${prop}' at '${path}'.`;
    } else if (err.keyword === 'type') {
      const expectedType = (err.params as any)?.type || 'valid type';
      suggestion = `Change value at '${path}' to type '${expectedType}'.`;
    } else {
      suggestion = `Fix the value at '${path}' (${err.message || 'schema validation failed'}).`;
    }
  }

  const line = findLineNumberForField(rawContent, path);

  return {
    path,
    message: err.message || `Invalid value at ${path}`,
    suggestion,
    ...(line ? { line } : {}),
  };
}

/**
 * Checks whether a parsed object is a ReleaseHub Hardware/Virtual Specification
 * (created from Specification Builder / DB) so missing studio fields can be populated.
 */
function isHardwareOrVirtualSpecObject(obj: Record<string, any>): boolean {
  if (!obj || typeof obj !== 'object') return false;
  const hwKeys = [
    'hw_type',
    'blades',
    'bladeCount',
    'nodes',
    'nodeCount',
    'total_cpu',
    'memory_gb',
    'storage_gb',
    'clusterType',
    'managedConfig',
    'iloCredentials',
    'biosVersion',
    'service_contract_type',
    'network_cards',
  ];
  return Boolean(obj.name && hwKeys.some((k) => k in obj));
}

export function validateSpecification(
  rawContent: string,
  format: 'json' | 'yaml' = 'json'
): ValidationResult {
  if (!rawContent || !rawContent.trim()) {
    return {
      isValid: false,
      errors: [
        {
          path: '/',
          message: 'Specification content is empty.',
          suggestion: 'Paste or upload a valid JSON or YAML specification document containing specId, name, version, target, and steps.',
          line: 1,
        },
      ],
    };
  }

  let parsed: any;
  try {
    const cleanContent = rawContent.replace(/^\uFEFF/, '');
    if (format === 'json') {
      parsed = JSON.parse(cleanContent);
    } else {
      parsed = yaml.load(cleanContent);
    }
  } catch (err: any) {
    let line: number | undefined;
    if (typeof err?.mark?.line === 'number') {
      line = err.mark.line + 1;
    } else if (typeof err?.message === 'string') {
      const posMatch = err.message.match(/position\s+(\d+)/i);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        line = rawContent.slice(0, pos).split('\n').length;
      }
    }

    return {
      isValid: false,
      errors: [
        {
          path: '/syntax',
          message: `Syntax error while parsing ${format.toUpperCase()}: ${err?.message || 'Invalid syntax'}`,
          suggestion:
            format === 'json'
              ? 'Check for missing quotes, trailing commas, or unclosed brackets in your JSON.'
              : 'Check indentation (use spaces, not tabs) and colon spacing in your YAML.',
          ...(line ? { line } : {}),
        },
      ],
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      isValid: false,
      errors: [
        {
          path: '/',
          message: 'Root of the specification must be a JSON/YAML object.',
          suggestion: 'Provide a key-value object at the root level with specId, name, version, target, and steps.',
          line: 1,
        },
      ],
    };
  }

  // Tri-Modal Specification Type Validation (HW, CLOUD, MANAGED_K8S)
  if (parsed.specType === 'HW' || parsed.specType === 'CLOUD' || parsed.specType === 'MANAGED_K8S') {
    const typeValidator =
      parsed.specType === 'HW'
        ? validateHwSchema
        : parsed.specType === 'CLOUD'
        ? validateCloudSchema
        : validateK8sSchema;

    const validType = typeValidator(parsed);
    if (!validType) {
      const errors = (typeValidator.errors || []).map((err) =>
        mapAjvErrorToRemediation(err, rawContent)
      );
      return {
        isValid: false,
        errors,
      };
    }

    const enriched = {
      ...parsed,
      version: parsed.version !== undefined ? String(parsed.version) : '1.0.0',
      target:
        parsed.target ||
        parsed.specDefinition?.target ||
        parsed.k8sDetails?.k8sDistro?.toLowerCase() ||
        parsed.cloudDetails?.provider?.toLowerCase() ||
        parsed.hwDetails?.formFactor?.toLowerCase() ||
        parsed.specType.toLowerCase(),
      steps:
        Array.isArray(parsed.steps) && parsed.steps.length > 0
          ? parsed.steps
          : Array.isArray(parsed.specDefinition?.steps) && parsed.specDefinition.steps.length > 0
          ? parsed.specDefinition.steps
          : ['provision', 'deploy'],
    };

    return {
      isValid: true,
      data: enriched,
      errors: [],
    };
  }

  const hasSpecDef =
    parsed.specDefinition &&
    typeof parsed.specDefinition === 'object' &&
    (parsed.specDefinition.target || parsed.specDefinition.steps);

  const candidate = isHardwareOrVirtualSpecObject(parsed)
    ? {
        ...parsed,
        specId:
          parsed.specId ||
          parsed._id ||
          String(parsed.name).replace(/[^a-zA-Z0-9-_]/g, '') ||
          `spec-${Date.now()}`,
        version: parsed.version !== undefined ? parsed.version : '1.0.0',
        target:
          parsed.target ||
          parsed.specDefinition?.target ||
          parsed.hw_type?.name?.toLowerCase() ||
          parsed.clusterType?.toLowerCase() ||
          'hardware',
        steps:
          Array.isArray(parsed.steps) && parsed.steps.length > 0
            ? parsed.steps
            : Array.isArray(parsed.specDefinition?.steps) && parsed.specDefinition.steps.length > 0
            ? parsed.specDefinition.steps
            : ['validate-hardware', 'provision-nodes', 'configure-network', 'verify-readiness'],
      }
    : hasSpecDef
    ? {
        ...parsed,
        target: parsed.target || parsed.specDefinition.target,
        steps: parsed.steps || parsed.specDefinition.steps,
      }
    : parsed;

  const valid = validateBaseSchema(candidate);
  if (valid) {
    return {
      isValid: true,
      data: candidate,
      errors: [],
    };
  }

  const errors = (validateBaseSchema.errors || []).map((err) =>
    mapAjvErrorToRemediation(err, rawContent)
  );

  return {
    isValid: false,
    errors,
  };
}

/**
 * Helper to normalize any existing DB Specification record into a valid Specification Studio v1.2 object
 */
export function toStudioSpecObject(spec: Record<string, any>): Record<string, any> {
  const { _id, ...rest } = spec || {};
  return {
    specId: spec?.specId || _id || `spec-${Date.now()}`,
    name: spec?.name || 'Untitled Specification',
    version: String(spec?.version || '1.0.0'),
    target:
      spec?.target ||
      spec?.specDefinition?.target ||
      spec?.hw_type?.name?.toLowerCase() ||
      spec?.clusterType?.toLowerCase() ||
      'kubernetes',
    steps:
      Array.isArray(spec?.steps) && spec.steps.length > 0
        ? spec.steps
        : ['validate-hardware', 'provision-nodes', 'configure-network', 'verify-readiness'],
    ...rest,
  };
}
