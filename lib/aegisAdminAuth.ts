import { NextRequest, NextResponse } from 'next/server';
import { AuthClient } from 'byteforge-aegis-client-js';
import type { User } from 'byteforge-aegis-client-js';
import { logger } from '@/lib/logger';

const API_URL = process.env.API_URL || 'http://localhost:5678';

export type AegisAdminAuthResult =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse };

/**
 * Authorization gate for every aegis-admin BFF route that acts with the
 * server-side MASTER_API_KEY.
 *
 * Header *presence* is not enough: the bearer token is validated against the
 * backend (via me()) and the resolved user must be an admin ON the Aegis admin
 * site (AEGIS_ADMIN_DOMAIN). Without this, any caller could send an arbitrary
 * Bearer string and trigger a master-key-authorized operation — including the
 * irreversible site delete.
 *
 * Returns the resolved super-admin user on success, or a ready-to-return
 * NextResponse (401/403/500) on failure.
 */
export async function requireAegisAdmin(request: NextRequest): Promise<AegisAdminAuthResult> {
  const adminDomain = process.env.AEGIS_ADMIN_DOMAIN;
  if (!adminDomain) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'AEGIS_ADMIN_DOMAIN is not configured' }, { status: 500 }),
    };
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Authorization required' }, { status: 401 }),
    };
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Authorization required' }, { status: 401 }),
    };
  }

  // Validate the token against the backend and load the user record (role, site_id).
  const client = new AuthClient({ apiUrl: API_URL });
  client.setAuthToken(token);

  const meResult = await client.me();
  if (!meResult.success) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }),
    };
  }
  const user = meResult.data;

  // Resolve the Aegis admin site (public by-domain endpoint) and confirm the
  // caller is an admin on THAT site — not merely an admin of some tenant site.
  const siteResult = await client.getSiteByDomain(adminDomain);
  if (!siteResult.success) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Admin site not found' }, { status: 500 }),
    };
  }

  if (user.site_id !== siteResult.data.id || user.role !== 'admin') {
    logger.warning('Aegis admin authorization denied', {
      userId: String(user.id),
      userSiteId: String(user.site_id),
      role: user.role,
    });
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { ok: true, user };
}
