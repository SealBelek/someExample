import { registerAs } from '@nestjs/config';
import { PATHS } from './constants';
import { KafkaConfig } from './interfaces';
import { getNodeIdWithPrefix, getPackageName } from '../utils/os';

export default registerAs(
  PATHS.Kafka,
  (): KafkaConfig => ({
    clientId: getPackageName(),
    groupId: getNodeIdWithPrefix(getPackageName()),
    brokers: process.env.KAFKA_BROKERS
      ? process.env.KAFKA_BROKERS.split(',')
      : [],
    topics: {
      someTopicIn: process.env.SOME_TOPIC_IN || 'some-topic-in',
      someTopicOut: process.env.SOME_TOPIC_OUT || 'some-topic-out',
    },
  }),
);
