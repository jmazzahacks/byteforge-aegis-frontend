import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  ...nextVitals,
  // Surface existing compiler-readiness diagnostics without turning this
  // dependency/tooling migration into a refactor of authentication effects.
  // Rules of Hooks and the remaining Core Web Vitals errors stay enforced.
  {
    files: [
      'app/[[]locale]/admin/page.tsx',
      'app/[[]locale]/aegis-admin/dashboard/page.tsx',
      'app/[[]locale]/aegis-admin/sites/[[]siteId]/page.tsx',
      'app/[[]locale]/aegis-admin/sites/[[]siteId]/settings/page.tsx',
      'app/[[]locale]/login/page.tsx',
      'app/[[]locale]/verify-email/page.tsx',
      'components/LanguageSwitcher.tsx',
    ],
    rules: {
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
