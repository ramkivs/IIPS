export class RouteRegistry {
  #routes = new Map();

  register(route) {
    for (const key of ['path', 'workspaceId', 'label']) {
      if (!route?.[key]) throw new Error(`Route ${key} is required`);
    }
    if (this.#routes.has(route.path)) throw new Error(`Route already registered: ${route.path}`);
    const record = Object.freeze({ featureFlag: null, navigation: true, ...route });
    this.#routes.set(record.path, record);
    return record;
  }

  resolve(path) { return this.#routes.get(path) || null; }
  list() { return Object.freeze([...this.#routes.values()]); }
}
