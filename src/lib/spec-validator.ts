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
const validateSchema = ajv.compile(specificationSchema);

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
};

function findLineNumberForField(rawContent: string, fieldPath: string): number | undefined {
  const cleanField = fieldPath.replace(/^\//, '').split('/')[0];
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
      suggestion = `Add missing required property '${prop}' to the specification.`;
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
    // Strip UTF-8 BOM if present in uploaded files
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

  // If this is a ReleaseHub Hardware/Virtual Specification JSON (from Builder/DB),
  // enrich missing studio metadata fields automatically so JSON imports work out-of-the-box.
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
        parsed.hw_type?.name?.toLowerCase() ||
        parsed.clusterType?.toLowerCase() ||
        'hardware',
      steps:
        Array.isArray(parsed.steps) && parsed.steps.length > 0
          ? parsed.steps
          : ['validate-hardware', 'provision-nodes', 'configure-network', 'verify-readiness'],
    }
    : parsed;

  const valid = validateSchema(candidate);
  if (valid) {
    return {
      isValid: true,
      data: candidate,
      errors: [],
    };
  }

  const errors = (validateSchema.errors || []).map((err) =>
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
