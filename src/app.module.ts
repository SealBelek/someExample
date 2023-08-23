import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Middleware } from 'moleculer';

import { ReturnTypeConfig, http, moleculer, kafka, mongo } from './config';
import observability from './config/observability';
import { MoleculerModule } from './moleculer';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from './logger/logger.module';
import { LoggerService } from './logger/logger';
import { MoleculerLogger } from './logger/moleculer.logger';
import { tracing } from './tracing/opentelemetry-middleware';
import { KafkaModule } from './kafka';
import { SomeModule } from './someModule/some.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (confing: ConfigService<ReturnTypeConfig>) => {
        const mongooseConfig = confing.get('mongo', { infer: true });
        console.info(JSON.stringify(mongooseConfig));
        if (!mongooseConfig) {
          throw new Error('mongoose config error');
        }
        return mongooseConfig;
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [moleculer, http, observability, kafka, mongo],
      // validate: validate,
      cache: true,
    }),
    MoleculerModule.forRootAsync({
      imports: [ConfigModule, LoggerModule],
      useFactory: (
        config: ConfigService<ReturnTypeConfig>,
        logger: LoggerService,
      ) => {
        const moleculerConfig = config.get('moleculer', { infer: true });
        if (moleculerConfig === undefined) {
          throw new Error('moleculer config error');
        }

        logger.setNameSpace('moleculer');
        moleculerConfig.logger = new MoleculerLogger(logger);

        const middlewares: Array<Middleware | string> = [
          'ActionHook',
          'Validator',
          'Bulkhead',
          'Cacher',
          'ContextTracker',
          'CircuitBreaker',
          'Timeout',
          'Retry',
          'Fallback',
          'ErrorHandler',
        ];

        if (moleculerConfig.observabilityTracing) {
          middlewares.push(tracing());
        }

        middlewares.push('Metrics', 'Debounce', 'Throttle');

        moleculerConfig.middlewares = middlewares;

        return moleculerConfig;
      },
      inject: [ConfigService, LoggerService],
    }),
    KafkaModule.forRootAsync({
      async useFactory(
        configService: ConfigService<ReturnTypeConfig>,
        loggerService: LoggerService,
      ) {
        const config = configService.get('kafka', { infer: true });

        if (config === undefined) {
          throw new Error('Kafka config error');
        }

        return {
          logger: loggerService,
          options: {
            brokers: config.brokers,
            clientId: config.clientId,
          },
          consumer: {
            groupId: config.groupId,
          },
        };
      },
      inject: [ConfigService, LoggerService],
    }),
    LoggerModule,
    SomeModule,
  ],
})
export class AppModule {}
