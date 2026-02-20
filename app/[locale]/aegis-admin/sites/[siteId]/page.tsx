'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { browserClient } from '@/lib/browserClient';
import type { User } from 'byteforge-aegis-client-js';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function SiteUsersPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const siteId = Number(params.siteId);
  const t = useTranslations('AegisAdmin');
  const tCommon = useTranslations('Common');
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('aegis_admin_token');

    if (!token) {
      router.push('/aegis-admin/login');
      return;
    }

    fetchUsers(token);
  }, [router, siteId]);

  async function fetchUsers(token: string) {
    setIsLoading(true);
    setError(null);

    const result = await browserClient.aegisAdminListUsersBySite(siteId, token);

    if (result.success) {
      setUsers(result.data);
    } else {
      setError(result.error || t('failedToLoadUsers'));
    }

    setIsLoading(false);
  }

  const handleLogout = () => {
    localStorage.removeItem('aegis_admin_token');
    localStorage.removeItem('aegis_admin_refresh_token');
    localStorage.removeItem('aegis_admin_user_id');
    router.push('/aegis-admin/login');
  };

  function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('aegis_admin_token');
    if (!token) return;

    setIsCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    const result = await browserClient.aegisAdminCreateUser(siteId, newEmail, newRole, token);

    if (result.success) {
      setCreateSuccess(t('addUserSuccess'));
      setNewEmail('');
      setNewRole('user');
      setShowAddForm(false);
      fetchUsers(token);
    } else {
      setCreateError(result.error || t('addUserError'));
    }

    setIsCreating(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center forge-texture"
           style={{ backgroundColor: 'var(--forge-black)' }}>
        <div className="inline-flex items-center gap-3">
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-glow)' }} />
          <p style={{ color: 'var(--forge-silver)', fontFamily: 'var(--font-body)' }}>
            {t('loadingUsers')}
          </p>
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-glow)', animationDelay: '1s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen forge-texture relative overflow-hidden"
         style={{ backgroundColor: 'var(--forge-black)' }}>

      {/* Ambient glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
           style={{ background: 'radial-gradient(circle, var(--ember-glow) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
           style={{ background: 'radial-gradient(circle, var(--ember-dim) 0%, transparent 70%)' }} />

      {/* Geometric grid lines */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-16 left-0 right-0 h-px" style={{ backgroundColor: 'var(--forge-iron)' }} />
        <div className="absolute left-16 top-0 bottom-0 w-px" style={{ backgroundColor: 'var(--forge-iron)' }} />
        <div className="absolute right-16 top-0 bottom-0 w-px" style={{ backgroundColor: 'var(--forge-iron)' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b" style={{
        backgroundColor: 'rgba(20, 20, 22, 0.8)',
        borderColor: 'var(--forge-iron)',
        backdropFilter: 'blur(12px)'
      }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              {/* Shield icon */}
              <div className="w-10 h-10 rounded-lg flex items-center justify-center ember-glow"
                   style={{ backgroundColor: 'var(--forge-steel)', border: '1px solid var(--forge-iron)' }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="var(--ember-glow)" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-wide"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
                  {t('dashboardTitle')}
                </h1>
                <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--ember-glow)' }}>
                  {t('userManagement')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm uppercase tracking-wider rounded-lg transition-all duration-200 hover:bg-opacity-80"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--forge-silver)',
                  backgroundColor: 'var(--forge-steel)',
                  border: '1px solid var(--forge-iron)'
                }}
              >
                {tCommon('logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto py-8 px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => router.push('/aegis-admin/dashboard')}
          className="inline-flex items-center gap-2 mb-6 text-sm uppercase tracking-wider transition-colors duration-200"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--forge-silver)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ember-glow)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--forge-silver)'}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('backToDashboard')}
        </button>

        {/* Section header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-px" style={{ backgroundColor: 'var(--ember-glow)', opacity: 0.6 }} />
          <h2 className="text-2xl font-semibold tracking-wide uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
            {t('siteUsers')}
          </h2>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--forge-iron)' }} />
          <span className="text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--forge-steel)',
                  color: 'var(--ember-glow)',
                  border: '1px solid var(--forge-iron)'
                }}>
            {users.length} total
          </span>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setCreateError(null); setCreateSuccess(null); }}
            className="px-4 py-2 text-xs uppercase tracking-wider rounded-lg transition-all duration-200"
            style={{
              fontFamily: 'var(--font-display)',
              color: showAddForm ? 'var(--forge-black)' : 'var(--forge-light)',
              backgroundColor: showAddForm ? 'var(--ember-glow)' : 'var(--forge-steel)',
              border: `1px solid ${showAddForm ? 'var(--ember-glow)' : 'var(--forge-iron)'}`,
            }}
          >
            {showAddForm ? t('addUserCancel') : t('addUser')}
          </button>
        </div>

        {/* Add User Form */}
        {showAddForm && (
          <form onSubmit={handleCreateUser} className="mb-6 p-6 rounded-xl"
                style={{
                  backgroundColor: 'var(--forge-charcoal)',
                  border: '1px solid var(--forge-iron)',
                }}>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs uppercase tracking-wider mb-2"
                       style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                  {t('userTableHeaders.email')}
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors duration-200"
                  style={{
                    backgroundColor: 'var(--forge-steel)',
                    border: '1px solid var(--forge-iron)',
                    color: 'var(--forge-light)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>
              <div className="w-40">
                <label className="block text-xs uppercase tracking-wider mb-2"
                       style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                  {t('roleLabel')}
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--forge-steel)',
                    border: '1px solid var(--forge-iron)',
                    color: 'var(--forge-light)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <option value="user">{t('roleUser')}</option>
                  <option value="admin">{t('roleAdmin')}</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-2.5 text-xs uppercase tracking-wider rounded-lg transition-all duration-200"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--forge-black)',
                  backgroundColor: isCreating ? 'var(--ember-dim)' : 'var(--ember-glow)',
                  border: '1px solid var(--ember-glow)',
                  opacity: isCreating ? 0.7 : 1,
                }}
              >
                {isCreating ? t('creatingUser') : t('addUserSubmit')}
              </button>
            </div>
            {createError && (
              <p className="mt-3 text-sm" style={{ color: 'var(--error)' }}>{createError}</p>
            )}
          </form>
        )}

        {/* Success message */}
        {createSuccess && (
          <div className="mb-6 px-4 py-3 rounded-lg border"
               style={{
                 backgroundColor: 'rgba(34, 197, 94, 0.1)',
                 borderColor: 'var(--success)',
                 color: 'var(--success)'
               }}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {createSuccess}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg border"
               style={{
                 backgroundColor: 'rgba(239, 68, 68, 0.1)',
                 borderColor: 'var(--error)',
                 color: 'var(--error)'
               }}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Users table */}
        <div className="rounded-xl overflow-hidden ember-glow"
             style={{
               backgroundColor: 'var(--forge-charcoal)',
               border: '1px solid var(--forge-iron)'
             }}>

          {/* Corner accents */}
          <div className="relative">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2"
                 style={{ borderColor: 'var(--ember-glow)', opacity: 0.5 }} />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2"
                 style={{ borderColor: 'var(--ember-glow)', opacity: 0.5 }} />
          </div>

          <table className="min-w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--forge-steel)' }}>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                  {t('userTableHeaders.email')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                  {t('userTableHeaders.role')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                  {t('userTableHeaders.status')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                  {t('userTableHeaders.created')}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}
                    className="transition-colors duration-150"
                    style={{
                      borderTop: '1px solid var(--forge-iron)',
                      backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(30, 30, 34, 0.5)'
                    }}>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono" style={{ color: 'var(--forge-silver)' }}>
                      {user.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium" style={{ color: 'var(--forge-light)' }}>
                      {user.email}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full"
                          style={{
                            fontFamily: 'var(--font-display)',
                            backgroundColor: user.role === 'admin' ? 'rgba(255, 107, 53, 0.15)' : 'var(--forge-steel)',
                            color: user.role === 'admin' ? 'var(--ember-glow)' : 'var(--forge-silver)',
                            border: `1px solid ${user.role === 'admin' ? 'rgba(255, 107, 53, 0.3)' : 'var(--forge-iron)'}`
                          }}>
                      {t(`roles.${user.role}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full"
                          style={{
                            fontFamily: 'var(--font-display)',
                            backgroundColor: user.is_verified ? 'rgba(34, 197, 94, 0.15)' : 'var(--forge-steel)',
                            color: user.is_verified ? 'var(--success)' : 'var(--forge-silver)',
                            border: `1px solid ${user.is_verified ? 'rgba(34, 197, 94, 0.3)' : 'var(--forge-iron)'}`
                          }}>
                      <span className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: user.is_verified ? 'var(--success)' : 'var(--forge-iron)' }} />
                      {user.is_verified ? t('verified') : t('pending')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: 'var(--forge-silver)' }}>
                      {formatDate(user.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !error && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-12 h-12" style={{ color: 'var(--forge-iron)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2 2 0 015 19.128c0-1.113.285-2.16.786-3.07m0 0a9.38 9.38 0 014.002-3.974m0 0a9.38 9.38 0 014.002 3.974m-8.004 0A8.963 8.963 0 0112 15c1.657 0 3.222.449 4.558 1.228" />
                      </svg>
                      <p style={{ color: 'var(--forge-silver)' }}>{t('noUsersFound')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Bottom corner accents */}
          <div className="relative h-0">
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2"
                 style={{ borderColor: 'var(--ember-glow)', opacity: 0.5 }} />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2"
                 style={{ borderColor: 'var(--ember-glow)', opacity: 0.5 }} />
          </div>
        </div>

        {/* Footer decoration */}
        <div className="flex items-center justify-center gap-3 mt-12">
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-dim)', animationDelay: '0s' }} />
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-glow)', animationDelay: '0.5s' }} />
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-dim)', animationDelay: '1s' }} />
        </div>
      </main>
    </div>
  );
}
