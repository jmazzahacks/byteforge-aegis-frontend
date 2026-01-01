'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AuthCard from '@/components/AuthCard';
import StatusMessage from '@/components/StatusMessage';

type PageStatus = 'loading' | 'password_required' | 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const t = useTranslations('VerifyEmail');
  const [status, setStatus] = useState<PageStatus>('loading');
  const [message, setMessage] = useState(t('verifying'));
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const token = searchParams.get('token');

  // Check token status on load
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage(t('invalidLink'));
        return;
      }

      try {
        const response = await fetch('/api/check-verification-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setEmail(data.email);
          if (data.password_required) {
            setStatus('password_required');
            setMessage('');
          } else {
            // Auto-verify for self-registered users
            await verifyEmail();
          }
        } else {
          setStatus('error');
          setMessage(data.error || t('failed'));
        }
      } catch {
        setStatus('error');
        setMessage(t('networkError'));
      }
    };

    checkToken();
  }, [token]);

  const verifyEmail = async (userPassword?: string) => {
    setStatus('verifying');
    setMessage(t('verifying'));

    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: userPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(t('success'));
        if (data.redirect_url) {
          setRedirectUrl(data.redirect_url);
        }
      } else {
        setStatus('error');
        setMessage(data.error || t('failed'));
      }
    } catch {
      setStatus('error');
      setMessage(t('networkError'));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (password.length < 8) {
      setPasswordError(t('passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError(t('passwordsDoNotMatch'));
      return;
    }

    await verifyEmail(password);
  };

  // Countdown and redirect effect
  useEffect(() => {
    if (status !== 'success' || !redirectUrl) return;

    if (countdown <= 0) {
      window.location.href = redirectUrl;
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [status, redirectUrl, countdown]);

  const statusForMessage = status === 'password_required' ? 'loading' :
                           status === 'verifying' ? 'loading' : status;

  return (
    <AuthCard>
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-6 tracking-wide"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
          {status === 'password_required' ? t('setPasswordTitle') : t('title')}
        </h2>

        {status === 'password_required' && (
          <div className="text-left">
            <p className="text-sm mb-4 text-center" style={{ color: 'var(--forge-silver)' }}>
              {t('setPasswordDescription', { email })}
            </p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm mb-2"
                  style={{ color: 'var(--forge-silver)' }}
                >
                  {t('password')}
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--forge-steel)',
                    color: 'var(--forge-light)',
                    border: '1px solid var(--forge-iron)',
                  }}
                  required
                  minLength={8}
                  autoFocus
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm mb-2"
                  style={{ color: 'var(--forge-silver)' }}
                >
                  {t('confirmPassword')}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--forge-steel)',
                    color: 'var(--forge-light)',
                    border: '1px solid var(--forge-iron)',
                  }}
                  required
                  minLength={8}
                />
              </div>
              {passwordError && (
                <p className="text-sm" style={{ color: 'var(--ember-glow)' }}>
                  {passwordError}
                </p>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--ember-glow)',
                  color: 'var(--forge-black)',
                }}
              >
                {t('setPasswordButton')}
              </button>
            </form>
          </div>
        )}

        {(status === 'loading' || status === 'verifying' || status === 'success' || status === 'error') && (
          <StatusMessage type={statusForMessage} message={message} />
        )}

        {status === 'success' && redirectUrl && (
          <div className="mt-6 space-y-4">
            <p className="text-sm" style={{ color: 'var(--forge-silver)' }}>
              {t('redirectingIn', { seconds: countdown })}
            </p>
            <a
              href={redirectUrl}
              className="inline-block px-6 py-2 text-sm font-medium rounded-lg transition-all"
              style={{
                backgroundColor: 'var(--forge-steel)',
                color: 'var(--forge-light)',
                border: '1px solid var(--forge-iron)'
              }}
            >
              {t('continueNow')}
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6">
            <p className="text-sm" style={{ color: 'var(--forge-silver)' }}>
              {t('requestNewEmail')}
            </p>
          </div>
        )}
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  );
}
