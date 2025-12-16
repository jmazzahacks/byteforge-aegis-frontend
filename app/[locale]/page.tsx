import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations('Home');

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

      <div className="relative text-center">
        {/* Logo icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-8 relative ember-glow"
             style={{ backgroundColor: 'var(--forge-steel)', border: '1px solid var(--forge-iron)' }}>
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg"
               style={{ borderColor: 'var(--ember-glow)' }} />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg"
               style={{ borderColor: 'var(--ember-glow)' }} />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg"
               style={{ borderColor: 'var(--ember-glow)' }} />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-lg"
               style={{ borderColor: 'var(--ember-glow)' }} />

          <svg className="w-12 h-12 shield-glow" viewBox="0 0 24 24" fill="none" stroke="url(#emberGradientHome)" strokeWidth={1.5}>
            <defs>
              <linearGradient id="emberGradientHome" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--ember-bright)" />
                <stop offset="100%" stopColor="var(--ember-glow)" />
              </linearGradient>
            </defs>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>

        <h1 className="text-5xl font-semibold tracking-wide mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--forge-light)' }}>
          {t('title')}
        </h1>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-12 h-px" style={{ backgroundColor: 'var(--ember-glow)', opacity: 0.6 }} />
          <p className="text-sm uppercase tracking-widest" style={{ color: 'var(--forge-silver)' }}>
            {t('subtitle')}
          </p>
          <div className="w-12 h-px" style={{ backgroundColor: 'var(--ember-glow)', opacity: 0.6 }} />
        </div>

        <p className="text-lg mb-12 max-w-md mx-auto" style={{ color: 'var(--forge-silver)' }}>
          {t('description')}
        </p>

        {/* Decorative element */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-glow)', animationDelay: '0s' }} />
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-bright)', animationDelay: '0.5s' }} />
          <div className="w-2 h-2 rounded-full ember-particle"
               style={{ backgroundColor: 'var(--ember-glow)', animationDelay: '1s' }} />
        </div>
      </div>
    </div>
  );
}
