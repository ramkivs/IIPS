import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCssVariables,
  createCssVariableText,
  createTheme,
  ThemeRuntime,
  renderButton,
  renderBadge,
  renderDataTable,
  renderEmptyState,
  createLayoutPrimitive,
  createResponsiveRule,
  createFocusRingAttributes,
  createAriaLabel,
  createLiveRegion,
  createVisuallyHiddenStyle,
  prefersReducedMotion,
  createKeyboardActivationHandler,
  visualRegressionBaseline
} from '../src/operational-cockpit/index.js';

test('Runtime Design System exposes CSS custom properties from approved tokens', () => {
  const vars = createCssVariables();
  const css = createCssVariableText();

  assert.equal(vars['--iips-color-status-high'], '#b42318');
  assert.equal(vars['--iips-spacing-md'], '16');
  assert.equal(css.includes(':root'), true);
  assert.equal(css.includes('--iips-color-background-page'), true);
});

test('ThemeRuntime applies visual variables without business semantics', () => {
  const theme = createTheme({ name: 'default' });
  const runtime = new ThemeRuntime({ initialTheme: theme });
  const applied = [];
  const element = { style: { setProperty(name, value) { applied.push([name, value]); } } };

  assert.equal(theme.ownsBusinessLogic, false);
  assert.equal(runtime.applyToElement(element), true);
  assert.equal(applied.some(([name]) => name === '--iips-color-status-high'), true);
});

test('Primitive rendering layer returns framework-agnostic render descriptors', () => {
  const button = renderButton({ label: 'Review' }, ['Review']);
  const badge = renderBadge({ label: 'Certified' });
  const table = renderDataTable({ 'aria-label': 'Active Review Queue' });
  const empty = renderEmptyState({ title: 'No active reviews' });

  assert.equal(button.tagName, 'button');
  assert.equal(button.attributes.type, 'button');
  assert.equal(badge.ownsBusinessLogic, false);
  assert.equal(table.tagName, 'table');
  assert.equal(empty.attributes.role, 'status');
  assert.equal(Object.isFrozen(button), true);
});

test('Layout primitives are reusable and free of operational logic', () => {
  const shell = createLayoutPrimitive('AppShell', { columns: 3 });
  const stack = createLayoutPrimitive('Stack', { gap: 'md' });
  const rule = createResponsiveRule({ breakpoint: 'tablet', behavior: 'stack drawer below workspace' });

  assert.equal(shell.ownsBusinessLogic, false);
  assert.equal(stack.usesRuntimeTokens, true);
  assert.equal(rule.minWidth, 768);
  assert.throws(() => createLayoutPrimitive('ReviewQueueBusinessLayout'));
});

test('Accessibility runtime provides shared keyboard, ARIA, live-region, and reduced-motion utilities', () => {
  let activated = false;
  const handler = createKeyboardActivationHandler({ onActivate: () => { activated = true; } });
  handler.onKeyDown({ key: 'Enter', preventDefault() {} });

  assert.equal(activated, true);
  assert.equal(createFocusRingAttributes()['data-focus-visible'], 'true');
  assert.deepEqual(createAriaLabel('Evidence Quality'), { 'aria-label': 'Evidence Quality' });
  assert.equal(createLiveRegion({ politeness: 'assertive' }).role, 'alert');
  assert.equal(createVisuallyHiddenStyle().position, 'absolute');
  assert.equal(prefersReducedMotion({ matchMedia: () => ({ matches: true }) }), true);
});

test('Visual regression baseline documents component states without configuring tooling prematurely', () => {
  assert.equal(visualRegressionBaseline.version, 'Visual Regression Baseline v1.0');
  assert.equal(visualRegressionBaseline.captureTooling.includes('Not configured'), true);
  assert.equal(visualRegressionBaseline.componentStates.Badge.includes('Incomplete'), true);
  assert.equal(visualRegressionBaseline.componentStates.RefreshIndicator.includes('Failed'), true);
  assert.equal(visualRegressionBaseline.acceptance.includes('no business logic introduced in visual states'), true);
});
