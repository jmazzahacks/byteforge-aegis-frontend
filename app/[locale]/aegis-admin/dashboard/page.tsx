'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AegisAdminDashboard() {
  const router = useRouter();
  const t = useTranslations('AegisAdmin');
  const tCommon = useTranslations('Common');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('aegis_admin_token');

    if (!token) {
      router.push('/aegis-admin/login');
      return;
    }

    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('aegis_admin_token');
    localStorage.removeItem('aegis_admin_refresh_token');
    localStorage.removeItem('aegis_admin_user_id');
    router.push('/aegis-admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center forge-texture"
           style={{ backgroundColor: 'var(--forge-black)' }}>
        <div className="inline-flex items-center gap-3">
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-glow)' }} />
          <p style={{ color: 'var(--forge-silver)', fontFamily: 'var(--font-body)' }}>
            {t('loadingDashboard')}
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
              {/* Shield icon */}
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
                  {t('dashboardSubtitle')}
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
      <main className="relative z-10 max-w-7xl mx-auto py-8 px-6 lg:px-8">
        {/* Welcome section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-px" style={{ backgroundColor: 'var(--ember-glow)', opacity: 0.6 }} />
          <h2 className="text-2xl font-semibold tracking-wide uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
            {t('welcome')}
          </h2>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--forge-iron)' }} />
        </div>

        {/* Placeholder card */}
        <div className="rounded-xl p-12 text-center ember-glow"
             style={{
               backgroundColor: 'var(--forge-charcoal)',
               border: '1px solid var(--forge-iron)'
             }}>
          {/* Corner accents */}
          <div className="relative">
            <div className="absolute -top-12 -left-12 w-6 h-6 border-t-2 border-l-2"
                 style={{ borderColor: 'var(--ember-glow)', opacity: 0.5 }} />
            <div className="absolute -top-12 -right-12 w-6 h-6 border-t-2 border-r-2"
                 style={{ borderColor: 'var(--ember-glow)', opacity: 0.5 }} />
          </div>

          <svg className="w-16 h-16 mx-auto mb-6" style={{ color: 'var(--forge-iron)' }}
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
          <p className="text-lg mb-2" style={{ color: 'var(--forge-silver)', fontFamily: 'var(--font-display)' }}>
            {t('welcomeDescription')}
          </p>

          {/* Bottom corner accents */}
          <div className="relative">
            <div className="absolute -bottom-12 -left-12 w-6 h-6 border-b-2 border-l-2"
                 style={{ borderColor: 'var(--ember-glow)', opacity: 0.5 }} />
            <div className="absolute -bottom-12 -right-12 w-6 h-6 border-b-2 border-r-2"
                 style={{ borderColor: 'var(--ember-glow)', opacity: 0.5 }} />
          </div>
        </div>

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
