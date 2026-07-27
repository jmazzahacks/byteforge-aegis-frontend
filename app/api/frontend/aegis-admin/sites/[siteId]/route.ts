import { NextRequest, NextResponse } from 'next/server';
import { AuthClient, UpdateSiteRequest } from 'byteforge-aegis-client-js';
import { logger } from '@/lib/logger';
import { requireAegisAdmin } from '@/lib/aegisAdminAuth';
import { isUuid } from '@/lib/uuid';

const API_URL = process.env.API_URL || 'http://localhost:5678';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
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

  const { siteId } = await params;
  if (!isUuid(siteId)) {
    return NextResponse.json(
      { error: 'Invalid site ID' },
      { status: 400 }
    );
  }

  try {
    const client = new AuthClient({ apiUrl: API_URL, masterApiKey });
    const result = await client.getSite(siteId);

    if (result.success) {
      logger.info('Site fetched', { route: '/api/frontend/aegis-admin/sites/[siteId]', siteId });
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: result.statusCode || 500 }
      );
    }
  } catch (error) {
    logger.error('Request failed', { route: '/api/frontend/aegis-admin/sites/[siteId]', error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
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

  const { siteId } = await params;
  if (!isUuid(siteId)) {
    return NextResponse.json(
      { error: 'Invalid site ID' },
      { status: 400 }
    );
  }

  try {
    const body: UpdateSiteRequest = await request.json();

    // Deletion protection is one-directional from this console: it may be
    // turned ON here, but clearing it is the dangerous half — it re-arms
    // irreversible deletes across an entire tenant that was marked precisely
    // because losing its accounts is unrecoverable. Refuse rather than merely
    // hiding a control: this BFF holds the MASTER_API_KEY, so anything it is
    // willing to do is reachable by any authenticated aegis admin with
    // devtools. Clearing stays an explicit master-key API call made outside
    // the console.
    // Reject anything that is not literally `true`, not merely `=== false`:
    // the backend coerces "false", "0", "off", 0 and friends to False, so a
    // strict false-check would let a string through and silently clear
    // tenant-wide protection using the master key.
    if (body !== null && typeof body === 'object' && 'deletion_protected' in body
        && body.deletion_protected !== true) {
      logger.warning('Aegis admin attempted to clear site deletion protection via the console', {
        route: '/api/frontend/aegis-admin/sites/[siteId]',
        siteId,
        actor: auth.user.uuid,
      });
      return NextResponse.json(
        { error: 'Deletion protection can only be enabled here; clearing it requires an explicit admin API call' },
        { status: 400 }
      );
    }

    const client = new AuthClient({ apiUrl: API_URL, masterApiKey });
    const result = await client.updateSite(siteId, body);

    if (result.success) {
      logger.info('Site updated', { route: '/api/frontend/aegis-admin/sites/[siteId]', siteId });
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: result.statusCode || 500 }
      );
    }
  } catch (error) {
    logger.error('Update site failed', { route: '/api/frontend/aegis-admin/sites/[siteId]', error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
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

  const { siteId } = await params;
  if (!isUuid(siteId)) {
    return NextResponse.json(
      { error: 'Invalid site ID' },
      { status: 400 }
    );
  }

  try {
    const client = new AuthClient({ apiUrl: API_URL, masterApiKey });
    const result = await client.deleteSite(siteId);

    if (result.success) {
      logger.info('Site deleted', { route: '/api/frontend/aegis-admin/sites/[siteId]', siteId });
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: result.statusCode || 500 }
      );
    }
  } catch (error) {
    logger.error('Delete site failed', { route: '/api/frontend/aegis-admin/sites/[siteId]', error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
