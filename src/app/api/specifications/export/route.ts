import { NextRequest, NextResponse } from 'next/server';
import * as yaml from 'js-yaml';
import clientPromise from '@/lib/mongodb';
import { toStudioSpecObject } from '@/lib/spec-validator';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const format = (searchParams.get('format') || 'json').toLowerCase() === 'yaml' ? 'yaml' : 'json';

    let specDoc: Record<string, any> | null = null;

    if (id) {
      try {
        const client = await clientPromise;
        const db = client.db();
        specDoc = await db.collection('specifications').findOne({
          $or: [{ _id: id as any }, { specId: id }],
        });
      } catch (dbErr) {
        console.warn('Database lookup fallback during export:', dbErr);
      }
    }

    const studioSpec = toStudioSpecObject(
      specDoc || {
        specId: id || 'spec-default',
        name: 'Kubernetes Production Blueprint',
        version: '1.2.0',
        target: 'kubernetes',
        steps: ['validate-cluster', 'provision-nodes', 'deploy-cni', 'verify-health'],
      }
    );

    const content =
      format === 'yaml'
        ? yaml.dump(studioSpec, { indent: 2, lineWidth: 100 })
        : JSON.stringify(studioSpec, null, 2);

    const ext = format === 'yaml' ? 'yaml' : 'json';
    const safeName = String(studioSpec.specId || studioSpec.name || 'specification')
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-');

    return NextResponse.json(
      {
        spec: studioSpec,
        format,
        content,
        filename: `${safeName}.${ext}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Export specification error:', error);
    return NextResponse.json({ message: 'Failed to export specification.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const format = (body.format || 'json').toLowerCase() === 'yaml' ? 'yaml' : 'json';
    const studioSpec = toStudioSpecObject(body.spec || body);

    const content =
      format === 'yaml'
        ? yaml.dump(studioSpec, { indent: 2, lineWidth: 100 })
        : JSON.stringify(studioSpec, null, 2);

    const ext = format === 'yaml' ? 'yaml' : 'json';
    const safeName = String(studioSpec.specId || studioSpec.name || 'specification')
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-');

    return NextResponse.json(
      {
        spec: studioSpec,
        format,
        content,
        filename: `${safeName}.${ext}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Export specification POST error:', error);
    return NextResponse.json({ message: 'Failed to format specification for export.' }, { status: 500 });
  }
}

