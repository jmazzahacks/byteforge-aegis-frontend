'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AuthCard from '@/components/AuthCard';
import StatusMessage from '@/components/StatusMessage';

type VerificationStatus = 'loading' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const t = useTranslations('VerifyEmail');
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState(t('verifying'));
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage(t('invalidLink'));
        return;
      }

      try {
        const response = await fetch('/api/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
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

    verifyEmail();
  }, [searchParams, t]);

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

  return (
    <AuthCard>
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-6 tracking-wide"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
          {t('title')}
        </h2>
        <StatusMessage type={status} message={message} />

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
