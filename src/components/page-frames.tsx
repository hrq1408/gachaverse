import type { ReactNode } from 'react';
import { PageHeading } from './catalog';

type Heading = { eyebrow: string; title: string; description: string };

export function SectionPage({ children, before, ...heading }: Heading & { children: ReactNode; before?: ReactNode }) {
  return <div className="shell interior">{before}<PageHeading {...heading} />{children}</div>;
}

export function InstitutionalPage({ children, as: Body = 'article', ...heading }: Heading & {
  children: ReactNode; as?: 'article' | 'div';
}) {
  return <div className="shell interior"><Body className="prose"><PageHeading {...heading} />{children}</Body></div>;
}
