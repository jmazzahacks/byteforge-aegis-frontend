import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '@/lib/authClient';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const client = getAuthClient();
    client.setAuthToken(token);

    const result = await client.adminListUsers();

    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }
  } catch (error) {
    console.error('Admin list users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
