import React from 'react';
import { SiteCustomization } from '@/utils/customization';

interface AuthCardProps {
  children: React.ReactNode;
  customization?: SiteCustomization;
}

export default function AuthCard({ children, customization }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden forge-texture"
         style={{ backgroundColor: 'var(--forge-black)' }}>

      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
           style={{ background: 'radial-gradient(circle, var(--ember-glow) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
           style={{ background: 'radial-gradient(circle, var(--ember-dim) 0%, transparent 70%)' }} />

      {/* Geometric grid lines */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-0 right-0 h-px" style={{ backgroundColor: 'var(--forge-iron)' }} />
        <div className="absolute bottom-20 left-0 right-0 h-px" style={{ backgroundColor: 'var(--forge-iron)' }} />
        <div className="absolute left-20 top-0 bottom-0 w-px" style={{ backgroundColor: 'var(--forge-iron)' }} />
        <div className="absolute right-20 top-0 bottom-0 w-px" style={{ backgroundColor: 'var(--forge-iron)' }} />
      </div>

      <div className="relative max-w-md w-full">
        {/* Logo/Brand section */}
        <div className="text-center mb-10">
          {customization?.logoUrl ? (
            <img
              src={customization.logoUrl}
              alt={customization.siteName || 'Site Logo'}
              className="mx-auto h-14 w-auto mb-6"
            />
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 relative ember-glow"
                 style={{ backgroundColor: 'var(--forge-steel)', border: '1px solid var(--forge-iron)' }}>
              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl-lg"
                   style={{ borderColor: 'var(--ember-glow)' }} />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-lg"
                   style={{ borderColor: 'var(--ember-glow)' }} />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-lg"
                   style={{ borderColor: 'var(--ember-glow)' }} />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br-lg"
                   style={{ borderColor: 'var(--ember-glow)' }} />

              <svg className="w-10 h-10 shield-glow" viewBox="0 0 24 24" fill="none" stroke="url(#emberGradient)" strokeWidth={1.5}>
                <defs>
                  <linearGradient id="emberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--ember-bright)" />
                    <stop offset="100%" stopColor="var(--ember-glow)" />
                  </linearGradient>
                </defs>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          )}

          <h1 className="text-3xl font-semibold tracking-wide mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
            {customization?.siteName || 'BYTEFORGE AEGIS'}
          </h1>

          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-8 h-px" style={{ backgroundColor: 'var(--ember-glow)', opacity: 0.6 }} />
            <p className="text-sm uppercase tracking-widest" style={{ color: 'var(--forge-silver)' }}>
              Secure Authentication
            </p>
            <div className="w-8 h-px" style={{ backgroundColor: 'var(--ember-glow)', opacity: 0.6 }} />
          </div>
        </div>

        {/* Card */}
        <div className="relative rounded-xl p-8 ember-glow"
             style={{
               backgroundColor: 'var(--forge-charcoal)',
               border: '1px solid var(--forge-iron)'
             }}>
          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-8 forge-accent-line" />

          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-glow)', animationDelay: '0s' }} />
          <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--forge-silver)' }}>
            Protected by ByteForge Aegis
          </p>
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-glow)', animationDelay: '1.5s' }} />
        </div>
      </div>
    </div>
  );
}
