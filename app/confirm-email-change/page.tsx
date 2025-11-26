'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthCard from '@/components/AuthCard';
import StatusMessage from '@/components/StatusMessage';
import { getCustomizationFromQuery } from '@/utils/customization';

type ConfirmationStatus = 'loading' | 'success' | 'error';

function ConfirmEmailChangeContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ConfirmationStatus>('loading');
  const [message, setMessage] = useState('Confirming your email change...');

  const customization = getCustomizationFromQuery(searchParams);

  useEffect(() => {
    const confirmEmailChange = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid confirmation link. Missing token.');
        return;
      }

      try {
        const response = await fetch('/api/confirm-email-change', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email address updated successfully! You can now use your new email to log in.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to confirm email change. The link may be invalid or expired.');
        }
      } catch (error: unknown) {
        setStatus('error');
        setMessage('Failed to confirm email change. Please try again later.');
      }
    };

    confirmEmailChange();
  }, [searchParams]);

  return (
    <AuthCard customization={customization}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Email Change Confirmation
        </h2>
        <StatusMessage type={status} message={message} />

        {status === 'success' && (
          <div className="mt-6">
            <p className="text-sm text-gray-600">
              You can close this window and return to the application.
            </p>
          </div>
        )}
      </div>
    </AuthCard>
  );
}

export default function ConfirmEmailChangePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ConfirmEmailChangeContent />
    </Suspense>
  );
}
