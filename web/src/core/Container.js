export class Container {
  #items = new Map();
  register(key, value) {
    if (!key) throw new Error('container key is required');
    if (this.#items.has(key)) throw new Error(`container key already registered: ${key}`);
    this.#items.set(key, value);
    return value;
  }
  resolve(key) {
    if (!this.#items.has(key)) throw new Error(`container key not found: ${key}`);
    return this.#items.get(key);
  }
  has(key) { return this.#items.has(key); }
  keys() { return [...this.#items.keys()]; }
}
