'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { routing, Locale } from '@/i18n/routing';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('LanguageSwitcher');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    // Build the new URL with the new locale prefix
    const newPath = `/${newLocale}${pathname}`;
    window.location.href = newPath;
  };

  const getLanguageLabel = (loc: string): string => {
    switch (loc) {
      case 'en': return t('en');
      case 'es': return t('es');
      case 'ru': return t('ru');
      default: return loc.toUpperCase();
    }
  };

  const getLanguageFlag = (loc: string): string => {
    switch (loc) {
      case 'en': return 'EN';
      case 'es': return 'ES';
      case 'ru': return 'RU';
      default: return loc.toUpperCase();
    }
  };

  return (
    <div className="relative z-[100]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm uppercase tracking-wider rounded-lg transition-all duration-200"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--forge-silver)',
          backgroundColor: 'var(--forge-steel)',
          border: '1px solid var(--forge-iron)'
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        <span>{getLanguageFlag(locale)}</span>
        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-lg shadow-xl overflow-hidden"
          style={{
            backgroundColor: 'var(--forge-charcoal)',
            border: '1px solid var(--forge-iron)',
            zIndex: 9999
          }}
          role="listbox"
        >
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className="w-full px-4 py-2.5 text-left text-sm transition-colors duration-150 flex items-center gap-3"
              style={{
                color: locale === loc ? 'var(--ember-glow)' : 'var(--forge-silver)',
                backgroundColor: locale === loc ? 'rgba(212, 116, 12, 0.1)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (locale !== loc) {
                  e.currentTarget.style.backgroundColor = 'var(--forge-steel)';
                }
              }}
              onMouseLeave={(e) => {
                if (locale !== loc) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              role="option"
              aria-selected={locale === loc}
            >
              <span className="w-6 text-xs font-semibold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-display)' }}>
                {getLanguageFlag(loc)}
              </span>
              <span>{getLanguageLabel(loc)}</span>
              {locale === loc && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
