import { NextRequest, NextResponse } from 'next/server';
import { validateSpecification } from '@/lib/spec-validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawContent: string =
      typeof body.rawContent === 'string'
        ? body.rawContent
        : typeof body.content === 'string'
        ? body.content
        : JSON.stringify(body);

    const trimmed = rawContent.trim();
    const format: 'json' | 'yaml' =
      body.format === 'json' || body.format === 'yaml'
        ? body.format
        : trimmed.startsWith('{') || trimmed.startsWith('[')
        ? 'json'
        : 'yaml';

    const result = validateSpecification(rawContent, format);

    return NextResponse.json(
      {
        isValid: result.isValid,
        errors: result.errors,
        data: result.data || null,
        format,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Specification validation endpoint error:', error);
    return NextResponse.json(
      {
        isValid: false,
        errors: [
          {
            path: '/request',
            message: error?.message || 'Failed to validate specification payload.',
            suggestion: 'Ensure the request body contains valid rawContent and format ("json" or "yaml").',
          },
        ],
      },
      { status: 400 }
    );
  }
}

