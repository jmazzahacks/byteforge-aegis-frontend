import { NextRequest, NextResponse } from 'next/server';
import { AuthClient } from 'byteforge-aegis-client-js';
import { logger } from '@/lib/logger';
import { requireAegisAdmin } from '@/lib/aegisAdminAuth';
import { isUuid } from '@/lib/uuid';

const API_URL = process.env.API_URL || 'http://localhost:5678';

/**
 * Whether a site is deletion-protected — and nothing else.
 *
 * The full site record carries tenant_api_key, mailgun_api_key and
 * webhook_secret. Pages that only need to know whether deletion is refused
 * (the user list, to disable Delete up front) should not pull those into the
 * browser, where they land in devtools history and the disk cache for a page
 * that never displays them. Same-privilege data, but no reason to ship it.
 */
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
    return NextResponse.json({ error: 'Invalid site ID' }, { status: 400 });
  }

  try {
    const client = new AuthClient({ apiUrl: API_URL, masterApiKey });
    const result = await client.getSite(siteId);

    if (result.success) {
      return NextResponse.json({
        deletion_protected: result.data.deletion_protected === true,
      });
    } else {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: result.statusCode || 500 }
      );
    }
  } catch (error) {
    logger.error('Fetch site protection failed', {
      route: '/api/frontend/aegis-admin/sites/[siteId]/protection',
      error: String(error),
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
