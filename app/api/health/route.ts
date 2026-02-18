import { NextResponse } from 'next/server';
import { getAuthClient } from '@/lib/authClient';
import { logger } from '@/lib/logger';

export async function GET() {
  const apiUrl = process.env.API_URL || 'http://localhost:5678';

  try {
    const client = getAuthClient();
    const result = await client.healthCheck();

    if (result.success) {
      logger.info('Health check passed', { route: '/api/health' });
      return NextResponse.json({
        status: 'healthy',
        frontend: 'ok',
        backend: 'ok',
        backend_url: apiUrl,
      });
    } else {
      return NextResponse.json({
        status: 'degraded',
        frontend: 'ok',
        backend: 'error',
        backend_url: apiUrl,
        error: result.error,
      }, { status: 503 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Health check failed', { route: '/api/health', error: String(error) });
    return NextResponse.json({
      status: 'degraded',
      frontend: 'ok',
      backend: 'unreachable',
      backend_url: apiUrl,
      error: errorMessage,
    }, { status: 503 });
  }
}
