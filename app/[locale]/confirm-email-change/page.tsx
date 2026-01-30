'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AuthCard from '@/components/AuthCard';
import StatusMessage from '@/components/StatusMessage';
import { getCustomizationFromQuery } from '@/utils/customization';
import { getClientSideAuthClient } from '@/lib/authClient';

type ConfirmationStatus = 'loading' | 'success' | 'error';

function ConfirmEmailChangeContent() {
  const searchParams = useSearchParams();
  const t = useTranslations('ConfirmEmailChange');
  const [status, setStatus] = useState<ConfirmationStatus>('loading');
  const [message, setMessage] = useState(t('confirming'));

  const customization = getCustomizationFromQuery(searchParams);

  useEffect(() => {
    const confirmEmailChange = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage(t('invalidLink'));
        return;
      }

      try {
        const client = getClientSideAuthClient();
        const result = await client.confirmEmailChange(token);

        if (result.success) {
          setStatus('success');
          setMessage(t('success'));
        } else {
          setStatus('error');
          setMessage(result.error || t('failed'));
        }
      } catch {
        setStatus('error');
        setMessage(t('networkError'));
      }
    };

    confirmEmailChange();
  }, [searchParams, t]);

  return (
    <AuthCard customization={customization}>
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-6 tracking-wide"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
          {t('title')}
        </h2>
        <StatusMessage type={status} message={message} />

        {status === 'success' && (
          <div className="mt-6">
            <p className="text-sm" style={{ color: 'var(--forge-silver)' }}>
              {t('successMessage')}
            </p>
          </div>
        )}
      </div>
    </AuthCard>
  );
}

export default function ConfirmEmailChangePage() {
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
      <ConfirmEmailChangeContent />
    </Suspense>
  );
}
