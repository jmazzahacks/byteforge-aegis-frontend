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

  const [showSecret, setShowSecret] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [showTenantKey, setShowTenantKey] = useState(false);
  const [copiedTenantKey, setCopiedTenantKey] = useState(false);
  const [confirmRegenTenantKey, setConfirmRegenTenantKey] = useState(false);
  const [isRegeneratingTenantKey, setIsRegeneratingTenantKey] = useState(false);

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

  async function handleRegenerateSecret() {
    if (!confirmRegen) {
      setConfirmRegen(true);
      setTimeout(() => setConfirmRegen(false), 4000);
      return;
    }

    const token = localStorage.getItem('aegis_admin_token');
    if (!token) return;

    setIsRegenerating(true);
    setConfirmRegen(false);
    setError(null);
    setSuccess(null);

    const result = await browserClient.aegisAdminUpdateSite(
      siteId,
      { regenerate_webhook_secret: true },
      token,
    );

    if (result.success) {
      setOriginalSite(result.data);
      setShowSecret(true);
      setSuccess(t('regenerateSecretSuccess'));
    } else {
      setError(result.error || t('regenerateSecretError'));
    }

    setIsRegenerating(false);
  }

  async function handleCopySecret() {
    if (!originalSite?.webhook_secret) return;
    try {
      await navigator.clipboard.writeText(originalSite.webhook_secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } catch {
      // Clipboard rejected (rare — focus/permission). Absence of checkmark is the signal.
    }
  }

  async function handleRegenerateTenantKey() {
    if (!confirmRegenTenantKey) {
      setConfirmRegenTenantKey(true);
      setTimeout(() => setConfirmRegenTenantKey(false), 4000);
      return;
    }

    const token = localStorage.getItem('aegis_admin_token');
    if (!token) return;

    setIsRegeneratingTenantKey(true);
    setConfirmRegenTenantKey(false);
    setError(null);
    setSuccess(null);

    const result = await browserClient.aegisAdminUpdateSite(
      siteId,
      { regenerate_tenant_api_key: true },
      token,
    );

    if (result.success) {
      setOriginalSite(result.data);
      setShowTenantKey(true);
      setSuccess(t('regenerateTenantKeySuccess'));
    } else {
      setError(result.error || t('regenerateTenantKeyError'));
    }

    setIsRegeneratingTenantKey(false);
  }

  async function handleCopyTenantKey() {
    if (!originalSite?.tenant_api_key) return;
    try {
      await navigator.clipboard.writeText(originalSite.tenant_api_key);
      setCopiedTenantKey(true);
      setTimeout(() => setCopiedTenantKey(false), 2000);
    } catch {
      // Clipboard rejected (rare — focus/permission). Absence of checkmark is the signal.
    }
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

        {/* Section header with site name */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-px" style={{ backgroundColor: 'var(--ember-glow)', opacity: 0.6 }} />
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="var(--ember-glow)" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-2xl font-semibold tracking-wide uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
              {t('editSite')}
            </h2>
          </div>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--forge-iron)' }} />
        </div>
        {originalSite && (
          <p className="ml-16 mb-8 text-sm" style={{ color: 'var(--ember-glow)' }}>
            {originalSite.name} &mdash; {originalSite.domain}
          </p>
        )}

        {/* Success message */}
        {success && (
          <div className="mb-6 px-4 py-3 rounded-lg border"
               style={{
                 backgroundColor: 'rgba(34, 197, 94, 0.1)',
                 borderColor: 'var(--success)',
                 color: 'var(--success)'
               }}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  Site Configuration
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

                {/* Webhook Secret — read-only, only shown when a secret exists */}
                {originalSite?.webhook_secret && (
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                           style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                      {t('siteFormLabels.webhookSecret')}
                    </label>
                    <div className="flex items-stretch gap-2">
                      <input
                        type={showSecret ? 'text' : 'password'}
                        readOnly
                        value={originalSite.webhook_secret}
                        className="input-forge block flex-1 px-4 py-3 rounded-lg text-sm font-mono"
                        style={{ color: 'var(--forge-light)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        title={showSecret ? t('hideSecret') : t('showSecret')}
                        className="px-3 rounded-lg transition-colors duration-200"
                        style={{
                          backgroundColor: 'var(--forge-steel)',
                          border: '1px solid var(--forge-iron)',
                          color: 'var(--forge-silver)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ember-glow)'; e.currentTarget.style.color = 'var(--ember-glow)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--forge-iron)'; e.currentTarget.style.color = 'var(--forge-silver)'; }}
                      >
                        {showSecret ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        title={t('copySecret')}
                        className="px-3 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
                        style={{
                          backgroundColor: 'var(--forge-steel)',
                          border: copiedSecret ? '1px solid var(--success)' : '1px solid var(--forge-iron)',
                          color: copiedSecret ? 'var(--success)' : 'var(--forge-silver)',
                        }}
                        onMouseEnter={(e) => { if (!copiedSecret) { e.currentTarget.style.borderColor = 'var(--ember-glow)'; e.currentTarget.style.color = 'var(--ember-glow)'; } }}
                        onMouseLeave={(e) => { if (!copiedSecret) { e.currentTarget.style.borderColor = 'var(--forge-iron)'; e.currentTarget.style.color = 'var(--forge-silver)'; } }}
                      >
                        {copiedSecret ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleRegenerateSecret}
                        disabled={isRegenerating}
                        className="px-4 rounded-lg transition-colors duration-200 text-xs font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          fontFamily: 'var(--font-display)',
                          backgroundColor: confirmRegen ? 'rgba(239, 68, 68, 0.1)' : 'var(--forge-steel)',
                          border: confirmRegen ? '1px solid var(--error)' : '1px solid var(--forge-iron)',
                          color: confirmRegen ? 'var(--error)' : 'var(--forge-silver)',
                        }}
                        onMouseEnter={(e) => { if (!confirmRegen && !isRegenerating) { e.currentTarget.style.borderColor = 'var(--ember-glow)'; e.currentTarget.style.color = 'var(--ember-glow)'; } }}
                        onMouseLeave={(e) => { if (!confirmRegen && !isRegenerating) { e.currentTarget.style.borderColor = 'var(--forge-iron)'; e.currentTarget.style.color = 'var(--forge-silver)'; } }}
                      >
                        {isRegenerating
                          ? t('regeneratingSecret')
                          : confirmRegen
                          ? t('confirmRegenerate')
                          : t('regenerateSecret')}
                      </button>
                    </div>
                    <p className="mt-2 text-xs" style={{ color: 'var(--forge-silver)' }}>
                      {t('webhookSecretHint')}
                    </p>
                  </div>
                )}

                {/* Tenant API Key — required server-side secret used by tenant backends */}
                {originalSite?.tenant_api_key && (
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                           style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-silver)' }}>
                      {t('siteFormLabels.tenantApiKey')}
                    </label>
                    <div className="flex items-stretch gap-2">
                      <input
                        type={showTenantKey ? 'text' : 'password'}
                        readOnly
                        value={originalSite.tenant_api_key}
                        className="input-forge block flex-1 px-4 py-3 rounded-lg text-sm font-mono"
                        style={{ color: 'var(--forge-light)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowTenantKey(!showTenantKey)}
                        title={showTenantKey ? t('hideSecret') : t('showSecret')}
                        className="px-3 rounded-lg transition-colors duration-200"
                        style={{
                          backgroundColor: 'var(--forge-steel)',
                          border: '1px solid var(--forge-iron)',
                          color: 'var(--forge-silver)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ember-glow)'; e.currentTarget.style.color = 'var(--ember-glow)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--forge-iron)'; e.currentTarget.style.color = 'var(--forge-silver)'; }}
                      >
                        {showTenantKey ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyTenantKey}
                        title={t('copySecret')}
                        className="px-3 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
                        style={{
                          backgroundColor: 'var(--forge-steel)',
                          border: copiedTenantKey ? '1px solid var(--success)' : '1px solid var(--forge-iron)',
                          color: copiedTenantKey ? 'var(--success)' : 'var(--forge-silver)',
                        }}
                        onMouseEnter={(e) => { if (!copiedTenantKey) { e.currentTarget.style.borderColor = 'var(--ember-glow)'; e.currentTarget.style.color = 'var(--ember-glow)'; } }}
                        onMouseLeave={(e) => { if (!copiedTenantKey) { e.currentTarget.style.borderColor = 'var(--forge-iron)'; e.currentTarget.style.color = 'var(--forge-silver)'; } }}
                      >
                        {copiedTenantKey ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleRegenerateTenantKey}
                        disabled={isRegeneratingTenantKey}
                        className="px-4 rounded-lg transition-colors duration-200 text-xs font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          fontFamily: 'var(--font-display)',
                          backgroundColor: confirmRegenTenantKey ? 'rgba(239, 68, 68, 0.1)' : 'var(--forge-steel)',
                          border: confirmRegenTenantKey ? '1px solid var(--error)' : '1px solid var(--forge-iron)',
                          color: confirmRegenTenantKey ? 'var(--error)' : 'var(--forge-silver)',
                        }}
                        onMouseEnter={(e) => { if (!confirmRegenTenantKey && !isRegeneratingTenantKey) { e.currentTarget.style.borderColor = 'var(--ember-glow)'; e.currentTarget.style.color = 'var(--ember-glow)'; } }}
                        onMouseLeave={(e) => { if (!confirmRegenTenantKey && !isRegeneratingTenantKey) { e.currentTarget.style.borderColor = 'var(--forge-iron)'; e.currentTarget.style.color = 'var(--forge-silver)'; } }}
                      >
                        {isRegeneratingTenantKey
                          ? t('regeneratingTenantKey')
                          : confirmRegenTenantKey
                          ? t('confirmRegenerate')
                          : t('regenerateTenantKey')}
                      </button>
                    </div>
                    <p className="mt-2 text-xs" style={{ color: 'var(--forge-silver)' }}>
                      {t('tenantApiKeyHint')}
                    </p>
                  </div>
                )}

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
                  onClick={() => router.push(`/aegis-admin/sites/${siteId}`)}
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
                  disabled={isSaving}
                  className="btn-forge px-8 py-2.5 text-sm font-semibold uppercase tracking-wider rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {isSaving ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('savingSiteSettings')}
                    </span>
                  ) : (
                    t('saveSiteSettings')
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
