import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '@/lib/authClient';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, new_password } = body;

    if (!token || !new_password) {
      return NextResponse.json(
        { error: 'Token and new_password are required' },
        { status: 400 }
      );
    }

    const client = getAuthClient();
    const result = await client.resetPassword(token, new_password);

    if (result.success) {
      logger.info('Password reset successful', { route: '/api/frontend/reset-password' });
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 400 }
      );
    }
  } catch (error) {
    logger.error('Request failed', { route: '/api/frontend/reset-password', error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
