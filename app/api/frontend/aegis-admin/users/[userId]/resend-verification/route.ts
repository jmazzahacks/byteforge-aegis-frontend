import { NextRequest, NextResponse } from 'next/server';
import { AuthClient } from 'byteforge-aegis-client-js';
import { logger } from '@/lib/logger';

const API_URL = process.env.API_URL || 'http://localhost:5678';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const masterApiKey = process.env.MASTER_API_KEY;

  if (!masterApiKey) {
    return NextResponse.json(
      { error: 'MASTER_API_KEY is not configured' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authorization required' },
      { status: 401 }
    );
  }

  const { userId } = await params;
  const userIdNum = parseInt(userId, 10);

  if (isNaN(userIdNum)) {
    return NextResponse.json(
      { error: 'Invalid user ID' },
      { status: 400 }
    );
  }

  try {
    const client = new AuthClient({ apiUrl: API_URL, masterApiKey });
    const result = await client.resendVerification(userIdNum);

    if (result.success) {
      logger.info('Verification email resent', { route: '/api/frontend/aegis-admin/users/[userId]/resend-verification', userId });
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }
  } catch (error) {
    logger.error('Resend verification failed', { route: '/api/frontend/aegis-admin/users/[userId]/resend-verification', error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
