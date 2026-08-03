import React, { useId, useState } from 'react';
import { handleKeyboardActivation } from '../accessibility/a11y';
import '../styles/design-system.css';

type BaseProps = {
  children?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function Button({ children, type = 'button', className, ...props }: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cx('iips-button', className)} {...props}>{children}</button>;
}

export function IconButton({ label, children, type = 'button', className, ...props }: Omit<BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & { label: string }) {
  return <button type={type} className={cx('iips-icon-button', className)} aria-label={label} {...props}>{children}</button>;
}

export function Card({ children, className, ...props }: BaseProps & React.HTMLAttributes<HTMLElement>) {
  return <section className={cx('iips-card', className)} {...props}>{children}</section>;
}

export function Panel({ children, title, className, 'aria-label': ariaLabel, ...props }: BaseProps & React.HTMLAttributes<HTMLElement> & { title?: string }) {
  return <section className={cx('iips-panel', className)} aria-label={ariaLabel ?? title} {...props}>{title ? <h2 className="iips-panel__title">{title}</h2> : null}{children}</section>;
}

export function Badge({ children, variant = 'info', className, ...props }: BaseProps & React.HTMLAttributes<HTMLSpanElement> & { variant?: string }) {
  return <span className={cx('iips-badge', `iips-badge--${variant.toLowerCase().replaceAll(' ', '-')}`, className)} {...props}>{children}</span>;
}

export function StatusPill({ children, variant = 'info', className, ...props }: BaseProps & React.HTMLAttributes<HTMLSpanElement> & { variant?: string }) {
  return <span className={cx('iips-status-pill', `iips-status-pill--${variant.toLowerCase().replaceAll(' ', '-')}`, className)} {...props}>{children}</span>;
}

export function Drawer({ children, open = true, className, ...props }: BaseProps & React.HTMLAttributes<HTMLElement> & { open?: boolean }) {
  if (!open) return null;
  return <aside className={cx('iips-drawer', className)} role="complementary" {...props}>{children}</aside>;
}

export function Modal({ children, open = true, title, className, ...props }: BaseProps & React.HTMLAttributes<HTMLDivElement> & { open?: boolean; title: string }) {
  if (!open) return null;
  return <div className="iips-modal-backdrop"><div className={cx('iips-modal', className)} role="dialog" aria-modal="true" aria-label={props['aria-label'] ?? title} {...props}><h2 className="iips-panel__title">{title}</h2>{children}</div></div>;
}

export function Dialog(props: React.ComponentProps<typeof Modal>) {
  return <Modal {...props} />;
}

export function Tooltip({ children, content }: { children: React.ReactElement<{ 'aria-describedby'?: string }>; content: React.ReactNode }) {
  const id = useId();
  return <span className="iips-tooltip-wrap">{React.cloneElement(children, { 'aria-describedby': id })}<span id={id} role="tooltip" className="iips-tooltip">{content}</span></span>;
}

export function EmptyState({ title, message, children, className, ...props }: BaseProps & React.HTMLAttributes<HTMLElement> & { title: string; message?: string }) {
  return <section className={cx('iips-empty-state', className)} role="status" {...props}><h2>{title}</h2>{message ? <p>{message}</p> : null}{children}</section>;
}

export function Alert({ children, variant = 'info', className, ...props }: BaseProps & React.HTMLAttributes<HTMLDivElement> & { variant?: 'info' | 'success' | 'warning' | 'error' }) {
  return <div className={cx('iips-alert', `iips-alert--${variant}`, className)} role={variant === 'error' ? 'alert' : 'status'} {...props}>{children}</div>;
}

export function Toast({ children, variant = 'info', className, ...props }: BaseProps & React.HTMLAttributes<HTMLDivElement> & { variant?: 'info' | 'success' | 'warning' | 'error' }) {
  return <div className={cx('iips-toast', `iips-toast--${variant}`, className)} role="status" aria-live="polite" {...props}>{children}</div>;
}

