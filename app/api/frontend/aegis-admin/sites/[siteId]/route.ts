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
        { error: result.error },
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

    const client = new AuthClient({ apiUrl: API_URL, masterApiKey });
    const result = await client.updateSite(siteId, body);

    if (result.success) {
      logger.info('Site updated', { route: '/api/frontend/aegis-admin/sites/[siteId]', siteId });
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
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
        { error: result.error },
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
