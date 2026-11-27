'use client';

import { Copy } from 'lucide-react';
import { useState } from 'react';
import type { RedemptionCode } from '@/content/redemption';
import { trackAction } from '@/lib/analytics';
import type { Locale } from '@/i18n/locales';

const copyText = {
  'pt-BR': ['O prazo oficial deste código terminou.', 'Código copiado: ', 'Selecione o código para copiar manualmente.', 'Copiar ', 'Copiar código'],
  en: ['The official deadline has passed.', 'Code copied: ', 'Select the code to copy it manually.', 'Copy ', 'Copy code'],
  es: ['El plazo oficial de este código terminó.', 'Código copiado: ', 'Selecciona el código para copiarlo manualmente.', 'Copiar ', 'Copiar código'],
} as const;

export async function copyRedemptionCode(entry: Pick<RedemptionCode, 'code' | 'game'>) {
  await navigator.clipboard.writeText(entry.code);
  trackAction('redemption_code_copy', { game_slug: entry.game });
}

export function CopyRedemptionCode({ entry, locale = 'pt-BR' }: { entry: Pick<RedemptionCode, 'code' | 'game' | 'expiresAt'>; locale?: Locale }) {
  const [expired, copied, failed, label, button] = copyText[locale];
  const [notice, setNotice] = useState('');
  async function copy() {
    if (entry.expiresAt && Date.parse(entry.expiresAt) <= Date.now()) {
      setNotice(expired);
      return;
    }
    try {
      await copyRedemptionCode(entry);
      setNotice(copied + entry.code);
    } catch {
      setNotice(failed);
    }
  }

  return <div>
    <button type="button" className="button secondary home-code-copy" onClick={() => void copy()} aria-label={label + entry.code}>
      <Copy size={16} aria-hidden="true" /> {button}
    </button>
    <p className="home-code-feedback" role="status">{notice}</p>
  </div>;
}
