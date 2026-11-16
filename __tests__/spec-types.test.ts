import { validateSpecification } from '@/lib/spec-validator';
import { Specification } from '@/models/Specification';

describe('Tri-Modal Specification Type Validation', () => {
  it('should validate a Managed K8s specification', () => {
    const k8sPayload = JSON.stringify({
      specId: 'k8s-eks-prod',
      name: 'EKS Production Cluster',
      version: '1.0.0',
      specType: 'MANAGED_K8S',
      k8sDetails: {
        k8sDistro: 'EKS',
        clusterScope: 'CLOUD_MANAGED',
        k8sVersion: '1.30'
      },
      specDefinition: { target: 'aws-eks' }
    });

    const result = validateSpecification(k8sPayload, 'json');
    expect(result.isValid).toBe(true);
  });

  it('should fail HW spec if formFactor is missing', () => {
    const hwPayload = JSON.stringify({
      specId: 'hw-invalid',
      name: 'Missing Form Factor',
      specType: 'HW',
      hwDetails: {},
      specDefinition: {}
    });

    const result = validateSpecification(hwPayload, 'json');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ path: '/hwDetails/formFactor' })
    );
  });

  it('should validate a Cloud Infrastructure specification and fail when region is missing', () => {
    const validCloud = JSON.stringify({
      specId: 'cloud-aws-prod',
      name: 'AWS Production VPC',
      version: '1.0.0',
      specType: 'CLOUD',
      cloudDetails: {
        provider: 'AWS',
        cloudType: 'PUBLIC',
        region: 'us-east-1',
      },
    });
    expect(validateSpecification(validCloud, 'json').isValid).toBe(true);

    const invalidCloud = JSON.stringify({
      specId: 'cloud-aws-invalid',
      name: 'AWS Missing Region',
      specType: 'CLOUD',
      cloudDetails: {
        provider: 'AWS',
        cloudType: 'PUBLIC',
      },
    });
    const invalidResult = validateSpecification(invalidCloud, 'json');
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toContainEqual(
      expect.objectContaining({ path: '/cloudDetails/region' })
    );
  });

  it('should construct Specification model instances for HW, CLOUD, and MANAGED_K8S', () => {
    const spec = new Specification({
      specId: 'k8s-talos-edge',
      name: 'Talos Edge Cluster',
      specType: 'MANAGED_K8S',
      k8sDetails: {
        k8sDistro: 'TALOS',
        clusterScope: 'EDGE',
        k8sVersion: '1.30',
      },
    });
    expect(spec.specType).toBe('MANAGED_K8S');
    expect(spec.k8sDetails?.k8sDistro).toBe('TALOS');
  });
});

