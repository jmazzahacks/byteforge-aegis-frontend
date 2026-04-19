/**
 * Browser-side auth client that calls local Next.js API routes.
 * This keeps the backend URL hidden from the browser.
 */

import type {
  Site,
  User,
  LoginResponse,
  ApiResponse,
  CreateSiteRequest,
  UpdateSiteRequest,
} from 'byteforge-aegis-client-js';

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
    return request<Site>(`/api/frontend/site?domain=${encodeURIComponent(domain)}`);
  },

  /**
   * Login with email and password
   */
  async login(siteId: number, email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return request<LoginResponse>('/api/frontend/login', {
      method: 'POST',
      body: JSON.stringify({ site_id: siteId, email, password }),
    });
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<ApiResponse<unknown>> {
    return request('/api/frontend/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<unknown>> {
    return request('/api/frontend/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  },

  /**
   * Confirm email change with token
   */
  async confirmEmailChange(token: string): Promise<ApiResponse<unknown>> {
    return request('/api/frontend/confirm-email-change', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  /**
   * List users for the authenticated admin's site.
   * Calls the Next.js API route which uses byteforge-aegis-client-js.
   */
  async adminListUsers(authToken: string): Promise<ApiResponse<User[]>> {
    return request<User[]>('/api/frontend/admin/users', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
  },

  /**
   * List all configured sites (aegis super-admin only).
   * Requires the caller's auth token for authorization.
   */
  async aegisAdminListSites(authToken: string): Promise<ApiResponse<Site[]>> {
    return request<Site[]>('/api/frontend/aegis-admin/sites', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
  },

  /**
   * Create a user for a specific site (aegis super-admin only).
   * Uses the MASTER_API_KEY server-side to register users on any site.
   */
  async aegisAdminCreateUser(siteId: number, email: string, role: string, authToken: string): Promise<ApiResponse<User>> {
    return request<User>(`/api/frontend/aegis-admin/sites/${siteId}/users`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
  },

  /**
   * Create a user for the tenant admin's own site.
   * Uses the admin's Bearer token — site is derived from the token on the backend.
   */
  async adminCreateUser(email: string, role: string, authToken: string): Promise<ApiResponse<User>> {
    return request<User>('/api/frontend/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
  },

  /**
   * List all users for a specific site (aegis super-admin only).
   * Requires the caller's auth token for authorization.
   */
  async aegisAdminListUsersBySite(siteId: number, authToken: string): Promise<ApiResponse<User[]>> {
    return request<User[]>(`/api/frontend/aegis-admin/sites/${siteId}/users`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
  },

  /**
   * Get the Aegis admin site info (resolved server-side from AEGIS_ADMIN_DOMAIN)
   */
  async aegisAdminGetSite(): Promise<ApiResponse<Site>> {
    return request<Site>('/api/frontend/aegis-admin/site');
  },

  /**
   * Login to the Aegis admin interface (site_id resolved server-side)
   */
  async aegisAdminLogin(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return request<LoginResponse>('/api/frontend/aegis-admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Create a new site (aegis super-admin only).
   */
  async aegisAdminCreateSite(siteData: CreateSiteRequest, authToken: string): Promise<ApiResponse<Site>> {
    return request<Site>('/api/frontend/aegis-admin/sites', {
      method: 'POST',
      body: JSON.stringify(siteData),
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
  },

  /**
   * Get a site by ID (aegis super-admin only).
   */
  async aegisAdminGetSiteById(siteId: number, authToken: string): Promise<ApiResponse<Site>> {
    return request<Site>(`/api/frontend/aegis-admin/sites/${siteId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
  },

  /**
   * Update a site (aegis super-admin only).
   */
  async aegisAdminUpdateSite(siteId: number, updates: UpdateSiteRequest, authToken: string): Promise<ApiResponse<Site>> {
    return request<Site>(`/api/frontend/aegis-admin/sites/${siteId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
  },

  /**
   * Resend verification email for an unverified user (aegis super-admin only).
   */
  async aegisAdminResendVerification(userId: number, authToken: string): Promise<ApiResponse<{ message: string }>> {
    return request<{ message: string }>(`/api/frontend/aegis-admin/users/${userId}/resend-verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
  },
};

export type { Site, User, LoginResponse, ApiResponse, CreateSiteRequest, UpdateSiteRequest };
