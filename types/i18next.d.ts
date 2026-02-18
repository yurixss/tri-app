import 'i18next';

import type { resources } from '@/i18n/constants';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: (typeof resources)['pt-BR'];
  }
}
