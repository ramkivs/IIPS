export class Logger {
  constructor({ level = 'info', sink = [] } = {}) {
    this.level = level;
    this.sink = sink;
  }
  info(message, meta = {}) { return this.#write('info', message, meta); }
  warn(message, meta = {}) { return this.#write('warn', message, meta); }
  error(message, meta = {}) { return this.#write('error', message, meta); }
  debug(message, meta = {}) { return this.#write('debug', message, meta); }
  entries() { return this.sink.slice(); }
  #write(level, message, meta) {
    const entry = Object.freeze({ at: new Date().toISOString(), level, message, meta: Object.freeze({ ...meta }) });
    this.sink.push(entry);
    return entry;
  }
}
