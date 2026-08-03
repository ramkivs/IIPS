import type { GovernanceStateDTO, OperationalCockpitDTO, OperationalReviewQueueDTO } from '../contracts';
import { asOperationalCockpitDTO } from '../contracts';
import { operationalDataFixture } from '../fixtures/operationalDataFixture';

export type OperationalCockpitDataState =
  | { status: 'Idle' | 'Loading'; data: null; error: null }
  | { status: 'Ready'; data: OperationalCockpitDTO; error: null }
  | { status: 'Error'; data: null; error: Error };

export interface OperationalCockpitDataProvider {
  readonly providerId: string;
  readonly mode: 'fixture' | 'api';
  getCockpit(): Promise<OperationalCockpitDTO>;
  getReviewQueue(): Promise<OperationalReviewQueueDTO>;
  getGovernanceState(): Promise<GovernanceStateDTO>;
}

export type ProviderErrorCode =
  | 'Validation'
  | 'Authentication'
  | 'Authorization'
  | 'NotFound'
  | 'Conflict'
  | 'RateLimit'
  | 'Timeout'
  | 'Network'
  | 'Server'
  | 'Unknown';

export class OperationalCockpitProviderError extends Error {
  readonly code: ProviderErrorCode;
  readonly status?: number;
  readonly retryable: boolean;
  readonly correlationId: string;
  readonly details?: Record<string, unknown>;

  constructor({ code, message, status, retryable = false, correlationId, details }: { code: ProviderErrorCode; message: string; status?: number; retryable?: boolean; correlationId: string; details?: Record<string, unknown> }) {
    super(message);
    this.name = 'OperationalCockpitProviderError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
    this.correlationId = correlationId;
    this.details = details;
    Object.setPrototypeOf(this, OperationalCockpitProviderError.prototype);
  }
}

export type ProviderTelemetryEvent = {
  providerId: string;
  operation: 'getCockpit';
  phase: 'request:start' | 'request:success' | 'request:failure' | 'request:retry';
  correlationId: string;
  attempt: number;
  durationMs?: number;
  errorCode?: ProviderErrorCode;
};

export type FetchJson = (url: string, init?: RequestInit) => Promise<unknown>;

type ApiProviderOptions = {
  baseUrl: string;
  fetchJson: FetchJson;
  endpointVersion?: 'v1';
  timeoutMs?: number;
  retryDelaysMs?: number[];
  clientVersion?: string;
  locale?: string;
  timeZone?: string;
  correlationIdFactory?: () => string;
  telemetry?: (event: ProviderTelemetryEvent) => void;
};

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRY_DELAYS_MS = [250, 500, 1000] as const;

export class FixtureOperationalCockpitDataProvider implements OperationalCockpitDataProvider {
  readonly providerId = 'fixture-operational-cockpit-provider';
  readonly mode = 'fixture' as const;

  constructor(private readonly fixture: OperationalCockpitDTO = operationalDataFixture) {}

  async getCockpit(): Promise<OperationalCockpitDTO> { return asOperationalCockpitDTO(this.fixture); }
  async getReviewQueue(): Promise<OperationalReviewQueueDTO> { return this.fixture.reviewQueue; }
  async getGovernanceState(): Promise<GovernanceStateDTO> { return this.fixture.governanceState; }
}

export class ApiOperationalCockpitDataProvider implements OperationalCockpitDataProvider {
  readonly providerId = 'api-operational-cockpit-provider';
  readonly mode = 'api' as const;

  private cachedCockpit: OperationalCockpitDTO | null = null;

  constructor(private readonly options: ApiProviderOptions) {}

