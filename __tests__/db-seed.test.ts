jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: Promise.resolve(null),
}));

import { seedSpecificationOptions } from '@/db/seed';
import { SpecificationOption } from '@/models/SpecificationOption';

describe('Database Seed & Dynamic Specification Options', () => {
  it('should seed default options without duplicating on re-run', async () => {
    await seedSpecificationOptions();
    const countFirstRun = await SpecificationOption.countDocuments();
    expect(countFirstRun).toBeGreaterThan(0);

    await seedSpecificationOptions();
    const countSecondRun = await SpecificationOption.countDocuments();
    expect(countSecondRun).toBe(countFirstRun);
  });

  it('should allow adding and updating a custom specification option', async () => {
    const created = await SpecificationOption.upsertOption({
      category: 'HW_FORM_FACTORS',
      key: 'QUANTUM_BLADE',
      label: 'Quantum Compute Blade',
    });

    expect(created.key).toBe('QUANTUM_BLADE');
    expect(created.label).toBe('Quantum Compute Blade');
    expect(created.active).toBe(true);

    const hwOptions = await SpecificationOption.find({
      category: 'HW_FORM_FACTORS',
      active: true,
    });
    expect(hwOptions.map((o) => o.label)).toContain('Quantum Compute Blade');

    const deactivated = await SpecificationOption.updateById(created._id, {
      active: false,
    });
    expect(deactivated?.active).toBe(false);
  });
});
