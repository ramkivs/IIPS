import { EventBus, CommandBus, InMemoryEventStore } from '../../../../packages/event-bus/src/index.js';
import { ModuleRegistry } from '../../../../packages/module-registry/src/index.js';
import { CapabilityRegistry, PluginRegistry } from '../../../../packages/plugin-framework/src/index.js';
import { FeatureFlagRegistry } from '../../../../packages/feature-flags/src/index.js';
import { MethodologyRegistry } from '../../../../packages/methodology-registry/src/index.js';
import { ConfigLoader } from '../config/ConfigLoader.js';
import { Container } from '../core/Container.js';
import { DiagnosticsService } from '../diagnostics/DiagnosticsService.js';
import { HealthService } from '../health/HealthService.js';
import { Logger } from '../logging/Logger.js';

export function createApp({ env = process.env, overrides = {} } = {}) {
  const diagnostics = new DiagnosticsService();
  diagnostics.start();

  const config = new ConfigLoader({ env }).load(overrides);
  const container = new Container();
  const logger = new Logger({ level: config.logLevel });
  const eventStore = new InMemoryEventStore();
  const eventBus = new EventBus({ eventStore });
  const commandBus = new CommandBus({ eventBus });
  const moduleRegistry = new ModuleRegistry({ eventBus });
  const capabilityRegistry = new CapabilityRegistry({ eventBus });
  const pluginRegistry = new PluginRegistry({ moduleRegistry, capabilityRegistry, eventBus });
  const featureFlagRegistry = new FeatureFlagRegistry();
  const methodologyRegistry = new MethodologyRegistry();

  container.register('config', config);
  container.register('logger', logger);
  container.register('diagnostics', diagnostics);
  container.register('eventStore', eventStore);
  container.register('eventBus', eventBus);
  container.register('commandBus', commandBus);
  container.register('moduleRegistry', moduleRegistry);
  container.register('capabilityRegistry', capabilityRegistry);
  container.register('pluginRegistry', pluginRegistry);
  container.register('featureFlagRegistry', featureFlagRegistry);
  container.register('methodologyRegistry', methodologyRegistry);

  const healthService = new HealthService({ container, config });
  container.register('healthService', healthService);

  logger.info('application.bootstrap', {
    platformVersion: config.platformVersion,
    environment: config.environment,
    enabledModules: config.enabledModules,
    enabledPlugins: config.enabledPlugins
  });

  diagnostics.complete();

  return Object.freeze({
    config,
    container,
    logger,
    diagnostics,
    healthService,
    start: () => {
      logger.info('application.start');
      return healthService.status();
    },
    shutdown: () => {
      logger.info('application.shutdown');
      return true;
    }
  });
}
