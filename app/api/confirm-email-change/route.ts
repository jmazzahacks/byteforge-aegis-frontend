import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '@/lib/authClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const client = getAuthClient();
    const result = await client.confirmEmailChange(token);

    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 400 }
      );
    }
  } catch (error) {
    console.error('Confirm email change error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
