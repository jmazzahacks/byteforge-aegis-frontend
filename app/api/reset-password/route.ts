import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '@/lib/authClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, new_password } = body;

    if (!token || !new_password) {
      return NextResponse.json(
        { error: 'Token and new_password are required' },
        { status: 400 }
      );
    }

    const client = getAuthClient();
    const result = await client.resetPassword(token, new_password);

    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 400 }
      );
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
