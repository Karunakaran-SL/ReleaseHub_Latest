import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { validateSpecification } from '@/lib/spec-validator';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let rawContent: string;
    let format: 'json' | 'yaml' = body.format === 'yaml' ? 'yaml' : 'json';

    if (typeof body.rawContent === 'string') {
      rawContent = body.rawContent;
        const trimmed = rawContent.trim().replace(/^\uFEFF/, '');
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          format = 'json';
        } else if (body.format === 'yaml' || body.format === 'json') {
          format = body.format;
        } else {
          format = 'yaml';
        }
      } else if (typeof body.content === 'string') {
        rawContent = body.content;
        const trimmed = rawContent.trim().replace(/^\uFEFF/, '');
        format = trimmed.startsWith('{') || trimmed.startsWith('[') ? 'json' : 'yaml';
      } else if (body.spec && typeof body.spec === 'object') {
        rawContent = JSON.stringify(body.spec);
        format = 'json';
      } else {
        rawContent = JSON.stringify(body);
        format = 'json';
      }

      const validation = validateSpecification(rawContent, format);
      if (!validation.isValid || !validation.data) {
        return NextResponse.json(
          {
            message: 'Specification failed schema validation.',
            isValid: false,
            errors: validation.errors,
          },
          { status: 400 }
        );
      }

      const data = validation.data;
      const { _id: rawId, ...restData } = data;
      const docId = String(
        data.specId ||
        rawId ||
        String(data.name || 'spec').replace(/[^a-zA-Z0-9-_]/g, '') ||
        `spec-${Date.now()}`
      );
      const targetLabel = String(data.target || data.hw_type?.name || 'Virtual');

        const fieldsToSet: Record<string, any> = {
          ...restData,
          specId: docId,
          name: data.name,
          version: String(data.version || '1.0.0'),
                target: data.target || targetLabel.toLowerCase(),
                  steps: Array.isArray(data.steps) ? data.steps : ['build', 'deploy'],
                    vendor: data.vendor || 'Custom Studio',
                      hw_type: data.hw_type || {
                        id: targetLabel,
                        name: targetLabel.charAt(0).toUpperCase() + targetLabel.slice(1),
                      },
                          image: data.image || `https://picsum.photos/seed/${encodeURIComponent(docId)}/400/400`,
                            updatedAt: new Date().toISOString(),
    };

    const savedSpec = { _id: docId, ...fieldsToSet };

    try {
      const client = await clientPromise;
      const db = client.db();
      const collection = db.collection('specifications');

      await collection.updateOne(
        { _id: docId as any },
        { $set: fieldsToSet },
        { upsert: true }
      );

      await logAuditEvent({
        action: 'CREATE',
        entity: 'specification',
        entityId: docId,
        comment: `Specification "${savedSpec.name}" (${docId}) imported via Specification Studio.`,
      }).catch(() => { });
    } catch (dbErr) {
      console.error('Database write error during import:', dbErr);
      return NextResponse.json(
        { message: 'Database error while saving imported specification.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Specification imported successfully.',
        specification: savedSpec,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Import specification error:', error);
    return NextResponse.json(
      { message: error?.message || 'An internal server error occurred during import.' },
      { status: 500 }
    );
  }
}
