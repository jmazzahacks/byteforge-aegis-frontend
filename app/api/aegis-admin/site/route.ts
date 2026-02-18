import { NextResponse } from 'next/server';
import { getAuthClient } from '@/lib/authClient';
import { logger } from '@/lib/logger';

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
      logger.info('Aegis admin site lookup successful', { route: '/api/aegis-admin/site' });
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 404 }
      );
    }
  } catch (error) {
    logger.error('Request failed', { route: '/api/aegis-admin/site', error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
