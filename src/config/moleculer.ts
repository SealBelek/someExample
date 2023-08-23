import { registerAs } from '@nestjs/config';
import { getNodeIdWithPrefix, getPackageName } from '../utils/os';
import { MoleculerConfig } from './interfaces';
import { PATHS } from './constants';

export default registerAs(
  PATHS.Moleculer,
  (): MoleculerConfig => ({
    validator: true,
    observabilityTracing: !!process.env.TRACE_COLLECTOR_ENDPOINT,
    nodeID: process.env.SB_NODE_ID || getNodeIdWithPrefix(getPackageName()),
    namespace: process.env.SB_NAMESPACE || '',
    transporter: process.env.SB_TRANSPORTER || 'NATS',
    cacher: process.env.SB_CACHER || 'memory',
    serializer: process.env.SB_CACHER || 'JSON',
    requestTimeout: process.env.SB_REQUEST_TIMEOUT
      ? parseInt(process.env.SB_REQUEST_TIMEOUT)
      : 10000,
    maxCallLevel: process.env.SB_MAX_CALL_LEVEL
      ? parseInt(process.env.SB_MAX_CALL_LEVEL)
      : 100,
    heartbeatInterval: process.env.SB_HEARTBEAT_INTERVAL
      ? parseInt(process.env.SB_HEARTBEAT_INTERVAL)
      : 5,
    heartbeatTimeout: process.env.SB_HEARTBEAT_TIMEOUT
      ? parseInt(process.env.SB_HEARTBEAT_TIMEOUT)
      : 15,
    circuitBreaker: {
      enabled: false,
    },
    // Disable built-in tracing
    tracing: {
      enabled: false,
    },
    retryPolicy: {
      enabled: process.env.SB_REQUEST_RETRY_COUNT
        ? parseInt(process.env.SB_REQUEST_RETRY_COUNT) > 0
        : false,
      retries: process.env.SB_REQUEST_RETRY_COUNT
        ? parseInt(process.env.SB_REQUEST_RETRY_COUNT)
        : 0,
      delay: process.env.SB_REQUEST_RETRY_DELAY
        ? parseInt(process.env.SB_REQUEST_RETRY_DELAY)
        : 0,
      maxDelay: process.env.SB_REQUEST_RETRY_MAX_DELAY
        ? parseInt(process.env.SB_REQUEST_RETRY_MAX_DELAY)
        : 0,
    },
    registry: {
      strategy: process.env.SB_REGISTRY_STRATEGY || 'RoundRobin',
      preferLocal: true,
    },
  }),
);
