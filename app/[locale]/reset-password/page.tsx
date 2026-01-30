'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AuthCard from '@/components/AuthCard';
import StatusMessage from '@/components/StatusMessage';
import { getCustomizationFromQuery } from '@/utils/customization';

type ResetStatus = 'idle' | 'loading' | 'success' | 'error';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const t = useTranslations('ResetPassword');
  const tCommon = useTranslations('Common');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<ResetStatus>('idle');
  const [message, setMessage] = useState('');

  const customization = getCustomizationFromQuery(searchParams);
  const token = searchParams.get('token');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      setStatus('error');
      setMessage(t('invalidLink'));
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage(t('passwordsDoNotMatch'));
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setMessage(t('passwordTooShort'));
      return;
    }

    setStatus('loading');
    setMessage(t('resettingPassword'));

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(t('success'));
        setPassword('');
        setConfirmPassword('');
      } else {
        setStatus('error');
        setMessage(data.error || t('failed'));
      }
    } catch {
      setStatus('error');
      setMessage(t('networkError'));
    }
  };

  if (!token) {
    return (
      <AuthCard customization={customization}>
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-6 tracking-wide"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
            {t('title')}
          </h2>
          <StatusMessage type="error" message={t('invalidLink')} />
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard customization={customization}>
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-center tracking-wide"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
          {t('formTitle')}
        </h2>

        {status !== 'idle' && status !== 'loading' && (
          <div className="mb-4">
            <StatusMessage type={status} message={message} />
          </div>
        )}

        {status !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password"
                     className="block text-xs font-medium uppercase tracking-wider mb-2"
                     style={{ color: 'var(--forge-silver)' }}>
                {t('newPasswordLabel')}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-forge block w-full px-4 py-3 rounded-lg"
                style={{ color: 'var(--forge-light)' }}
                placeholder={t('newPasswordPlaceholder')}
                minLength={8}
                disabled={status === 'loading'}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword"
                     className="block text-xs font-medium uppercase tracking-wider mb-2"
                     style={{ color: 'var(--forge-silver)' }}>
                {t('confirmPasswordLabel')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-forge block w-full px-4 py-3 rounded-lg"
                style={{ color: 'var(--forge-light)' }}
                placeholder={t('confirmPasswordPlaceholder')}
                minLength={8}
                disabled={status === 'loading'}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-forge w-full py-3.5 px-4 text-white font-semibold rounded-lg uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {status === 'loading' ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('resetting')}
                </span>
              ) : (
                t('resetButton')
              )}
            </button>
          </form>
        )}

        {status === 'success' && (
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--forge-silver)' }}>
              {t('successMessage')}
            </p>
          </div>
        )}

        {/* Decorative bottom element */}
        <div className="flex items-center justify-center gap-2 mt-8 pt-6"
             style={{ borderTop: '1px solid var(--forge-iron)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--ember-dim)' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--ember-glow)' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--ember-dim)' }} />
        </div>
      </div>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  const tCommon = useTranslations('Common');

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
           style={{ backgroundColor: 'var(--forge-black)' }}>
        <div className="inline-flex items-center gap-3">
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-glow)' }} />
          <p style={{ color: 'var(--forge-silver)', fontFamily: 'var(--font-body)' }}>
            {tCommon('loading')}
          </p>
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-glow)', animationDelay: '1s' }} />
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
