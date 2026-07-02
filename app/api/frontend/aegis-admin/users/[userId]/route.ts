import { NextRequest, NextResponse } from 'next/server';
import { AuthClient } from 'byteforge-aegis-client-js';
import { logger } from '@/lib/logger';
import { requireAegisAdmin } from '@/lib/aegisAdminAuth';

const API_URL = process.env.API_URL || 'http://localhost:5678';

export async function DELETE(
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

  const auth = await requireAegisAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  const { userId } = await params;

  // Strict integer validation — parseInt alone would accept numeric-prefixed
  // junk ("12abc" -> 12) and silently truncate a UUID, deleting the wrong
  // user. Match the backend's isdigit() strictness and reject anything else.
  if (!/^\d+$/.test(userId)) {
    return NextResponse.json(
      { error: 'Invalid user ID' },
      { status: 400 }
    );
  }
  const userIdNum = parseInt(userId, 10);

  // Guard against self-deletion: an aegis admin must not delete the account
  // they are currently authenticated as (would lock them out mid-session).
  if (auth.user.id === userIdNum) {
    logger.warning('Aegis admin attempted to delete their own account', {
      route: '/api/frontend/aegis-admin/users/[userId]',
      userId: String(userIdNum),
    });
    return NextResponse.json(
      { error: 'You cannot delete the account you are logged in as' },
      { status: 400 }
    );
  }

  try {
    const client = new AuthClient({ apiUrl: API_URL, masterApiKey });
    const result = await client.deleteUser(userIdNum);

    if (result.success) {
      logger.info('User deleted', { route: '/api/frontend/aegis-admin/users/[userId]', userId });
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }
  } catch (error) {
    logger.error('Delete user failed', { route: '/api/frontend/aegis-admin/users/[userId]', error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