  async getCockpit(): Promise<OperationalCockpitDTO> {
    if (this.cachedCockpit) return this.cachedCockpit;
    const correlationId = this.options.correlationIdFactory?.() ?? createCorrelationId();
    const payload = await this.requestCockpit(correlationId);
    try {
      const unwrappedPayload = unwrapTransportPayload(payload);
      assertOperationalCockpitPayload(unwrappedPayload);
      const dto = asOperationalCockpitDTO(unwrappedPayload);
      this.cachedCockpit = dto;
      return dto;
    } catch (error) {
      throw new OperationalCockpitProviderError({
        code: 'Validation',
        message: 'Provider response did not conform to the Operational Cockpit DTO contract.',
        retryable: false,
        correlationId,
        details: { reason: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  async getReviewQueue(): Promise<OperationalReviewQueueDTO> {
    const cockpit = await this.getCockpit();
    return cockpit.reviewQueue;
  }

  async getGovernanceState(): Promise<GovernanceStateDTO> {
    const cockpit = await this.getCockpit();
    return cockpit.governanceState;
  }

  clearCache() {
    this.cachedCockpit = null;
  }

  private async requestCockpit(correlationId: string): Promise<unknown> {
    const retryDelays = this.options.retryDelaysMs ?? [...DEFAULT_RETRY_DELAYS_MS];
    const maxAttempts = retryDelays.length + 1;
    let lastError: OperationalCockpitProviderError | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const startedAt = Date.now();
      this.emit({ phase: 'request:start', correlationId, attempt });
      try {
        const result = await this.executeWithTimeout(this.endpoint('/operational-cockpit'), this.requestInit(correlationId), correlationId);
        this.emit({ phase: 'request:success', correlationId, attempt, durationMs: Date.now() - startedAt });
        return result;
      } catch (error) {
        const providerError = normalizeProviderError(error, correlationId);
        lastError = providerError;
        this.emit({ phase: 'request:failure', correlationId, attempt, durationMs: Date.now() - startedAt, errorCode: providerError.code });
        if (!providerError.retryable || attempt >= maxAttempts) break;
        this.emit({ phase: 'request:retry', correlationId, attempt, errorCode: providerError.code });
        await sleep(retryDelays[attempt - 1] ?? 0);
      }
    }

    throw lastError ?? new OperationalCockpitProviderError({ code: 'Unknown', message: 'Unknown provider failure.', correlationId });
  }

  private async executeWithTimeout(url: string, init: RequestInit, correlationId: string): Promise<unknown> {
    const timeoutMs = this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    if (timeoutMs <= 0) return this.options.fetchJson(url, init);

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller?.abort();
        reject(new OperationalCockpitProviderError({
          code: 'Timeout',
          message: 'Provider request timed out.',
          retryable: true,
          correlationId
        }));
      }, timeoutMs);
    });

    try {
      return await Promise.race([this.options.fetchJson(url, { ...init, signal: controller?.signal }), timeout]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  private endpoint(path: string) {
    const baseUrl = this.options.baseUrl.replace(/\/$/, '');
    const version = this.options.endpointVersion ?? 'v1';
    return `${baseUrl}/${version}${path}`;
  }

  private requestInit(correlationId: string): RequestInit {
    return {
      headers: {
        accept: 'application/json',
        'x-correlation-id': correlationId,
        'x-client-version': this.options.clientVersion ?? 'operational-cockpit-v1.1',
        'x-time-zone': this.options.timeZone ?? 'UTC',
        'x-locale': this.options.locale ?? 'en'
      }
    };
  }

  private emit(event: Omit<ProviderTelemetryEvent, 'providerId' | 'operation'>) {
    this.options.telemetry?.({ providerId: this.providerId, operation: 'getCockpit', ...event });
  }
}

export const defaultOperationalCockpitDataProvider = new FixtureOperationalCockpitDataProvider();

export function isOperationalCockpitDataProvider(value: unknown): value is OperationalCockpitDataProvider {
  const candidate = value as OperationalCockpitDataProvider;
  return Boolean(candidate?.providerId && candidate?.mode && typeof candidate.getCockpit === 'function' && typeof candidate.getReviewQueue === 'function' && typeof candidate.getGovernanceState === 'function');
}

function unwrapTransportPayload(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'data' in payload) return (payload as { data: unknown }).data;
  return payload;
}

function assertOperationalCockpitPayload(payload: unknown): asserts payload is OperationalCockpitDTO {
  if (!payload || typeof payload !== 'object') throw new Error('payload must be an object');
  const candidate = payload as Partial<OperationalCockpitDTO>;
  if (typeof candidate.cycleId !== 'string') throw new Error('cycleId is required');
  if (typeof candidate.generatedAt !== 'string') throw new Error('generatedAt is required');
  if (!candidate.portfolioHealth || typeof candidate.portfolioHealth !== 'object') throw new Error('portfolioHealth is required');
  if (!candidate.reviewQueue || typeof candidate.reviewQueue !== 'object' || !Array.isArray(candidate.reviewQueue.items)) throw new Error('reviewQueue.items is required');
  if (!candidate.coverageLedger || typeof candidate.coverageLedger !== 'object' || !Array.isArray(candidate.coverageLedger.records)) throw new Error('coverageLedger.records is required');
  if (!candidate.governanceState || typeof candidate.governanceState !== 'object') throw new Error('governanceState is required');
  if (!candidate.metrics || typeof candidate.metrics !== 'object') throw new Error('metrics is required');
}

function normalizeProviderError(error: unknown, correlationId: string): OperationalCockpitProviderError {
  if (error instanceof OperationalCockpitProviderError) return error;

  const status = typeof (error as { status?: unknown })?.status === 'number' ? (error as { status: number }).status : undefined;
  const code = providerErrorCodeFromStatus(status, error);
  return new OperationalCockpitProviderError({
    code,
    status,
    message: providerErrorMessage(code),
    retryable: isRetryableProviderFailure(code, status),
    correlationId
  });
}

function providerErrorCodeFromStatus(status: number | undefined, error: unknown): ProviderErrorCode {
  if ((error as { name?: string })?.name === 'AbortError') return 'Timeout';
  if (!status) return 'Network';
  if (status === 400) return 'Validation';
  if (status === 401) return 'Authentication';
  if (status === 403) return 'Authorization';
  if (status === 404) return 'NotFound';
  if (status === 409) return 'Conflict';
  if (status === 429) return 'RateLimit';
  if (status === 502 || status === 503 || status === 504) return 'Server';
  if (status >= 500) return 'Server';
  return 'Unknown';
}

function providerErrorMessage(code: ProviderErrorCode) {
  return `Operational cockpit provider error: ${code}.`;
}

function isRetryableProviderFailure(code: ProviderErrorCode, status: number | undefined) {
  return code === 'Network' || code === 'Timeout' || status === 502 || status === 503 || status === 504;
}

function createCorrelationId() {
  return `oc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
