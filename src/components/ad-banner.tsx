import type { ReactNode } from 'react';

const advertisingApproved = false;

export function AdBanner({ children, placement = 'inline' }: {
  children?: ReactNode;
  placement?: 'inline' | 'leaderboard';
}) {
  if (!advertisingApproved || !children) return null;

  return <aside className={`ad-banner ad-banner--${placement}`} aria-label="Publicidade">
    <p>Publicidade</p>
    {children}
  </aside>;
}

