import { MongooseModuleOptions } from '@nestjs/mongoose';
import { BrokerOptions } from 'moleculer';
import { PATHS } from './constants';

export interface MoleculerConfig extends BrokerOptions {
  [key: string]: unknown;
  observabilityTracing: boolean;
}

export interface HttpConfig {
  proxy: {
    http?: string;
    https?: string;
  };
  timeout?: number; // millis
  initRequest?: string;
}

export interface KafkaConfig {
  clientId: string;
  brokers: Array<string>;
  groupId: string;
  topics: {
    someTopicIn: string;
    someTopicOut: string;
  };
}

type MongoConfing = MongooseModuleOptions;

export interface ReturnTypeConfig {
  [PATHS.Moleculer]: MoleculerConfig;
  [PATHS.HttpClient]: HttpConfig;
  [PATHS.Kafka]: KafkaConfig;
  [PATHS.Mongo]: MongoConfing;
}
