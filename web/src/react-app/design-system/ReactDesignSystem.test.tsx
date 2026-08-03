import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Accordion,
  Alert,
  AppShell,
  Badge,
  Breadcrumb,
  Button,
  Checkbox,
  DataTable,
  Dialog,
  EmptyState,
  Grid,
  IconButton,
  Modal,
  Pagination,
  Panel,
  ProgressBar,
  Radio,
  SearchBox,
  Select,
  Skeleton,
  Spinner,
  Tabs,
  TextInput,
  ThemeProvider,
  Toast,
  Toggle,
  Tooltip,
  ariaLabel,
  liveRegionProps,
  reactDesignTokens,
  useTheme
} from './index';

function ThemeProbe() {
  const theme = useTheme();
  return <span data-testid="theme" data-high={theme.cssVariables['--iips-color-status-high']} data-surface={theme.cssVariables['--color-surface']} data-space={theme.cssVariables['--space-12']}>{theme.name}</span>;
}

describe('React Design System', () => {
  it('provides runtime design tokens and semantic aliases through ThemeProvider', () => {
    render(<ThemeProvider><ThemeProbe /></ThemeProvider>);
    expect(screen.getByTestId('theme').getAttribute('data-high')).toBe(reactDesignTokens.color.status.high);
    expect(screen.getByTestId('theme').getAttribute('data-surface')).toBe(reactDesignTokens.color.semantic.surface);
    expect(screen.getByTestId('theme').getAttribute('data-space')).toBe('12px');
  });

  it('keeps status colors above WCAG AA contrast targets for normal text where used on status backgrounds', () => {
    expect(contrastRatio(reactDesignTokens.color.status.info, '#e9f2fb')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(reactDesignTokens.color.status.good, '#e8f5ee')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(reactDesignTokens.color.status.medium, '#fff5df')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(reactDesignTokens.color.status.high, '#fdebea')).toBeGreaterThanOrEqual(4.5);
  });

  it('renders primitive components without business semantics', () => {
    render(<ThemeProvider><Panel title="Panel"><Button>Review</Button><IconButton label="Open menu">☰</IconButton><Badge variant="Certified">Certified</Badge><EmptyState title="No active reviews" /></Panel></ThemeProvider>);
    expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeTruthy();
    expect(screen.getByText('Certified')).toBeTruthy();
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('renders DataTable with keyboard-selectable rows and prevents default activation scroll', () => {
    const rows = [{ id: 'row-1', ticker: 'ELECON', priority: 'High' }];
    const onSelect = vi.fn();
    render(<DataTable aria-label="Active Review Queue" rows={rows} columns={[{ key: 'ticker', label: 'Ticker' }, { key: 'priority', label: 'Priority' }]} selectedId="row-1" getRowLabel={row => `Review ${row.ticker}`} onSelect={onSelect} />);
    const row = screen.getByRole('row', { name: 'Review ELECON' });
    expect(screen.getByRole('table', { name: 'Active Review Queue' })).toBeTruthy();
    expect(row?.getAttribute('aria-selected')).toBe('true');
    expect(row?.getAttribute('data-row-id')).toBe('row-1');
    fireEvent.keyDown(row as HTMLElement, { key: ' ' });
    expect(onSelect).toHaveBeenCalledWith(rows[0]);
  });

  it('provides layout primitives and accessibility helpers', () => {
    render(<ThemeProvider><AppShell><Grid columns={2}><span {...ariaLabel('A')}>A</span><span {...liveRegionProps('polite')}>B</span></Grid></AppShell></ThemeProvider>);
    expect(screen.getByLabelText('A')).toBeTruthy();
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('renders modal, dialog, tooltip, alert, and toast accessibility semantics', () => {
    render(
      <ThemeProvider>
        <Modal title="Modal title"><p>Modal content</p></Modal>
        <Dialog title="Dialog title"><p>Dialog content</p></Dialog>
        <Tooltip content="Helpful context"><button type="button">Hover target</button></Tooltip>
        <Alert variant="error">Error message</Alert>
        <Toast>Saved</Toast>
      </ThemeProvider>
    );
    expect(screen.getByRole('dialog', { name: 'Modal title' })).toBeTruthy();
    expect(screen.getByRole('dialog', { name: 'Dialog title' })).toBeTruthy();
    expect(screen.getByRole('tooltip').textContent).toContain('Helpful context');
    expect(screen.getByRole('alert').textContent).toContain('Error message');
    expect(screen.getByText('Saved')).toBeTruthy();
  });

  it('renders documented form primitives with labels and states', () => {
    render(
      <ThemeProvider>
        <SearchBox label="Search companies" />
        <TextInput label="Analyst" helperText="Assigned analyst" />
        <Select label="Status"><option>Open</option></Select>
        <Checkbox label="Include reviewed" />
        <Radio label="High priority" name="priority" />
        <Toggle label="Compact density" checked readOnly />
      </ThemeProvider>
    );
    expect(screen.getByLabelText('Search companies').getAttribute('type')).toBe('search');
    expect(screen.getByLabelText(/Analyst/)).toBeTruthy();
    expect(screen.getByLabelText(/Status/)).toBeTruthy();
    expect(screen.getByLabelText('Include reviewed')).toBeTruthy();
    expect(screen.getByLabelText('High priority')).toBeTruthy();
    expect(screen.getByRole('switch', { name: 'Compact density' })).toBeTruthy();
  });

  it('renders feedback, navigation, and disclosure primitives', () => {
    const onPageChange = vi.fn();
    render(
      <ThemeProvider>
        <ProgressBar label="Coverage progress" value={50} />
        <Spinner label="Loading data" />
        <Skeleton label="Loading card" />
        <Tabs tabs={[{ id: 'one', label: 'One', content: 'First' }, { id: 'two', label: 'Two', content: 'Second' }]} />
        <Accordion items={[{ id: 'details', title: 'Details', content: 'Details content' }]} />
        <Pagination page={1} totalPages={3} onPageChange={onPageChange} />
        <Breadcrumb items={[{ label: 'Dashboard', href: '#' }, { label: 'Review Queue' }]} />
      </ThemeProvider>
    );
    expect(screen.getByRole('progressbar', { name: 'Coverage progress' })).toBeTruthy();
    expect(screen.getByRole('status', { name: 'Loading data' })).toBeTruthy();
    expect(screen.getByRole('status', { name: 'Loading card' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'One' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('button', { name: 'Details' }).getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy();
  });
});

function contrastRatio(foreground: string, background: string) {
  const fg = relativeLuminance(foreground);
  const bg = relativeLuminance(background);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map(channel => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  return [0, 2, 4].map(index => Number.parseInt(normalized.slice(index, index + 2), 16)) as [number, number, number];
}
