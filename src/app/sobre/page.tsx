import Link from 'next/link';
import { PageHeading } from '@/components/catalog';
import { pageMetadata } from '@/lib/site';

const description = 'Conheça o GachaVerse e seus critérios editoriais.';
export const metadata = pageMetadata('Sobre', description, '/sobre/');

export default function About() {
  return <div className="shell interior">
    <div className="prose">
      <PageHeading eyebrow="Sobre o portal" title="GachaVerse" description={description} />
      <p>O GachaVerse é um portal independente em português do Brasil. A cobertura começa com Honkai: Star Rail, Genshin Impact, Zenless Zone Zero e Wuthering Waves.</p>
      <h2>Critérios editoriais</h2>
      <p>Os guias de resgate apontam para canais oficiais. Para publicar uma build ou tier list, a equipe editorial deve informar a versão analisada, o contexto de uso e as fontes consultadas.</p>
      <h2>Correções</h2>
      <p>Qualquer leitor pode apontar um link quebrado, um código vencido ou uma instrução desatualizada. Indique a página e a referência na <Link href="/contato/">área de contato</Link>.</p>
      <h2>Publicidade</h2>
      <p>Os espaços publicitários permanecem desativados enquanto o portal aguarda aprovação do Google AdSense.</p>
    </div>
  </div>;
}

