import { LoggerBindings, Loggers } from 'moleculer';
import { LoggerService } from './logger';

export class MoleculerLogger extends Loggers.Base {
  constructor(private readonly logger: LoggerService) {
    super();
  }
  getLogHandler(
    bindings?: LoggerBindings | undefined,
  ): Loggers.LogHandler | null {
    const meta = { ...bindings };

    return (type: string, args: Array<unknown>) => {
      const message: string = args.shift() as string;

      switch (type) {
        case 'info':
          return this.logger.info(message, ...args, meta);
        case 'fatal':
        case 'error':
          return this.logger.error(message, ...args, meta);
        case 'warn':
          return this.logger.warn(message, ...args, meta);
        case 'debug':
          return this.logger.debug(message, ...args, meta);
        case 'trace':
          return this.logger.info(message, ...args, meta);
        default: {
          return this.logger.info(message, ...args, meta);
        }
      }
    };
  }
}
