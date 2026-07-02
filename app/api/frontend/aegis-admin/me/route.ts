import { NextRequest, NextResponse } from 'next/server';
import { requireAegisAdmin } from '@/lib/aegisAdminAuth';

/**
 * Returns the currently authenticated Aegis super-admin's own user record.
 *
 * Used by the admin UI to reliably know "who am I" (e.g. to hide destructive
 * actions on the admin's own row) without trusting a possibly-stale
 * localStorage value.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAegisAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(auth.user);
}
