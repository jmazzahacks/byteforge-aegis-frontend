import type { NextRequest } from 'next/server';
import { AuthClient } from 'byteforge-aegis-client-js';

const API_URL = process.env.API_URL || 'http://localhost:5678';
const TENANT_API_KEY = process.env.AEGIS_TENANT_API_KEY;

// Server-side only auth client (uses env var). Picks up AEGIS_TENANT_API_KEY
// to authenticate against Aegis's gated public auth endpoints.
export function getAuthClient(): AuthClient {
  return new AuthClient({
    apiUrl: API_URL,
    tenantApiKey: TENANT_API_KEY,
  });
}

// Server-side client scoped to a specific tenant site. Use in proxy routes
// for endpoints that need site_id in the body (verify-email, etc.).
export function getAuthClientForSite(siteId: number): AuthClient {
  return new AuthClient({
    apiUrl: API_URL,
    siteId,
    tenantApiKey: TENANT_API_KEY,
  });
}

// Resolve the tenant site_id from the inbound request's Host header by
// looking it up via Aegis's public by-domain endpoint.
export async function resolveSiteIdFromRequest(request: NextRequest): Promise<number | null> {
  const host = request.headers.get('host');
  if (!host) return null;
  const domain = host.split(':')[0];
  const client = getAuthClient();
  const result = await client.getSiteByDomain(domain);
  return result.success ? result.data.id : null;
}

// Client-side auth client (uses relative URL, works with nginx routing).
// Calls the local /api/frontend/* proxy routes — never Aegis directly —
// so it does NOT need the tenant API key.
export function getClientSideAuthClient(): AuthClient {
  return new AuthClient({ apiUrl: '' });
}
