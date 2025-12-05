'use client';

import { Suspense, useEffect, useState, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AuthCard from '@/components/AuthCard';
import StatusMessage from '@/components/StatusMessage';
import { browserClient, Site } from '@/lib/browserClient';

type LoginStatus = 'idle' | 'loading' | 'success' | 'error';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [siteError, setSiteError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [message, setMessage] = useState('');

  const siteDomain = searchParams.get('site');

  useEffect(() => {
    if (!siteDomain) {
      setSiteError('No site specified. Please use ?site=your-domain');
      return;
    }

    const fetchSite = async () => {
      const result = await browserClient.getSiteByDomain(siteDomain);

      if (result.success && result.data) {
        setSite(result.data);
      } else {
        setSiteError(result.error || 'Site not found');
      }
    };

    fetchSite();
  }, [siteDomain]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!site) return;

    setStatus('loading');
    setMessage('Authenticating...');

    const result = await browserClient.login(site.id, email, password);

    if (result.success && result.data) {
      localStorage.setItem('auth_token', result.data.token);
      localStorage.setItem('user_id', result.data.user_id.toString());
      localStorage.setItem('site_id', site.id.toString());
      localStorage.setItem('site_name', site.name);

      setStatus('success');
      setMessage('Access granted. Redirecting...');

      setTimeout(() => {
        router.push('/admin');
      }, 500);
    } else {
      setStatus('error');
      setMessage(result.error || 'Authentication failed');
    }
  };

  if (siteError) {
    return (
      <AuthCard>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
            Access Denied
          </h2>
          <StatusMessage type="error" message={siteError} />
        </div>
      </AuthCard>
    );
  }

  if (!site) {
    return (
      <AuthCard>
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-2 h-2 rounded-full ember-particle"
                 style={{ backgroundColor: 'var(--ember-glow)' }} />
            <p style={{ color: 'var(--forge-silver)' }}>Initializing secure connection...</p>
            <div className="w-2 h-2 rounded-full ember-particle"
                 style={{ backgroundColor: 'var(--ember-glow)', animationDelay: '1s' }} />
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div>
        <h2 className="text-2xl font-semibold mb-1 text-center tracking-wide"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
          ADMIN ACCESS
        </h2>
        <p className="text-center text-sm mb-8" style={{ color: 'var(--ember-glow)' }}>
          {site.name}
        </p>

        {status !== 'idle' && status !== 'loading' && (
          <div className="mb-6">
            <StatusMessage type={status} message={message} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email"
                   className="block text-xs font-medium uppercase tracking-wider mb-2"
                   style={{ color: 'var(--forge-silver)' }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-forge block w-full px-4 py-3 rounded-lg"
              style={{ color: 'var(--forge-light)' }}
              placeholder="admin@example.com"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <div>
            <label htmlFor="password"
                   className="block text-xs font-medium uppercase tracking-wider mb-2"
                   style={{ color: 'var(--forge-silver)' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-forge block w-full px-4 py-3 rounded-lg"
              style={{ color: 'var(--forge-light)' }}
              placeholder="Enter your password"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="btn-forge w-full py-3.5 px-4 text-white font-semibold rounded-lg uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {status === 'loading' ? (
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Authenticating...
              </span>
            ) : (
              'Authenticate'
            )}
          </button>
        </form>

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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
           style={{ backgroundColor: 'var(--forge-black)' }}>
        <div className="inline-flex items-center gap-3">
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-glow)' }} />
          <p style={{ color: 'var(--forge-silver)', fontFamily: 'var(--font-body)' }}>
            Loading...
          </p>
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-glow)', animationDelay: '1s' }} />
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
