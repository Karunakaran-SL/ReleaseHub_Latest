import { validateSpecification, toStudioSpecObject } from '@/lib/spec-validator';

describe('Specification Schema Validator', () => {
  it('should pass for a valid JSON specification', () => {
    const validJson = JSON.stringify({
      specId: 'spec-1',
      name: 'Test Spec',
      version: '1.0.0',
      target: 'kubernetes',
      steps: ['build', 'deploy']
    });
    const result = validateSpecification(validJson, 'json');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return remediation suggestions for missing required fields', () => {
    const invalidYaml = `
specId: spec-2
name: Missing Version Spec
target: docker
    `;
    const result = validateSpecification(invalidYaml, 'yaml');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: '/version',
        suggestion: expect.stringContaining('version')
      })
    );
  });

  it('should return type remediation suggestion when version is not a string', () => {
    const invalidVersionYaml = `
specId: spec-3
name: Numeric Version Spec
version: 1.0
target: kubernetes
steps:
  - build
    `;
    const result = validateSpecification(invalidVersionYaml, 'yaml');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: '/version',
        suggestion: "Change version value to a quoted string like '1.0.0'"
      })
    );
  });

  it('should normalize legacy specification records to Schema v1.2 studio objects', () => {
    const legacy = {
      _id: 'DellPowerEdgeR760',
      name: 'Dell PowerEdge R760',
      hw_type: { id: 'Rack', name: 'Rack' },
    };
    const studioSpec = toStudioSpecObject(legacy);
    const result = validateSpecification(JSON.stringify(studioSpec), 'json');
    expect(result.isValid).toBe(true);
    expect(studioSpec.specId).toBe('DellPowerEdgeR760');
    expect(studioSpec.target).toBe('rack');
  });
});

