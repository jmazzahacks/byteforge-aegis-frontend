/**
 * Browser-side auth client that calls local Next.js API routes.
 * This keeps the backend URL hidden from the browser.
 */

interface Site {
  id: number;
  name: string;
  domain: string;
  frontend_url: string;
  email_from: string;
  email_from_name: string;
  created_at: number;
  updated_at: number;
}

interface LoginResponse {
  token: string;
  user_id: number;
  expires_at: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data as T };
    } else {
      return {
        success: false,
        error: data.error || 'Unknown error',
        statusCode: response.status,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      statusCode: 0,
    };
  }
}

export const browserClient = {
  /**
   * Get site information by domain
   */
  async getSiteByDomain(domain: string): Promise<ApiResponse<Site>> {
    return request<Site>(`/api/site?domain=${encodeURIComponent(domain)}`);
  },

  /**
   * Login with email and password
   */
  async login(siteId: number, email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return request<LoginResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ site_id: siteId, email, password }),
    });
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<ApiResponse<unknown>> {
    return request('/api/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<unknown>> {
    return request('/api/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  },

  /**
   * Confirm email change with token
   */
  async confirmEmailChange(token: string): Promise<ApiResponse<unknown>> {
    return request('/api/confirm-email-change', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },
};

export type { Site, LoginResponse, ApiResponse };
