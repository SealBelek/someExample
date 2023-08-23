import { OTLPTraceExporter as OTLPTraceExporterHttpJson } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPTraceExporter as OTLPTraceExporterGrpc } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPTraceExporter as OTLPTraceExporterProto } from '@opentelemetry/exporter-trace-otlp-proto';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { MongooseInstrumentation } from 'opentelemetry-instrumentation-mongoose';
import { SemanticResourceAttributes as ResourceAttributesSC } from '@opentelemetry/semantic-conventions';
import { dockerCGroupV1Detector } from '@opentelemetry/resource-detector-docker';
import { Resource } from '@opentelemetry/resources';
import {
  BatchSpanProcessor,
  SpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { B3Propagator, B3InjectEncoding } from '@opentelemetry/propagator-b3';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

import { getPackageName, getNodeIdWithPrefix } from './utils/os';

interface Config {
  logLevel: LogLevelString;
  exporter: TraceExporter;
  serviceName: string;
  otlpCollectorEndpoint?: string;
}

const logLevels = [
  'NONE',
  'ERROR',
  'WARN',
  'INFO',
  'DEBUG',
  'VERBOSE',
  'ALL',
] as const;
type LogLevelString = (typeof logLevels)[number];

const exporters = ['grpc', 'http/json', 'http/protobuf'] as const;
type TraceExporter = (typeof exporters)[number];

function validateEnv<T extends string, R extends Array<T>>(
  env: T,
  test: Readonly<R>,
) {
  if (!test.includes(env)) {
    throw Error(`incorrect value ${env} please, set env correctly: ${test}`);
  }
}

function getExporter(cfg: Config): SpanExporter {
  switch (cfg.exporter) {
    case 'grpc':
      return new OTLPTraceExporterGrpc({
        url: cfg.otlpCollectorEndpoint,
      });
    case 'http/json':
      return new OTLPTraceExporterHttpJson({
        url: cfg.otlpCollectorEndpoint,
      });
    case 'http/protobuf':
      return new OTLPTraceExporterProto({
        url: cfg.otlpCollectorEndpoint,
      });
    default:
      throw new Error('not able to get otlp exporter');
  }
}

function addPrefix(str: string, prefix: string): string {
  return `${prefix}.${str}`;
}

const config: Config = {
  logLevel: (process.env.TRACE_DIAG_LOG_LEVEL as LogLevelString) ?? 'NONE',
  exporter: (process.env.TRACE_EXPORTER as TraceExporter) ?? 'grpc',
  // если нет SB_NODE_ID и сервис дублируется, то будет одинаковое имя
  // пока все серисы в одно экземпляре, значит все в порядке
  serviceName: process.env.SB_NODE_ID || addPrefix(getPackageName(), 'Some'),
  otlpCollectorEndpoint: process.env.TRACE_COLLECTOR_ENDPOINT,
};

if (config.otlpCollectorEndpoint !== undefined) {
  validateEnv(config.logLevel, logLevels);

  validateEnv(config.exporter, exporters);

  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel[config.logLevel]);
  const otelSDK = new NodeSDK({
    spanProcessor: new BatchSpanProcessor(getExporter(config)),
    instrumentations: [
      new WinstonInstrumentation(),
      new HttpInstrumentation(),
      new MongooseInstrumentation(),
    ],
    textMapPropagator: new B3Propagator({
      injectEncoding: B3InjectEncoding.MULTI_HEADER,
    }),
    resource: Resource.default().merge(
      new Resource({
        [ResourceAttributesSC.SERVICE_NAME]: config.serviceName,
        nodeID: process.env.SB_NODE_ID || getNodeIdWithPrefix(getPackageName()),
      }),
    ),
    resourceDetectors: [dockerCGroupV1Detector],
    autoDetectResources: true,
  });

  otelSDK.start();
  console.info('tracing started');

  process.on('SIGTERM', () => {
    otelSDK
      .shutdown()
      .then(
        () => console.log('SDK shut down successfully'),
        (err) => console.log('Error shutting down SDK', err),
      )
      .finally(() => process.exit(0));
  });
}
