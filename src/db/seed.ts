// SPDX-License-Identifier: AGPL-3.0-only
import {
  SpecificationOption,
  DEFAULT_SPECIFICATION_OPTIONS,
} from '@/models/SpecificationOption';

  export async function seedSpecificationOptions(targetCategory?: string) {
    const now = new Date().toISOString();
    const normalizedTarget = targetCategory?.toUpperCase();

      const sourceOptions = normalizedTarget
        ? DEFAULT_SPECIFICATION_OPTIONS.filter((opt) => opt.category === normalizedTarget)
        : DEFAULT_SPECIFICATION_OPTIONS;

      if (sourceOptions.length === 0) {
        return {
          totalOptions: 0,
          upsertedCount: 0,
          modifiedCount: 0,
        };
      }

      const operations = sourceOptions.map((opt) => {
        const _id = SpecificationOption.makeId(opt.category, opt.key);
        return {
          updateOne: {
            filter: { _id, category: opt.category, key: opt.key },
            update: {
                $setOnInsert: {
                  category: opt.category,
                  key: opt.key,
                  label: opt.label,
                  name: opt.label,
                  description: opt.description || '',
                  active: opt.active ?? true,
                  sortOrder: opt.sortOrder ?? 10,
                  createdAt: now,
                  updatedAt: now,
                },
              },
              upsert: true,
            },
          };
        });

      const result = await SpecificationOption.bulkWrite(operations);
      return {
        totalOptions: sourceOptions.length,
        ...result,
      };
    }

// Allow running directly via `npm run db:seed` (`tsx src/db/seed.ts`)
if (typeof require !== 'undefined' && require.main === module) {
      seedSpecificationOptions()
        .then((res) => {
          console.log(
            `[db:seed] Seeded ${res.totalOptions} specification options (upserted: ${res.upsertedCount}, modified: ${res.modifiedCount}).`
          );
          process.exit(0);
        })
        .catch((err) => {
          console.error('[db:seed] Failed to seed specification options:', err);
          process.exit(1);
        });
    }
