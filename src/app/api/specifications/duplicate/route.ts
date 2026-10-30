import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { toStudioSpecObject } from '@/lib/spec-validator';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceId, name, specId, sourceSpec } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ message: 'Specification name is required.' }, { status: 400 });
    }

    let originalDoc: Record<string, any> | null = sourceSpec || null;

    if (!originalDoc && sourceId) {
      try {
        const client = await clientPromise;
        const db = client.db();
        originalDoc = await db.collection('specifications').findOne({
          $or: [{ _id: sourceId as any }, { specId: sourceId }],
        });
      } catch (dbErr) {
        console.warn('Database read fallback during duplicate:', dbErr);
      }
    }

    const baseSpec = toStudioSpecObject(
      originalDoc || {
        specId: sourceId || 'spec-base',
        name: String(name).replace(/\s*\(Copy\)$/i, ''),
        version: '1.0.0',
        target: 'kubernetes',
        steps: ['build', 'deploy'],
      }
    );

    const { _id: _ignoreId, ...restBase } = baseSpec;
    const newSpecId = String(specId || `spec-${Date.now()}`);
      const fieldsToSet: Record<string, any> = {
        ...restBase,
        specId: newSpecId,
        name: String(name).trim(),
          duplicatedFrom: sourceId || baseSpec.specId,
            createdAt: new Date().toISOString(),
    };

  const duplicatedSpec = { _id: newSpecId, ...fieldsToSet };

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('specifications');
    await collection.updateOne(
      { _id: newSpecId as any },
      { $set: fieldsToSet },
      { upsert: true }
    );

    await logAuditEvent({
      action: 'CREATE',
      entity: 'specification',
      entityId: newSpecId,
      comment: `Specification "${duplicatedSpec.name}" duplicated from "${baseSpec.name}".`,
    }).catch(() => { });
  } catch (dbErr) {
    console.warn('Database write fallback during duplicate:', dbErr);
  }

  return NextResponse.json(
    {
      message: 'Specification duplicated successfully.',
      specification: duplicatedSpec,
    },
    { status: 201 }
  );
} catch (error: any) {
  console.error('Duplicate specification error:', error);
  return NextResponse.json(
    { message: error?.message || 'Failed to duplicate specification.' },
    { status: 500 }
  );
}
}
