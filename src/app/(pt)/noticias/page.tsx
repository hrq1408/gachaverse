import { NewsPage } from '@/components/news-page';
import { pageMetadata } from '@/lib/site';
import { localizedNewsAlternates, withLanguages } from '@/i18n/seo';
import { newsLabels } from '@/i18n/news';

const [title, description] = newsLabels['pt-BR'];
export const metadata = withLanguages(pageMetadata(title, description, '/noticias/', Boolean(localizedNewsAlternates()['pt-BR'])), localizedNewsAlternates());

export default function News() {
  return <NewsPage locale="pt-BR" />;
}
