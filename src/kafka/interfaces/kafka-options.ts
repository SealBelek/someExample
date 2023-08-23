import { ModuleMetadata } from '@nestjs/common';
import { ConsumerConfig, ProducerConfig } from 'kafkajs';
import { LoggerService } from '../../logger/logger';

export interface KafkaModuleOptions {
  options: {
    clientId: string;
    brokers: Array<string>;
  };
  producer?: ProducerConfig;
  consumer?: ConsumerConfig;
  logger: LoggerService;
}

export interface KafkaModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  serviceName?: string;
  useFactory: (...args: any[]) => Promise<KafkaModuleOptions>;
  inject: any[];
}
