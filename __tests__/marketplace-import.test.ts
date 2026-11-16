import { Specification } from '@/models/Specification';
import { filterMarketplaceCatalog, CURATED_MARKETPLACE_CATALOG } from '@/models/MarketplaceCatalog';
import { validateSpecification } from '@/lib/spec-validator';

describe('Specification Source Ingestion', () => {
  it('should correctly assign vendorMeta when importing from Marketplace', async () => {
    const marketplacePayload = {
      specId: 'aws-eks-v1',
      name: 'AWS EKS Production Spec',
      version: '1.0.0',
      sourceType: 'MARKETPLACE' as const,
      vendorMeta: {
        publisherName: 'Amazon Web Services',
        vendorType: 'CLOUD',
        verified: true
      },
      specDefinition: { target: 'aws-eks', steps: ['provision', 'deploy'] }
    };

    const spec = new Specification(marketplacePayload);
    expect(spec.sourceType).toBe('MARKETPLACE');
    expect(spec.vendorMeta?.publisherName).toBe('Amazon Web Services');
    expect(spec.vendorMeta?.verified).toBe(true);
    expect(spec.target).toBe('aws-eks');
    expect(spec.steps).toEqual(['provision', 'deploy']);
  });

  it('should filter Marketplace catalog by vendorType and tag', () => {
    const cloudSpecs = filterMarketplaceCatalog({ vendorType: 'CLOUD' });
    expect(cloudSpecs.length).toBeGreaterThan(0);
    expect(cloudSpecs.every(s => s.vendorMeta.vendorType === 'CLOUD')).toBe(true);

    const nvidiaSpecs = filterMarketplaceCatalog({ tag: 'Nvidia' });
    expect(nvidiaSpecs).toHaveLength(1);
    expect(nvidiaSpecs[0].specId).toBe('nvidia-dgx-h100-ai-pod');
  });

  it('should validate all curated Marketplace templates against Schema v1.2', () => {
    for (const item of CURATED_MARKETPLACE_CATALOG) {
      const validation = validateSpecification(JSON.stringify(item), 'json');
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    }
  });
});

