import type { Metadata } from 'next';
import NotFound from './(pt)/not-found';
import './globals.css';

export const metadata: Metadata = { title: 'Página não encontrada | GachaVerse', robots: { index: false, follow: true } };

export default function GlobalNotFound() {
  return <html lang="pt-BR"><body><main id="principal"><NotFound /></main></body></html>;
}
