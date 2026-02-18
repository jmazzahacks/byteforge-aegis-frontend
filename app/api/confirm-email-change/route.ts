import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '@/lib/authClient';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const client = getAuthClient();
    const result = await client.confirmEmailChange(token);

    if (result.success) {
      logger.info('Email change confirmed', { route: '/api/confirm-email-change' });
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 400 }
      );
    }
  } catch (error) {
    logger.error('Request failed', { route: '/api/confirm-email-change', error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
