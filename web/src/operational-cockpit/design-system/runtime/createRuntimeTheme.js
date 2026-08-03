import { operationalCockpitTokens } from '../tokens/index.js';

export const RUNTIME_DESIGN_SYSTEM_VERSION = 'Runtime Design System v1.0';

export function createCssVariables(tokens = operationalCockpitTokens, { prefix = 'iips' } = {}) {
  const entries = flattenTokens(tokens);
  return Object.freeze(Object.fromEntries(entries.map(([key, value]) => [`--${prefix}-${key}`, String(value)])));
}

export function createCssVariableText(tokens = operationalCockpitTokens, options = {}) {
  const variables = createCssVariables(tokens, options);
  return `:root {\n${Object.entries(variables).map(([key, value]) => `  ${key}: ${value};`).join('\n')}\n}`;
}

export function createTheme({ name = 'default', tokens = operationalCockpitTokens, highContrast = false } = {}) {
  const cssVariables = createCssVariables(tokens);
  return deepFreeze({
    name,
    version: RUNTIME_DESIGN_SYSTEM_VERSION,
    highContrast,
    cssVariables,
    cssText: createCssVariableText(tokens),
    ownsBusinessLogic: false,
    guardrail: 'Runtime theme owns visual values only and must not define operational semantics.'
  });
}

export class ThemeRuntime {
  constructor({ initialTheme = createTheme() } = {}) {
    this.currentTheme = initialTheme;
  }

  getTheme() { return this.currentTheme; }

  setTheme(theme) {
    if (!theme?.cssVariables) throw new Error('theme.cssVariables is required');
    this.currentTheme = deepFreeze({ ...theme });
    return this.currentTheme;
  }

  applyToElement(element) {
    if (!element?.style) throw new Error('A DOM-like element with style is required');
    for (const [name, value] of Object.entries(this.currentTheme.cssVariables)) element.style.setProperty(name, value);
    return true;
  }
}

function flattenTokens(value, path = []) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) => flattenTokens(child, [...path, camelToKebab(key)]));
  }
  return [[path.join('-'), value]];
}

function camelToKebab(value) { return value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`); }

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
