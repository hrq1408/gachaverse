'use client';

import { Copy } from 'lucide-react';
import { useState } from 'react';
import type { RedemptionCode } from '@/content/redemption';
import { trackAction } from '@/lib/analytics';

export async function copyRedemptionCode(entry: Pick<RedemptionCode, 'code' | 'game'>) {
  await navigator.clipboard.writeText(entry.code);
  trackAction('redemption_code_copy', { game_slug: entry.game });
}

export function CopyRedemptionCode({ entry }: { entry: Pick<RedemptionCode, 'code' | 'game' | 'expiresAt'> }) {
  const [notice, setNotice] = useState('');
  async function copy() {
    if (entry.expiresAt && Date.parse(entry.expiresAt) <= Date.now()) {
      setNotice('O prazo oficial deste código terminou.');
      return;
    }
    try {
      await copyRedemptionCode(entry);
      setNotice('Código copiado: ' + entry.code);
    } catch {
      setNotice('Selecione o código para copiar manualmente.');
    }
  }

  return <div>
    <button type="button" className="button secondary home-code-copy" onClick={() => void copy()} aria-label={'Copiar ' + entry.code}>
      <Copy size={16} aria-hidden="true" /> Copiar código
    </button>
    <p className="home-code-feedback" role="status">{notice}</p>
  </div>;
}
