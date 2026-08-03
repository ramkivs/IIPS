import { normalizeEnvironment } from './Environment.js';

const DEFAULTS = Object.freeze({
  appName: 'Institutional Investment Platform',
  platformVersion: '0.1.0-foundation',
  apiBaseUrl: 'http://localhost:3000',
  logLevel: 'info',
  enabledModules: ['workflow', 'design-system', 'application-shell'],
  enabledPlugins: [],
  featureFlags: {}
});

export class ConfigLoader {
  constructor({ env = process.env } = {}) {
    this.env = env;
  }

  load(overrides = {}) {
    const config = {
      ...DEFAULTS,
      environment: normalizeEnvironment(this.env.IIPS_ENV || this.env.NODE_ENV || 'development'),
      apiBaseUrl: this.env.IIPS_API_BASE_URL || DEFAULTS.apiBaseUrl,
      logLevel: this.env.IIPS_LOG_LEVEL || DEFAULTS.logLevel,
      ...overrides
    };
    return validateConfig(config);
  }
}

export function validateConfig(config) {
  const required = ['appName', 'platformVersion', 'environment', 'apiBaseUrl', 'logLevel'];
  for (const key of required) {
    if (!config[key]) throw new Error(`Missing required config: ${key}`);
  }
  if (!Array.isArray(config.enabledModules)) throw new Error('enabledModules must be an array');
  if (!Array.isArray(config.enabledPlugins)) throw new Error('enabledPlugins must be an array');
  if (typeof config.featureFlags !== 'object' || Array.isArray(config.featureFlags)) throw new Error('featureFlags must be an object');
  return Object.freeze({ ...config, enabledModules: Object.freeze([...config.enabledModules]), enabledPlugins: Object.freeze([...config.enabledPlugins]), featureFlags: Object.freeze({ ...config.featureFlags }) });
}
