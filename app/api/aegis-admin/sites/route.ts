import { NextRequest, NextResponse } from 'next/server';
import { AuthClient } from 'byteforge-aegis-client-js';

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
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authorization required' },
      { status: 401 }
    );
  }

  try {
    const client = new AuthClient({ apiUrl: API_URL, masterApiKey });
    const result = await client.listSites();

    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }
  } catch (error) {
    console.error('Aegis admin list sites error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
