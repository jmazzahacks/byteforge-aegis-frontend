'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { browserClient } from '@/lib/browserClient';
import type { CreateSiteRequest } from 'byteforge-aegis-client-js';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function CreateSitePage() {
  const router = useRouter();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('aegis_admin_token');

    if (!token) {
      router.push('/aegis-admin/login');
      return;
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('aegis_admin_token');
    localStorage.removeItem('aegis_admin_refresh_token');
    localStorage.removeItem('aegis_admin_user_id');
    router.push('/aegis-admin/login');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('aegis_admin_token');
    if (!token) return;

    setIsSubmitting(true);
    setError(null);

    const formData: CreateSiteRequest = {
      name,
      domain,
      frontend_url: frontendUrl,
      email_from: emailFrom,
      email_from_name: emailFromName,
      allow_self_registration: allowSelfRegistration,
    };

    if (verificationRedirectUrl.trim()) {
      formData.verification_redirect_url = verificationRedirectUrl.trim();
    }

    if (webhookUrl.trim()) {
      formData.webhook_url = webhookUrl.trim();
    }

    const result = await browserClient.aegisAdminCreateSite(formData, token);

    if (result.success) {
      router.push('/aegis-admin/dashboard');
    } else {
      setError(result.error || t('createSiteError'));
    }

    setIsSubmitting(false);
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
      <main className="relative z-10 max-w-4xl mx-auto py-8 px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => router.push('/aegis-admin/dashboard')}
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
          {t('backToDashboard')}
        </button>

        {/* Section header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-px" style={{ backgroundColor: 'var(--ember-glow)', opacity: 0.6 }} />
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="var(--ember-glow)" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <h2 className="text-2xl font-semibold tracking-wide uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
              {t('createSite')}
            </h2>
          </div>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--forge-iron)' }} />
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
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2"
                   style={{ borderColor: 'var(--ember-glow)', opacity: 0.5 }} />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2"
                   style={{ borderColor: 'var(--ember-glow)', opacity: 0.5 }} />
            </div>

            <div className="p-8 lg:p-10">
              {/* Required fields section label */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--ember-glow)' }}>
                  Required Configuration
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--forge-iron)' }} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                         style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                    {t('siteFormLabels.name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Application"
                    className="input-forge block w-full px-4 py-3 rounded-lg text-sm"
                    style={{ color: 'var(--forge-light)' }}
                  />
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                         style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                    {t('siteFormLabels.domain')}
                  </label>
                  <input
                    type="text"
                    required
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="app.example.com"
                    className="input-forge block w-full px-4 py-3 rounded-lg text-sm"
                    style={{ color: 'var(--forge-light)' }}
                  />
                </div>

                {/* Frontend URL */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                         style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                    {t('siteFormLabels.frontendUrl')}
                  </label>
                  <input
                    type="url"
                    required
                    value={frontendUrl}
                    onChange={(e) => setFrontendUrl(e.target.value)}
                    placeholder="https://app.example.com"
                    className="input-forge block w-full px-4 py-3 rounded-lg text-sm"
                    style={{ color: 'var(--forge-light)' }}
                  />
                </div>

                {/* Email From */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                         style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                    {t('siteFormLabels.emailFrom')}
                  </label>
                  <input
                    type="email"
                    required
                    value={emailFrom}
                    onChange={(e) => setEmailFrom(e.target.value)}
                    placeholder="noreply@example.com"
                    className="input-forge block w-full px-4 py-3 rounded-lg text-sm"
                    style={{ color: 'var(--forge-light)' }}
                  />
                </div>

                {/* Email From Name */}
                <div className="lg:col-span-2 lg:max-w-[calc(50%-1rem)]">
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                         style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                    {t('siteFormLabels.emailFromName')}
                  </label>
                  <input
                    type="text"
                    required
                    value={emailFromName}
                    onChange={(e) => setEmailFromName(e.target.value)}
                    placeholder="My Application"
                    className="input-forge block w-full px-4 py-3 rounded-lg text-sm"
                    style={{ color: 'var(--forge-light)' }}
                  />
                </div>
              </div>

              {/* Optional fields section divider */}
              <div className="flex items-center gap-3 mt-10 mb-6">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                  Optional Configuration
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--forge-iron)' }} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
                {/* Verification Redirect URL */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                         style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                    {t('siteFormLabels.verificationRedirectUrl')}
                  </label>
                  <input
                    type="url"
                    value={verificationRedirectUrl}
                    onChange={(e) => setVerificationRedirectUrl(e.target.value)}
                    placeholder="https://app.example.com/verified"
                    className="input-forge block w-full px-4 py-3 rounded-lg text-sm"
                    style={{ color: 'var(--forge-light)' }}
                  />
                </div>

                {/* Webhook URL */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                         style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                    {t('siteFormLabels.webhookUrl')}
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://api.example.com/webhooks/aegis"
                    className="input-forge block w-full px-4 py-3 rounded-lg text-sm"
                    style={{ color: 'var(--forge-light)' }}
                  />
                </div>

                {/* Allow Self Registration */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium uppercase tracking-wider mb-3"
                         style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                    {t('siteFormLabels.allowSelfRegistration')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setAllowSelfRegistration(!allowSelfRegistration)}
                    className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-300 focus:outline-none"
                    style={{
                      backgroundColor: allowSelfRegistration ? 'var(--success)' : 'var(--forge-iron)',
                      boxShadow: allowSelfRegistration ? '0 0 12px rgba(34, 197, 94, 0.3)' : 'none',
                    }}
                  >
                    <span
                      className="pointer-events-none inline-block h-5 w-5 rounded-full shadow-lg transform transition-transform duration-300"
                      style={{
                        backgroundColor: 'var(--forge-light)',
                        marginTop: '4px',
                        marginLeft: allowSelfRegistration ? '26px' : '4px',
                      }}
                    />
                  </button>
                  <span className="ml-3 text-xs font-semibold uppercase tracking-wider"
                        style={{
                          fontFamily: 'var(--font-display)',
                          color: allowSelfRegistration ? 'var(--success)' : 'var(--forge-silver)',
                        }}>
                    {allowSelfRegistration ? t('enabled') : t('disabled')}
                  </span>
                </div>
              </div>

              {/* Action bar */}
              <div className="mt-10 pt-6 flex items-center justify-between"
                   style={{ borderTop: '1px solid var(--forge-iron)' }}>
                <button
                  type="button"
                  onClick={() => router.push('/aegis-admin/dashboard')}
                  className="px-6 py-2.5 text-sm uppercase tracking-wider rounded-lg transition-all duration-200"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--forge-silver)',
                    backgroundColor: 'var(--forge-steel)',
                    border: '1px solid var(--forge-iron)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--forge-silver)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--forge-iron)'; }}
                >
                  {t('addUserCancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-forge px-8 py-2.5 text-sm font-semibold uppercase tracking-wider rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('creatingSite')}
                    </span>
                  ) : (
                    t('createSiteSubmit')
                  )}
                </button>
              </div>
            </div>

            {/* Bottom corner accents */}
            <div className="relative h-0">
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2"
                   style={{ borderColor: 'var(--ember-glow)', opacity: 0.5 }} />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2"
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
