import { NextRequest, NextResponse } from 'next/server';
import { AuthClient, CreateSiteRequest } from 'byteforge-aegis-client-js';
import { logger } from '@/lib/logger';
import { requireAegisAdmin } from '@/lib/aegisAdminAuth';

const API_URL = process.env.API_URL || 'http://localhost:5678';

export async function GET(request: NextRequest) {
  const masterApiKey = process.env.MASTER_API_KEY;

  if (!masterApiKey) {
    return NextResponse.json(
      { error: 'MASTER_API_KEY is not configured' },
      { status: 500 }
    );
  }

  // Verify caller has a valid Bearer token (prevents unauthorized browser access)
  const auth = await requireAegisAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const client = new AuthClient({ apiUrl: API_URL, masterApiKey });
    const result = await client.listSites();

    if (result.success) {
      logger.info('Sites listed', { route: '/api/frontend/aegis-admin/sites' });
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }
  } catch (error) {
    logger.error('Request failed', { route: '/api/frontend/aegis-admin/sites', error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

  try {
    const body: CreateSiteRequest = await request.json();

    const client = new AuthClient({ apiUrl: API_URL, masterApiKey });
    const result = await client.createSite(body);

    if (result.success) {
      logger.info('Site created', { route: '/api/frontend/aegis-admin/sites', domain: body.domain });
      return NextResponse.json(result.data, { status: 201 });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }
  } catch (error) {
    logger.error('Create site failed', { route: '/api/frontend/aegis-admin/sites', error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
