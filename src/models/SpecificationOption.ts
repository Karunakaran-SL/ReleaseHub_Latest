// SPDX-License-Identifier: AGPL-3.0-only
import clientPromise from '@/lib/mongodb';
import {
  DEFAULT_SPECIFICATION_OPTIONS,
  CATEGORY_COLLECTION_MAP,
  type OptionCategory,
  type SpecificationOptionDoc,
} from '@/lib/specification-options-defaults';

export {
  DEFAULT_SPECIFICATION_OPTIONS,
  CATEGORY_COLLECTION_MAP,
  type OptionCategory,
  type SpecificationOptionDoc,
};

// In-memory store fallback for test environments without a live Mongo daemon
const memoryStore = new Map<string, SpecificationOptionDoc>();

function shouldUseMemoryStore(): boolean {
  return process.env.NODE_ENV === 'test';
}

async function getMongoDb() {
  if (shouldUseMemoryStore()) {
    return null;
  }
    const client = await clientPromise;
    if (!client) {
      throw new Error('MongoDB client is not initialized.');
    }
    return client.db();
  }

  function getCollectionNameForCategory(category?: string): string {
    if (!category) return 'specification_options';
    const upper = category.toUpperCase();
    return CATEGORY_COLLECTION_MAP[upper] || 'specification_options';
  }

  function normalizeMongoDoc(doc: Record<string, any>, fallbackCategory?: string): SpecificationOptionDoc {
    const category = String(doc.category || fallbackCategory || 'GENERAL').toUpperCase();
    const label = String(doc.label || doc.name || doc.key || '');
    const key = String(
      doc.key ||
      label
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
    );

    let description = doc.description || '';
    if (!description && doc.classification && typeof doc.classification === 'object') {
      const parts = Object.entries(doc.classification).map(([k, v]) => `${k}: ${v}`);
      description = doc.type ? `${doc.type} (${parts.join(', ')})` : parts.join(', ');
    } else if (!description && doc.type) {
      description = String(doc.type);
    }

    return {
      _id: String(doc._id),
      category,
      key,
      label,
      name: doc.name || label,
      description,
      active: doc.active !== false,
      sortOrder: typeof doc.sortOrder === 'number' ? doc.sortOrder : 50,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  export class SpecificationOption {
    static makeId(category: string, key: string): string {
      return `${String(category).toUpperCase()}__${String(key)
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, '_')}`;
    }

    static async bulkWrite(
      operations: any[]
    ): Promise<{ upsertedCount: number; modifiedCount: number }> {
      const db = await getMongoDb();
      if (db) {
        let upsertedCount = 0;
        let modifiedCount = 0;

        for (const op of operations) {
          if (!op.updateOne) continue;
          const { filter, update, upsert } = op.updateOne;
          const category = String(
            filter.category || update?.$set?.category || 'SPEC_TYPES'
          ).toUpperCase();
          const colName = getCollectionNameForCategory(category);
          const col = db.collection(colName);
          const setFields = update.$set || {};
          const setOnInsert = update.$setOnInsert || {};
          const label = setFields.label || setOnInsert.label || setFields.name || setOnInsert.name || filter.key;
          const key = String(setFields.key || setOnInsert.key || filter.key || label).toUpperCase();

          if (colName !== 'specification_options') {
            // Check if item already exists in existing reference collection by name, key, or _id
            const existing = await col.findOne({
              $or: [
                { _id: filter._id },
                { key },
                { name: label },
                { label },
              ],
            } as any);

            if (existing) {
              if (Object.keys(setFields).length > 0) {
                await col.updateOne(
                  { _id: existing._id },
                  {
                    $set: {
                      ...setFields,
                      name: existing.name || label,
                      label: existing.label || existing.name || label,
                      key: existing.key || key,
                      category,
                      active: existing.active !== undefined ? existing.active : true,
                    },
                  }
                );
                modifiedCount++;
              }
            } else if (upsert) {
              await col.insertOne({
                _id: filter._id || SpecificationOption.makeId(category, key),
                ...setOnInsert,
                ...setFields,
                name: label,
                label,
                key,
                category,
                active: setFields.active ?? setOnInsert.active ?? true,
              } as any);
              upsertedCount++;
            }
          } else {
            const updateDoc: Record<string, any> = {};
            if (Object.keys(setFields).length > 0) {
              updateDoc.$set = { ...setFields, name: label };
            }
            if (Object.keys(setOnInsert).length > 0) {
              updateDoc.$setOnInsert = { ...setOnInsert, name: label };
            }
            const res = await col.updateOne(
              { _id: filter._id },
              updateDoc,
              { upsert: Boolean(upsert) }
            );
            upsertedCount += res.upsertedCount || 0;
            modifiedCount += res.modifiedCount || 0;
          }
        }

        return { upsertedCount, modifiedCount };
      }

      let upsertedCount = 0;
      let modifiedCount = 0;
      for (const op of operations) {
        if (op.updateOne) {
          const { filter, update, upsert } = op.updateOne;
          const id =
            filter._id ||
            SpecificationOption.makeId(filter.category || '', filter.key || '');
          const existing = memoryStore.get(id);
          const setFields = update.$set || update;
          const setOnInsert = update.$setOnInsert || {};
          if (existing) {
            memoryStore.set(id, { ...existing, ...setFields });
            modifiedCount++;
          } else if (upsert) {
            memoryStore.set(id, {
              _id: id,
              category: filter.category,
              key: filter.key,
              label: setFields.label || filter.key,
              name: setFields.label || filter.key,
              active: setFields.active ?? true,
              ...setOnInsert,
              ...setFields,
            });
            upsertedCount++;
          }
        }
      }
      return { upsertedCount, modifiedCount };
    }

    static async countDocuments(filter: Partial<SpecificationOptionDoc> = {}): Promise<number> {
      const db = await getMongoDb();
      if (db) {
        const colName = getCollectionNameForCategory(filter.category);
        const col = db.collection(colName);
        if (colName !== 'specification_options') {
          const query: Record<string, any> = {};
          if (filter.active !== undefined) {
            query.active = filter.active ? { $ne: false } : false;
          }
          return col.countDocuments(query);
        }
        return col.countDocuments(filter as any);
      }

      let count = 0;
      for (const item of memoryStore.values()) {
        const matches = Object.entries(filter).every(([k, v]) => (item as any)[k] === v);
        if (matches) count++;
      }
      return count;
    }

    static async find(filter: Partial<SpecificationOptionDoc> = {}): Promise<SpecificationOptionDoc[]> {
      const db = await getMongoDb();
      if (db) {
        const category = filter.category ? String(filter.category).toUpperCase() : undefined;
        const colName = getCollectionNameForCategory(category);
        const col = db.collection(colName);

        if (colName !== 'specification_options') {
          const rawDocs = await col.find({}).sort({ sortOrder: 1, name: 1, label: 1 }).toArray();
          const normalized = rawDocs.map((d) => normalizeMongoDoc(d, category));
          return normalized.filter((item) => {
            if (filter.active !== undefined && item.active !== filter.active) return false;
            if (filter.key !== undefined && item.key !== filter.key) return false;
            return true;
          });
        }

        const mongoQuery: Record<string, any> = {};
        if (category) mongoQuery.category = category;
        if (filter.active !== undefined) {
          mongoQuery.active = filter.active ? { $ne: false } : false;
        }
        if (filter.key !== undefined) mongoQuery.key = filter.key;

        const rawDocs = await col.find(mongoQuery).sort({ sortOrder: 1, label: 1 }).toArray();
        return rawDocs.map((d) => normalizeMongoDoc(d, category));
      }

      const results: SpecificationOptionDoc[] = [];
      for (const item of memoryStore.values()) {
        const matches = Object.entries(filter).every(([k, v]) =>
          v === undefined ? true : (item as any)[k] === v
        );
        if (matches) results.push(item);
      }
      return results.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
    }

    static async upsertOption(input: {
      category: string;
      key: string;
      label: string;
      description?: string;
      active?: boolean;
      sortOrder?: number;
    }): Promise<SpecificationOptionDoc> {
      const category = input.category.trim().toUpperCase();
      const key = input.key.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
      const label = input.label.trim();
      const _id = SpecificationOption.makeId(category, key);
      const now = new Date().toISOString();

      const doc: SpecificationOptionDoc = {
        _id,
        category,
        key,
        label,
        name: label,
        description: input.description || '',
        active: input.active ?? true,
        sortOrder: input.sortOrder ?? 50,
        updatedAt: now,
      };

      const db = await getMongoDb();
      if (db) {
        const colName = getCollectionNameForCategory(category);
        const col = db.collection(colName);
        const { _id: idVal, ...fieldsToSet } = doc;

        if (colName !== 'specification_options') {
          const existing = await col.findOne({
            $or: [{ _id: idVal as any }, { key }, { name: label }, { label }],
          });
          if (existing) {
            await col.updateOne(
              { _id: existing._id },
              { $set: fieldsToSet }
            );
            return { ...doc, _id: String(existing._id) };
          }
        }

        await col.updateOne(
          { _id: idVal as any },
          {
            $set: fieldsToSet,
            $setOnInsert: { createdAt: now },
          },
          { upsert: true }
        );
      } else {
        memoryStore.set(_id, { ...doc, createdAt: now });
      }

      return doc;
    }

    static async updateById(
      id: string,
      updates: Partial<Omit<SpecificationOptionDoc, '_id'>>
    ): Promise<SpecificationOptionDoc | null> {
      const now = new Date().toISOString();
      const db = await getMongoDb();

      if (db) {
        const collectionsToSearch = [
          'specification_options',
          ...Array.from(new Set(Object.values(CATEGORY_COLLECTION_MAP))),
        ];

        for (const colName of collectionsToSearch) {
          const col = db.collection(colName);
          const allDocs = await col.find({}).toArray();
          const matched = allDocs.find((d) => String(d._id) === String(id));
          if (matched) {
            const updatePayload: Record<string, any> = {
              ...updates,
              updatedAt: now,
            };
            if (updates.label !== undefined) {
              updatePayload.name = updates.label;
            }
            await col.updateOne({ _id: matched._id }, { $set: updatePayload });
            const refreshed = await col.findOne({ _id: matched._id });
            const fallbackCat = Object.entries(CATEGORY_COLLECTION_MAP).find(
              ([, c]) => c === colName
            )?.[0];
            return refreshed ? normalizeMongoDoc(refreshed, fallbackCat) : null;
          }
        }
        return null;
      }

      const existing = memoryStore.get(id);
      if (!existing) return null;
      const updated = {
        ...existing,
        ...updates,
        ...(updates.label ? { name: updates.label } : {}),
        updatedAt: now,
      };
      memoryStore.set(id, updated);
      return updated;
    }

    static async deleteById(id: string): Promise<boolean> {
      const db = await getMongoDb();
      if (db) {
        const collectionsToSearch = [
          'specification_options',
          ...Array.from(new Set(Object.values(CATEGORY_COLLECTION_MAP))),
        ];

        for (const colName of collectionsToSearch) {
          const col = db.collection(colName);
          const allDocs = await col.find({}).toArray();
          const matched = allDocs.find((d) => String(d._id) === String(id));
          if (matched) {
            const res = await col.deleteOne({ _id: matched._id });
            return res.deletedCount > 0;
          }
        }
        return false;
      }
      return memoryStore.delete(id);
    }
  }

  export default SpecificationOption;
