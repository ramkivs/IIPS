export class HealthService {
  constructor({ container, config }) { this.container = container; this.config = config; }
  status() {
    return Object.freeze({
      status: 'ok',
      appName: this.config.appName,
      platformVersion: this.config.platformVersion,
      environment: this.config.environment,
      registeredServices: this.container.keys()
    });
  }
}
