import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import {
  KafkaModuleAsyncOptions,
  KafkaModuleOptions,
} from './interfaces/kafka-options';
import { DEFAULT_KAFKA_SERVICE_NAME, KAFKA_MODULE_OPTIONS } from './constants';
import { KafkaService } from './kafka.service';

@Global()
@Module({})
export class KafkaModule {
  static forRootAsync(options: KafkaModuleAsyncOptions): DynamicModule {
    const kafkaServiceProvider = {
      provide: options.serviceName ?? DEFAULT_KAFKA_SERVICE_NAME,
      useFactory: (kafkaModuleOptions: KafkaModuleOptions) => {
        return new KafkaService(kafkaModuleOptions);
      },
      inject: [KAFKA_MODULE_OPTIONS],
    };

    const createKafkaOptionsProvider =
      this.createModuleOptionsProvider(options);

    return {
      module: KafkaModule,
      imports: options.imports || [],
      providers: [createKafkaOptionsProvider, kafkaServiceProvider],
      exports: [kafkaServiceProvider],
    };
  }

  private static createModuleOptionsProvider(
    options: KafkaModuleAsyncOptions,
  ): Provider {
    return {
      provide: KAFKA_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }
}
