'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { browserClient } from '@/lib/browserClient';
import type { Site } from 'byteforge-aegis-client-js';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AegisAdminDashboard() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('AegisAdmin');
  const tCommon = useTranslations('Common');
  const [isLoading, setIsLoading] = useState(true);
  const [sites, setSites] = useState<Site[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('aegis_admin_token');

    if (!token) {
      router.push('/aegis-admin/login');
      return;
    }

    fetchSites(token);
  }, [router]);

  async function fetchSites(token: string) {
    setIsLoading(true);
    setError(null);

    const result = await browserClient.aegisAdminListSites(token);

    if (result.success) {
      setSites(result.data);
    } else {
      setError(result.error || t('failedToLoadSites'));
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center forge-texture"
           style={{ backgroundColor: 'var(--forge-black)' }}>
        <div className="inline-flex items-center gap-3">
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-glow)' }} />
          <p style={{ color: 'var(--forge-silver)', fontFamily: 'var(--font-body)' }}>
            {t('loadingDashboard')}
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
                  {t('siteManagement')}
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
        {/* Section header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-px" style={{ backgroundColor: 'var(--ember-glow)', opacity: 0.6 }} />
          <h2 className="text-2xl font-semibold tracking-wide uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
            {t('configuredSites')}
          </h2>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--forge-iron)' }} />
          <span className="text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--forge-steel)',
                  color: 'var(--ember-glow)',
                  border: '1px solid var(--forge-iron)'
                }}>
            {sites.length} total
          </span>
        </div>

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

        {/* Sites table */}
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
                  {t('tableHeaders.siteName')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                  {t('tableHeaders.domain')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                  {t('tableHeaders.selfRegistration')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                  {t('tableHeaders.created')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site, index) => (
                <tr key={site.id}
                    className="transition-colors duration-150"
                    style={{
                      borderTop: '1px solid var(--forge-iron)',
                      backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(30, 30, 34, 0.5)'
                    }}>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium" style={{ color: 'var(--forge-light)' }}>
                      {site.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: 'var(--forge-silver)' }}>
                      {site.domain}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full"
                          style={{
                            fontFamily: 'var(--font-display)',
                            backgroundColor: site.allow_self_registration ? 'rgba(34, 197, 94, 0.15)' : 'var(--forge-steel)',
                            color: site.allow_self_registration ? 'var(--success)' : 'var(--forge-silver)',
                            border: `1px solid ${site.allow_self_registration ? 'rgba(34, 197, 94, 0.3)' : 'var(--forge-iron)'}`
                          }}>
                      <span className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: site.allow_self_registration ? 'var(--success)' : 'var(--forge-iron)' }} />
                      {site.allow_self_registration ? t('enabled') : t('disabled')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: 'var(--forge-silver)' }}>
                      {formatDate(site.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
              {sites.length === 0 && !error && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-12 h-12" style={{ color: 'var(--forge-iron)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                              d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                      </svg>
                      <p style={{ color: 'var(--forge-silver)' }}>{t('noSitesFound')}</p>
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
