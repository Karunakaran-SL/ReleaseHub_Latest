// SPDX-License-Identifier: AGPL-3.0-only
import { NextRequest, NextResponse } from 'next/server';
import { SpecificationOption } from '@/models/SpecificationOption';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updates: Record<string, any> = {};
    if (body.label !== undefined) updates.label = String(body.label).trim();
    if (body.key !== undefined) updates.key = String(body.key).trim().toUpperCase();
    if (body.description !== undefined) updates.description = String(body.description);
    if (body.active !== undefined) updates.active = Boolean(body.active);
    if (body.sortOrder !== undefined) updates.sortOrder = Number(body.sortOrder);

    const updated = await SpecificationOption.updateById(decodeURIComponent(id), updates);
    if (!updated) {
      return NextResponse.json(
        { error: `Option '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ option: updated, success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update specification option' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(req, context);
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const decodedId = decodeURIComponent(id);
    const deleted = await SpecificationOption.deleteById(decodedId);

    return NextResponse.json({ deleted, success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete specification option' },
      { status: 500 }
    );
  }
}

