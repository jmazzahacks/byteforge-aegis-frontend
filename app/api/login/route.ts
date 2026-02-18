import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '@/lib/authClient';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { site_id, email, password } = body;

    if (!site_id || !email || !password) {
      return NextResponse.json(
        { error: 'site_id, email, and password are required' },
        { status: 400 }
      );
    }

    const client = getAuthClient();
    const result = await client.login(email, password, site_id);

    if (result.success) {
      logger.info('Login successful', { route: '/api/login' });
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 401 }
      );
    }
  } catch (error) {
    logger.error('Request failed', { route: '/api/login', error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
