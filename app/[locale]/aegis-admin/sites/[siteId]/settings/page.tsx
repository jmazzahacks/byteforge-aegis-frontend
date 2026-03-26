'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { browserClient } from '@/lib/browserClient';
import type { Site, UpdateSiteRequest } from 'byteforge-aegis-client-js';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function EditSitePage() {
  const router = useRouter();
  const params = useParams();
  const siteId = Number(params.siteId);
  const t = useTranslations('AegisAdmin');
  const tCommon = useTranslations('Common');

  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [frontendUrl, setFrontendUrl] = useState('');
  const [emailFrom, setEmailFrom] = useState('');
  const [emailFromName, setEmailFromName] = useState('');
  const [verificationRedirectUrl, setVerificationRedirectUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [allowSelfRegistration, setAllowSelfRegistration] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [originalSite, setOriginalSite] = useState<Site | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('aegis_admin_token');

    if (!token) {
      router.push('/aegis-admin/login');
      return;
    }

    fetchSite(token);
  }, [router, siteId]);

  async function fetchSite(token: string) {
    setIsLoading(true);
    setError(null);

    const result = await browserClient.aegisAdminGetSiteById(siteId, token);

    if (result.success) {
      const site = result.data;
      setOriginalSite(site);
      setName(site.name);
      setDomain(site.domain);
      setFrontendUrl(site.frontend_url);
      setEmailFrom(site.email_from);
      setEmailFromName(site.email_from_name);
      setVerificationRedirectUrl(site.verification_redirect_url || '');
      setWebhookUrl(site.webhook_url || '');
      setAllowSelfRegistration(site.allow_self_registration);
    } else {
      setError(result.error || t('saveSiteError'));
    }

    setIsLoading(false);
  }

  function handleLogout() {
    localStorage.removeItem('aegis_admin_token');
    localStorage.removeItem('aegis_admin_refresh_token');
    localStorage.removeItem('aegis_admin_user_id');
    router.push('/aegis-admin/login');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('aegis_admin_token');
    if (!token || !originalSite) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const updates: UpdateSiteRequest = {};

    if (name !== originalSite.name) {
      updates.name = name;
    }
    if (domain !== originalSite.domain) {
      updates.domain = domain;
    }
    if (frontendUrl !== originalSite.frontend_url) {
      updates.frontend_url = frontendUrl;
    }
    if (emailFrom !== originalSite.email_from) {
      updates.email_from = emailFrom;
    }
    if (emailFromName !== originalSite.email_from_name) {
      updates.email_from_name = emailFromName;
    }
    if (verificationRedirectUrl.trim() !== (originalSite.verification_redirect_url || '')) {
      updates.verification_redirect_url = verificationRedirectUrl.trim() || undefined;
    }
    if (webhookUrl.trim() !== (originalSite.webhook_url || '')) {
      updates.webhook_url = webhookUrl.trim() || null;
    }
    if (allowSelfRegistration !== originalSite.allow_self_registration) {
      updates.allow_self_registration = allowSelfRegistration;
    }

    if (Object.keys(updates).length === 0) {
      setSuccess(t('saveSiteSuccess'));
      setIsSaving(false);
      return;
    }

    const result = await browserClient.aegisAdminUpdateSite(siteId, updates, token);

    if (result.success) {
      setOriginalSite(result.data);
      setSuccess(t('saveSiteSuccess'));
    } else {
      setError(result.error || t('saveSiteError'));
    }

    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center forge-texture"
           style={{ backgroundColor: 'var(--forge-black)' }}>
        <div className="inline-flex items-center gap-3">
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-glow)' }} />
          <p style={{ color: 'var(--forge-silver)', fontFamily: 'var(--font-body)' }}>
            {t('loadingSiteSettings')}
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
        {/* Back button */}
        <button
          onClick={() => router.push(`/aegis-admin/sites/${siteId}`)}
          className="inline-flex items-center gap-2 mb-6 text-sm uppercase tracking-wider transition-colors duration-200"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--forge-silver)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ember-glow)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--forge-silver)'; }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('backToSite')}
        </button>

        {/* Section header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-px" style={{ backgroundColor: 'var(--ember-glow)', opacity: 0.6 }} />
          <h2 className="text-2xl font-semibold tracking-wide uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
            {t('editSite')}
          </h2>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--forge-iron)' }} />
        </div>

        {/* Success message */}
        {success && (
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
              {success}
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

        {/* Form card */}
        <form onSubmit={handleSubmit}>
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

            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column - Required fields */}
                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2"
                           style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                      {t('siteFormLabels.name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors duration-200"
                      style={{
                        backgroundColor: 'var(--forge-steel)',
                        border: '1px solid var(--forge-iron)',
                        color: 'var(--forge-light)',
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                  </div>

                  {/* Domain */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2"
                           style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                      {t('siteFormLabels.domain')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors duration-200"
                      style={{
                        backgroundColor: 'var(--forge-steel)',
                        border: '1px solid var(--forge-iron)',
                        color: 'var(--forge-light)',
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                  </div>

                  {/* Frontend URL */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2"
                           style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                      {t('siteFormLabels.frontendUrl')} *
                    </label>
                    <input
                      type="url"
                      required
                      value={frontendUrl}
                      onChange={(e) => setFrontendUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors duration-200"
                      style={{
                        backgroundColor: 'var(--forge-steel)',
                        border: '1px solid var(--forge-iron)',
                        color: 'var(--forge-light)',
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                  </div>

                  {/* Email From */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2"
                           style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                      {t('siteFormLabels.emailFrom')} *
                    </label>
                    <input
                      type="email"
                      required
                      value={emailFrom}
                      onChange={(e) => setEmailFrom(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors duration-200"
                      style={{
                        backgroundColor: 'var(--forge-steel)',
                        border: '1px solid var(--forge-iron)',
                        color: 'var(--forge-light)',
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                  </div>

                  {/* Email From Name */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2"
                           style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                      {t('siteFormLabels.emailFromName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={emailFromName}
                      onChange={(e) => setEmailFromName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors duration-200"
                      style={{
                        backgroundColor: 'var(--forge-steel)',
                        border: '1px solid var(--forge-iron)',
                        color: 'var(--forge-light)',
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                  </div>
                </div>

                {/* Right column - Optional fields */}
                <div className="space-y-5">
                  {/* Verification Redirect URL */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2"
                           style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                      {t('siteFormLabels.verificationRedirectUrl')}
                    </label>
                    <input
                      type="url"
                      value={verificationRedirectUrl}
                      onChange={(e) => setVerificationRedirectUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors duration-200"
                      style={{
                        backgroundColor: 'var(--forge-steel)',
                        border: '1px solid var(--forge-iron)',
                        color: 'var(--forge-light)',
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                  </div>

                  {/* Webhook URL */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2"
                           style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                      {t('siteFormLabels.webhookUrl')}
                    </label>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors duration-200"
                      style={{
                        backgroundColor: 'var(--forge-steel)',
                        border: '1px solid var(--forge-iron)',
                        color: 'var(--forge-light)',
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                  </div>

                  {/* Allow Self Registration */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2"
                           style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                      {t('siteFormLabels.allowSelfRegistration')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setAllowSelfRegistration(!allowSelfRegistration)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer"
                      style={{
                        fontFamily: 'var(--font-display)',
                        backgroundColor: allowSelfRegistration ? 'rgba(34, 197, 94, 0.15)' : 'var(--forge-steel)',
                        color: allowSelfRegistration ? 'var(--success)' : 'var(--forge-silver)',
                        border: `1px solid ${allowSelfRegistration ? 'rgba(34, 197, 94, 0.3)' : 'var(--forge-iron)'}`,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: allowSelfRegistration ? 'var(--success)' : 'var(--forge-iron)' }} />
                      {allowSelfRegistration ? t('enabled') : t('disabled')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-2.5 text-sm font-semibold uppercase tracking-wider rounded-lg transition-all duration-200"
                  style={{
                    fontFamily: 'var(--font-display)',
                    backgroundColor: isSaving ? 'var(--ember-dim)' : 'var(--ember-glow)',
                    color: 'var(--forge-black)',
                    border: '1px solid var(--ember-glow)',
                    opacity: isSaving ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.backgroundColor = 'var(--ember-bright)'; }}
                  onMouseLeave={(e) => { if (!isSaving) e.currentTarget.style.backgroundColor = 'var(--ember-glow)'; }}
                >
                  {isSaving ? t('savingSiteSettings') : t('saveSiteSettings')}
                </button>
              </div>
            </div>

            {/* Bottom corner accents */}
            <div className="relative h-0">
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2"
                   style={{ borderColor: 'var(--ember-glow)', opacity: 0.5 }} />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2"
                   style={{ borderColor: 'var(--ember-glow)', opacity: 0.5 }} />
            </div>
          </div>
        </form>

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
