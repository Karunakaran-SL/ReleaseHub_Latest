// SPDX-License-Identifier: AGPL-3.0-only
import { NextRequest, NextResponse } from 'next/server';
import { SpecificationOption } from '@/models/SpecificationOption';
import { seedSpecificationOptions } from '@/db/seed';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category')?.toUpperCase();
    const includeInactive = searchParams.get('includeInactive') === 'true';

      // Ensure the requested category (or all default categories) is seeded in MongoDB if empty
      const existingCount = await SpecificationOption.countDocuments(
        category ? { category } : {}
      );
      if (existingCount === 0) {
        await seedSpecificationOptions(category);
      }

      const filter: Record<string, any> = {};
      if (category) {
        filter.category = category;
      }
      if (!includeInactive) {
        filter.active = true;
      }

      const options = await SpecificationOption.find(filter);

      return NextResponse.json({
        options,
        items: options,
        count: options.length,
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error?.message || 'Failed to fetch specification options from database' },
        { status: 500 }
      );
    }
  }

export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const { category, key, label, description, active, sortOrder } = body;

      if (!category || !key || !label) {
        return NextResponse.json(
          { error: 'category, key, and label are required' },
          { status: 400 }
        );
      }

      const option = await SpecificationOption.upsertOption({
        category: String(category),
        key: String(key),
        label: String(label),
        description: description ? String(description) : undefined,
        active: active !== undefined ? Boolean(active) : true,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : undefined,
      });

      return NextResponse.json({ option, success: true }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json(
        { error: error?.message || 'Failed to save specification option to database' },
        { status: 500 }
      );
    }
  }
