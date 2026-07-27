import { NextRequest, NextResponse } from 'next/server';
import { AuthClient } from 'byteforge-aegis-client-js';
import { logger } from '@/lib/logger';
import { requireAegisAdmin } from '@/lib/aegisAdminAuth';
import { isUuid } from '@/lib/uuid';

const API_URL = process.env.API_URL || 'http://localhost:5678';

/**
 * Enable deletion protection on a single user. Deliberately one-directional.
 *
 * Protecting an account is safe; UNprotecting it is the dangerous half — it
 * re-arms an irreversible delete on an account someone marked precisely
 * because losing it would be unrecoverable. This route refuses anything that
 * is not literally `true` rather than merely hiding a control: this BFF holds
 * the MASTER_API_KEY, so anything it is willing to do is reachable by any
 * authenticated aegis admin with devtools. A strict `=== false` check would
 * not be enough — the backend coerces "false"/"0"/"off" to False, so a string
 * would slip past. Clearing protection stays an explicit master-key API call
 * made outside the console.
 */
export async function PATCH(
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

  if (!isUuid(userId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const deletionProtected = (body as { deletion_protected?: unknown })?.deletion_protected;

  if (deletionProtected !== true) {
    // Only an explicit clearing attempt is worth an audit warning; a
    // malformed body is a client bug, not an operator trying something.
    if (deletionProtected !== undefined) {
      logger.warning('Aegis admin attempted to clear user deletion protection via the console', {
        route: '/api/frontend/aegis-admin/users/[userId]',
        userId,
        actor: auth.user.uuid,
      });
    }
    return NextResponse.json(
      { error: 'Deletion protection can only be enabled here; clearing it requires an explicit admin API call' },
      { status: 400 }
    );
  }

  try {
    const client = new AuthClient({ apiUrl: API_URL, masterApiKey });
    const result = await client.setUserDeletionProtection(userId, true);

    if (result.success) {
      logger.info('User deletion protection enabled', {
        route: '/api/frontend/aegis-admin/users/[userId]',
        userId,
        actor: auth.user.uuid,
      });
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }
  } catch (error) {
    logger.error('Enable user deletion protection failed', {
      route: '/api/frontend/aegis-admin/users/[userId]',
      error: String(error),
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

  if (!isUuid(userId)) {
    return NextResponse.json(
      { error: 'Invalid user ID' },
      { status: 400 }
    );
  }

  // Guard against self-deletion: an aegis admin must not delete the account
  // they are currently authenticated as (would lock them out mid-session).
  // Postgres stores UUIDs lowercase; normalize before comparing.
  if (auth.user.uuid === userId.toLowerCase()) {
    logger.warning('Aegis admin attempted to delete their own account', {
      route: '/api/frontend/aegis-admin/users/[userId]',
      userId,
    });
    return NextResponse.json(
      { error: 'You cannot delete the account you are logged in as' },
      { status: 400 }
    );
  }

  try {
    const client = new AuthClient({ apiUrl: API_URL, masterApiKey });
    const result = await client.deleteUser(userId);

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
