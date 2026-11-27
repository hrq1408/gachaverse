import { PortalHome } from '@/components/portal-home';
import { pageMetadata, site } from '@/lib/site';
import { homeAlternates, homeSeoTitles, withLanguages } from '@/i18n/seo';

export const metadata = {
  ...withLanguages(pageMetadata(homeSeoTitles['pt-BR'], site.description, '/'), homeAlternates),
  title: { absolute: homeSeoTitles['pt-BR'] },
};

export default function Home() { return <PortalHome locale="pt-BR" />; }
