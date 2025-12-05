import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '@/lib/authClient';

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain');

  if (!domain) {
    return NextResponse.json(
      { error: 'Domain parameter is required' },
      { status: 400 }
    );
  }

  try {
    const client = getAuthClient();
    const result = await client.getSiteByDomain(domain);

    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 404 }
      );
    }
  } catch (error) {
    console.error('Get site error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
