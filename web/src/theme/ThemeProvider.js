import { ShellEventType, publishShellEvent } from '../shell/events.js';

export class ThemeProvider {
  constructor({ themeRegistry, defaultTheme = 'system', eventBus, diagnostics } = {}) {
    this.themeRegistry = themeRegistry;
    this.eventBus = eventBus;
    this.diagnostics = diagnostics;
    if (!this.themeRegistry.get(defaultTheme)) throw new Error(`Unknown default theme: ${defaultTheme}`);
    this.currentTheme = defaultTheme;
  }

  getTheme() { return this.themeRegistry.get(this.currentTheme); }

  setTheme(themeId) {
    const theme = this.themeRegistry.get(themeId);
    if (!theme) throw new Error(`Unknown theme: ${themeId}`);
    this.currentTheme = themeId;
    publishShellEvent({ eventBus: this.eventBus, diagnostics: this.diagnostics, type: ShellEventType.ThemeChanged, payload: { theme: themeId }, source: 'ThemeProvider' });
    return theme;
  }
}
