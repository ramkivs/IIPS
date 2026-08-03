import React from 'react';
import '../styles/design-system.css';

type Props = { children?: React.ReactNode; className?: string };

export function AppShell({ children }: Props) { return <div className="iips-app-shell">{children}</div>; }
export function Stack({ children, gap = 'md' }: Props & { gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) { return <div className={`iips-stack iips-stack--${gap}`}>{children}</div>; }
export function Grid({ children, columns = 2 }: Props & { columns?: 1 | 2 | 3 | 4 }) { return <div className="iips-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{children}</div>; }
export function Flex({ children }: Props) { return <div className="iips-flex">{children}</div>; }
export function PageContainer({ children }: Props) { return <main className="iips-page-container">{children}</main>; }
export function SectionContainer({ children, 'aria-label': ariaLabel }: Props & { 'aria-label'?: string }) { return <section className="iips-section-container" aria-label={ariaLabel}>{children}</section>; }
