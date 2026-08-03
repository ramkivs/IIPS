export const Environment = Object.freeze({
  development: 'development',
  test: 'test',
  staging: 'staging',
  production: 'production'
});

export function normalizeEnvironment(value = 'development') {
  const env = String(value || '').toLowerCase();
  if (!Object.values(Environment).includes(env)) {
    throw new Error(`Unsupported environment: ${value}`);
  }
  return env;
}
