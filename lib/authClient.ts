import { AuthClient } from 'byteforge-aegis-client-js';

const API_URL = process.env.API_URL || 'http://localhost:5678';

// Server-side only auth client
export function getAuthClient(): AuthClient {
  return new AuthClient({ apiUrl: API_URL });
}
