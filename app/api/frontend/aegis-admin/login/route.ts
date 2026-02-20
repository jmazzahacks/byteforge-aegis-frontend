import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '@/lib/authClient';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const adminDomain = process.env.AEGIS_ADMIN_DOMAIN;

  if (!adminDomain) {
    return NextResponse.json(
      { error: 'AEGIS_ADMIN_DOMAIN is not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const client = getAuthClient();

    // Resolve admin site_id from domain
    const siteResult = await client.getSiteByDomain(adminDomain);
    if (!siteResult.success) {
      return NextResponse.json(
        { error: 'Admin site not found' },
        { status: 500 }
      );
    }

    const siteId = siteResult.data.id;

    // Login against the admin site
    const loginResult = await client.login(email, password, siteId);

    if (loginResult.success) {
      logger.info('Aegis admin login successful', { route: '/api/frontend/aegis-admin/login' });
      return NextResponse.json(loginResult.data);
    } else {
      return NextResponse.json(
        { error: loginResult.error },
        { status: loginResult.statusCode || 401 }
      );
    }
  } catch (error) {
    logger.error('Request failed', { route: '/api/frontend/aegis-admin/login', error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
