'use client';
import { useState } from 'react';
import { historyTransaction, deleteLegacyHistory } from './database';

export function Dashboard() {
  const [message, setMessage] = useState(''),
    [confirm, setConfirm] = useState(false);
  async function download() {
    try {
      const rows = await historyTransaction();
      if (!rows.length) {
        setMessage('Nenhum histórico anterior encontrado neste navegador.');
        return;
      }
      const url = URL.createObjectURL(
        new Blob([JSON.stringify({ version: 1, saltos: rows })], { type: 'application/json' }),
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gachaverse-migracao.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(
        'Cópia exportada. Importe no tracker isolado e confira a contagem antes de excluir a cópia antiga.',
      );
    } catch {
      setMessage('Não foi possível ler o armazenamento deste navegador.');
    }
  }
  return (
    <section className="panel prose">
      <h2>Migrar um diário anterior</h2>
      <p>
        Exporte pelo mesmo navegador e perfil em que você usava o tracker. Na nova origem, escolha o
        JSON, revise a prévia e confirme. Confira as contagens das duas famílias antes de apagar a cópia
        antiga.
      </p>
      <button className="button secondary" onClick={download}>
        Exportar cópia antiga
      </button>
      <button className="button secondary" onClick={() => setConfirm(!confirm)}>
        {confirm ? 'Cancelar' : 'Excluir cópia antiga'}
      </button>
      {confirm && (
        <button
          className="button secondary"
          onClick={async () => {
            try {
              await deleteLegacyHistory();
              setMessage('Cópia antiga excluída.');
            } catch {
              setMessage('Feche outras abas do portal e tente novamente.');
            }
            setConfirm(false);
          }}
        >
          Confirmar exclusão local
        </button>
      )}
      <p role="status">{message}</p>
    </section>
  );
}