export function TextInput({ label, helperText, error, id, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; helperText?: string; error?: string }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  return <label className={cx('iips-field', className)} htmlFor={inputId}><span>{label}</span><input id={inputId} className="iips-input" aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : helperText ? helperId : undefined} {...props} />{helperText ? <span id={helperId} className="iips-helper-text">{helperText}</span> : null}{error ? <span id={errorId} className="iips-error-text">{error}</span> : null}</label>;
}

export function SearchBox(props: Omit<React.ComponentProps<typeof TextInput>, 'type'>) {
  return <TextInput type="search" {...props} />;
}

export function Select({ label, helperText, error, id, className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; helperText?: string; error?: string }) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;
  return <label className={cx('iips-field', className)} htmlFor={selectId}><span>{label}</span><select id={selectId} className="iips-select" aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : helperText ? helperId : undefined} {...props}>{children}</select>{helperText ? <span id={helperId} className="iips-helper-text">{helperText}</span> : null}{error ? <span id={errorId} className="iips-error-text">{error}</span> : null}</label>;
}

export function Checkbox({ label, className, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string }) {
  return <label className={cx('iips-choice', className)}><input type="checkbox" {...props} /><span>{label}</span></label>;
}

export function Radio({ label, className, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string }) {
  return <label className={cx('iips-choice', className)}><input type="radio" {...props} /><span>{label}</span></label>;
}

export function Toggle({ label, className, checked, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string }) {
  return <label className={cx('iips-toggle', className)}><input type="checkbox" role="switch" checked={checked} {...props} /><span>{label}</span></label>;
}

export function ProgressBar({ value, max = 100, label }: { value: number; max?: number; label: string }) {
  return <div className="iips-progress" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}><span style={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%` }} /></div>;
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return <span className="iips-spinner" role="status" aria-label={label} />;
}

export function Skeleton({ label = 'Loading content', className }: { label?: string; className?: string }) {
  return <span className={cx('iips-skeleton', className)} role="status" aria-label={label} />;
}

export function Tabs({ tabs, defaultId }: { tabs: Array<{ id: string; label: string; content: React.ReactNode }>; defaultId?: string }) {
  const [activeId, setActiveId] = useState(defaultId ?? tabs[0]?.id);
  const activeTab = tabs.find(tab => tab.id === activeId) ?? tabs[0];
  return <div className="iips-tabs"><div role="tablist">{tabs.map(tab => <button key={tab.id} type="button" role="tab" aria-selected={tab.id === activeTab?.id} onClick={() => setActiveId(tab.id)}>{tab.label}</button>)}</div>{activeTab ? <div role="tabpanel" className="iips-tab-panel">{activeTab.content}</div> : null}</div>;
}

export function Accordion({ items }: { items: Array<{ id: string; title: string; content: React.ReactNode }> }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  return <div className="iips-accordion">{items.map(item => <section key={item.id}><button type="button" aria-expanded={openId === item.id} onClick={() => setOpenId(openId === item.id ? null : item.id)}>{item.title}</button>{openId === item.id ? <div>{item.content}</div> : null}</section>)}</div>;
}

export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange?: (page: number) => void }) {
  return <nav className="iips-pagination" aria-label="Pagination"><Button disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>Previous</Button><span>Page {page} of {totalPages}</span><Button disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>Next</Button></nav>;
}

export function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav className="iips-breadcrumb" aria-label="Breadcrumb"><ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{item.href ? <a href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>;
}

export function DataTable<T extends { id: string }>({ rows, columns, selectedId, onSelect, getRowLabel, 'aria-label': ariaLabel }: { rows: T[]; columns: Array<{ key: keyof T; label: string }>; selectedId?: string | null; onSelect?: (row: T) => void; getRowLabel?: (row: T) => string; 'aria-label': string }) {
  return (
    <table className="iips-table" aria-label={ariaLabel}>
      <thead><tr>{columns.map(column => <th key={String(column.key)} scope="col">{column.label}</th>)}</tr></thead>
      <tbody>{rows.map(row => <tr key={row.id} data-row-id={row.id} tabIndex={0} aria-label={getRowLabel?.(row)} aria-selected={row.id === selectedId} onClick={() => onSelect?.(row)} onKeyDown={handleKeyboardActivation(() => onSelect?.(row))}>{columns.map(column => <td key={String(column.key)}>{String(row[column.key] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  );
}
