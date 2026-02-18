import { NextResponse } from 'next/server';
import { getAuthClient } from '@/lib/authClient';

export async function GET() {
  const adminDomain = process.env.AEGIS_ADMIN_DOMAIN;

  if (!adminDomain) {
    return NextResponse.json(
      { error: 'AEGIS_ADMIN_DOMAIN is not configured' },
      { status: 500 }
    );
  }

  try {
    const client = getAuthClient();
    const result = await client.getSiteByDomain(adminDomain);

    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 404 }
      );
    }
  } catch (error) {
    console.error('Aegis admin site lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
