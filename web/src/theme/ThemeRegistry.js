export class ThemeRegistry {
  #themes = new Map();

  register(theme) {
    if (!theme?.themeId) throw new Error('themeId is required');
    if (this.#themes.has(theme.themeId)) throw new Error(`Theme already registered: ${theme.themeId}`);
    const record = Object.freeze({ label: theme.themeId, mode: theme.themeId, ...theme });
    this.#themes.set(record.themeId, record);
    return record;
  }

  get(themeId) { return this.#themes.get(themeId) || null; }
  list() { return Object.freeze([...this.#themes.values()]); }
}

export function createDefaultThemeRegistry() {
  const registry = new ThemeRegistry();
  registry.register({ themeId: 'light', label: 'Light', mode: 'light' });
  registry.register({ themeId: 'dark', label: 'Dark', mode: 'dark' });
  registry.register({ themeId: 'system', label: 'System', mode: 'system' });
  return registry;
}
