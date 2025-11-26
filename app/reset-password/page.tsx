'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthCard from '@/components/AuthCard';
import StatusMessage from '@/components/StatusMessage';
import { getCustomizationFromQuery } from '@/utils/customization';

type ResetStatus = 'idle' | 'loading' | 'success' | 'error';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
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
      setMessage('Invalid reset link. Missing token.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long.');
      return;
    }

    setStatus('loading');
    setMessage('Resetting your password...');

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Password reset successfully! You can now log in with your new password.');
        setPassword('');
        setConfirmPassword('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to reset password. The link may be invalid or expired.');
      }
    } catch (error: unknown) {
      setStatus('error');
      setMessage('Failed to reset password. Please try again later.');
    }
  };

  if (!token) {
    return (
      <AuthCard customization={customization}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Password Reset
          </h2>
          <StatusMessage type="error" message="Invalid reset link. Missing token." />
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard customization={customization}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Reset Your Password
        </h2>

        {status !== 'idle' && status !== 'loading' && (
          <div className="mb-4">
            <StatusMessage type={status} message={message} />
          </div>
        )}

        {status !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter new password"
                minLength={8}
                disabled={status === 'loading'}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm new password"
                minLength={8}
                disabled={status === 'loading'}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {status === 'success' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              You can close this window and return to the application to log in.
            </p>
          </div>
        )}
      </div>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
