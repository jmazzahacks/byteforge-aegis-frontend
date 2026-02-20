import { NextRequest, NextResponse } from 'next/server';
import { AuthClient, UserRole } from 'byteforge-aegis-client-js';
import { logger } from '@/lib/logger';

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

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authorization required' },
      { status: 401 }
    );
  }

  const { siteId } = await params;
  const siteIdNum = parseInt(siteId, 10);

  if (isNaN(siteIdNum)) {
    return NextResponse.json(
      { error: 'Invalid site ID' },
      { status: 400 }
    );
  }

  try {
    const client = new AuthClient({ apiUrl: API_URL, masterApiKey });
    const result = await client.listUsersBySite(siteIdNum);

    if (result.success) {
      logger.info('Site users listed', { route: '/api/frontend/aegis-admin/sites/[siteId]/users', siteId });
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }
  } catch (error) {
    logger.error('Request failed', { route: '/api/frontend/aegis-admin/sites/[siteId]/users', error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
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

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authorization required' },
      { status: 401 }
    );
  }

  const { siteId } = await params;
  const siteIdNum = parseInt(siteId, 10);

  if (isNaN(siteIdNum)) {
    return NextResponse.json(
      { error: 'Invalid site ID' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { email, role } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const client = new AuthClient({ apiUrl: API_URL, masterApiKey });
    const userRole = role === 'admin' ? 'admin' as UserRole : 'user' as UserRole;
    const result = await client.registerAdmin(email, siteIdNum, userRole);

    if (result.success) {
      logger.info('User created via aegis admin', { route: '/api/frontend/aegis-admin/sites/[siteId]/users', siteId, email });
      return NextResponse.json(result.data, { status: 201 });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }
  } catch (error) {
    logger.error('Create user failed', { route: '/api/frontend/aegis-admin/sites/[siteId]/users', error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
