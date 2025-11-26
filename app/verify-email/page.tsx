'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthCard from '@/components/AuthCard';
import StatusMessage from '@/components/StatusMessage';
import { getCustomizationFromQuery } from '@/utils/customization';

type VerificationStatus = 'loading' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  const customization = getCustomizationFromQuery(searchParams);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Missing token.');
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
          setMessage('Email verified successfully! You can now log in to your account.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email. The link may be invalid or expired.');
        }
      } catch (error: unknown) {
        setStatus('error');
        setMessage('Failed to verify email. Please try again later.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <AuthCard customization={customization}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Email Verification
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
