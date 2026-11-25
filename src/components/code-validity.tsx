'use client';

import { useEffect, useState } from 'react';

export function CodeValidity({ expiresAt, snapshot }: { expiresAt?: string; snapshot: number }) {
  const [now, setNow] = useState(snapshot);
  useEffect(() => {
    if (!expiresAt) return;
    const end = Date.parse(expiresAt);
    let timer: ReturnType<typeof setTimeout>;
    function refresh() {
      const current = Date.now();
      setNow(current);
      if (current < end) timer = setTimeout(refresh, Math.min(end - current, 2_147_483_647));
    }
    refresh();
    return () => clearTimeout(timer);
  }, [expiresAt]);
  if (!expiresAt) return <small>Verificado · Validade não informada</small>;
  const expired = Date.parse(expiresAt) <= now;
  return <small>{expired ? 'Expirado' : 'Verificado'} · Válido até <time dateTime={expiresAt}>
    {new Date(expiresAt).toLocaleString('pt-BR', { timeZone: 'UTC' })} UTC
  </time></small>;
}
