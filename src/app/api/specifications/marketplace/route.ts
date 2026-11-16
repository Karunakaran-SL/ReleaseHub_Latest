import { NextRequest, NextResponse } from 'next/server';
import { CURATED_MARKETPLACE_CATALOG, filterMarketplaceCatalog } from '@/models/MarketplaceCatalog';
import { Specification } from '@/models/Specification';
import { validateSpecification } from '@/lib/spec-validator';
import clientPromise from '@/lib/mongodb';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorType = searchParams.get('vendorType');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    const items = filterMarketplaceCatalog({ vendorType, tag, search });

    return NextResponse.json(
      {
        items,
        total: items.length,
        availableTags: ['AWS', 'Azure', 'Dell', 'Nvidia', 'Kubernetes', 'HPE'],
        availableVendorTypes: ['OEM', 'HARDWARE', 'CLOUD'],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Marketplace catalog GET error:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to fetch Marketplace catalog.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const marketplaceSpecId = body.marketplaceSpecId || body.specId;

    const template =
      CURATED_MARKETPLACE_CATALOG.find((item) => item.specId === marketplaceSpecId) || body;

    const validation = validateSpecification(JSON.stringify(template), 'json');
    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        {
          message: 'Marketplace specification failed schema validation.',
          isValid: false,
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const specModel = new Specification({
      ...validation.data,
      specId: validation.data.specId || marketplaceSpecId || `mp-${Date.now()}`,
      name: validation.data.name || 'Marketplace Specification',
      version: String(validation.data.version || '1.0.0'),
      sourceType: 'MARKETPLACE',
      vendorMeta: validation.data.vendorMeta || {
        publisherName: validation.data.vendor || 'Marketplace Publisher',
        vendorType: 'CLOUD',
        verified: true,
        marketplaceSpecId: validation.data.specId,
      },
    });

    const doc = specModel.toDocument();
    const { _id, ...fieldsToSet } = doc;

    try {
      const client = await clientPromise;
      const db = client.db();
      const collection = db.collection('specifications');

      await collection.updateOne(
        { _id: _id as any },
        { $set: fieldsToSet },
        { upsert: true }
      );

      await logAuditEvent({
        action: 'CREATE',
        entity: 'specification',
        entityId: _id,
        comment: `Marketplace specification "${doc.name}" (${doc.specId}) imported from ${doc.vendorMeta?.publisherName}.`,
      }).catch(() => {});
    } catch (dbErr) {
      console.warn('Database fallback during Marketplace import:', dbErr);
    }

    return NextResponse.json(
      {
        message: 'Marketplace specification imported successfully.',
        specification: doc,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Marketplace import POST error:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to import Marketplace specification.' },
      { status: 500 }
    );
  }
}

