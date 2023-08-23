import {
  Injectable,
  LoggerService as ILoggerService,
  Scope,
  Inject,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as winston from 'winston';
import * as Transport from 'winston-transport';
import * as url from 'url';
import config, { ObservabilityOpt } from '../config/observability';

/** Транспорт для фреймворка Winston, отправляющий обогащенные трассировкой логи в Observability Platform */
class ObservabilityTransport extends Transport {
  private observabilityEndpoint: string;
  private serviceName: string;
  private nodeID: string;
  private productID: string;
  private tenantID: string;
  private internalDebug: boolean;
  private _httpTransport: winston.transports.HttpTransportInstance;

  constructor(opts: Required<ObservabilityOpt>) {
    super();

    this.observabilityEndpoint = opts.observabilityEndpoint;
    this.serviceName = opts.serviceName;
    this.productID = opts.productID;
    this.tenantID = opts.tenantID;
    this.internalDebug = !!opts.internalDebug;
    this.nodeID = opts.nodeID;

    const logstashUrl = url.parse(this.observabilityEndpoint);
    const httpOptions: winston.transports.HttpTransportOptions = {
      port:
        logstashUrl.port !== null ? parseInt(logstashUrl.port, 10) : undefined,
      host: logstashUrl.hostname !== null ? logstashUrl.hostname : undefined,
      ssl: logstashUrl.protocol === 'https:',
      batch: true,
    };

    this._httpTransport = new winston.transports.Http(httpOptions);

    console.info(`ObservabilityTransport started`);
    if (this.internalDebug) {
      this._httpTransport.on('warn', (x) => {
        console.error(
          'ObservabilityTransport unable to send log record due to ' + x,
        );
      });
    }
  }

  log(
    info: {
      [x: string]: unknown;
      trace_id: string;
      span_id: string;
      trace_flags: string;
      message: string;
      level: string;
    },
    callback: () => void,
  ) {
    const { trace_id, span_id, trace_flags, message, level, ...meta } = info;
    const log = {
      logDate: Date.now(),
      productID: this.productID,
      tenantID: this.tenantID,
      traceID: trace_id || null,
      spanID: span_id || null,
      traceFlags: trace_flags || null,
      message: message,
      logLevel: level,
      nodeID: this.nodeID,
      serviceName: this.serviceName,
      loggerName: 'Winston.ObservabilityTransport',
      ...meta,
    };

    this._httpTransport.log?.(log, callback);
  }
}

type LoggerOptions = Parameters<typeof winston.createLogger>[0];

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements ILoggerService {
  private readonly logger: winston.Logger;
  private namespace: string;
  constructor(
    @Inject(config.KEY)
    private readonly cfg: ConfigType<typeof config>,
  ) {
    this.namespace = '';
    const logTransports: Array<winston.transport> = [
      new winston.transports.Console(),
    ];

    const validate = (opt: unknown): opt is Required<ObservabilityOpt> =>
      !Object.values(this.cfg).some((v) => v === undefined);

    if (validate(this.cfg)) {
      logTransports.push(new ObservabilityTransport(this.cfg));
    }

    const options: LoggerOptions = {
      transports: logTransports,
      level: cfg.logLevel,
    };

    this.logger = winston.createLogger(options);
  }

  setNameSpace(namespace: string) {
    this.namespace = namespace;
  }

  log(message: string, ...optionalParams: unknown[]) {
    this.logger.info(message, { namespace: this.namespace }, ...optionalParams);
  }

  info(message: string, ...optionalParams: unknown[]) {
    this.logger.info(message, { namespace: this.namespace }, ...optionalParams);
  }

  error(message: string, ...optionalParams: unknown[]) {
    this.logger.error(
      message,
      { namespace: this.namespace },
      ...optionalParams,
    );
  }

  warn(message: string, ...optionalParams: unknown[]) {
    this.logger.warn(message, { namespace: this.namespace }, ...optionalParams);
  }

  debug(message: string, ...optionalParams: unknown[]) {
    this.logger.debug(
      message,
      { namespace: this.namespace },
      ...optionalParams,
    );
  }

  verbose(message: string, ...optionalParams: unknown[]) {
    this.logger.verbose(
      message,
      { namespace: this.namespace },
      ...optionalParams,
    );
  }

  silly(message: string, ...optionalParams: unknown[]) {
    this.logger.silly(
      message,
      { namespace: this.namespace },
      ...optionalParams,
    );
  }
}
