import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { KafkaModuleOptions } from './interfaces/kafka-options';
import { Consumer, Kafka, Producer, logLevel, logCreator } from 'kafkajs';
import { LoggerService } from '../logger/logger';

type Listener = (topic: string, message: unknown) => Promise<void>;

@Injectable()
export class KafkaService
  implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap
{
  private kafka: Kafka;

  private producer: Producer;

  private consumer?: Consumer;

  private topics: Set<string> = new Set();

  private listeners: Array<Listener> = [];

  private readonly logger: LoggerService;

  constructor({ logger, options, producer, consumer }: KafkaModuleOptions) {
    this.logger = logger;
    this.logger.setNameSpace(this.constructor.name);

    this.kafka = new Kafka({
      brokers: options.brokers,
      clientId: options.clientId,
      logCreator: this.logCreator(),
    });

    this.producer = this.kafka.producer(producer);
    if (consumer) {
      this.consumer = this.kafka.consumer(consumer);
    }
  }

  async onModuleInit() {
    this.logger.info('Init KafkaService');
    await this.connect();
  }

  async onApplicationBootstrap() {
    if (this.consumer) {
      this.logger.info(
        `Subscribe kafka topics ${Array.from(this.topics).toString()}}`,
      );

      await this.consumer.subscribe({
        topics: Array.from(this.topics),
        fromBeginning: true,
      });

      this.logger.info('Listen each message');
      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          try {
            const buffer = message.value;
            this.logger.debug(
              `Topic: ${topic}, Message: ${buffer?.toString()}`,
            );

            if (buffer === null) {
              return;
            }

            const parsed = JSON.parse(buffer.toString());
            await Promise.all(this.listeners.map((v) => v(topic, parsed)));
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : typeof err === 'string'
                ? err
                : 'unknown error';

            this.logger.error(message);
          }
        },
      });
    }
  }

  async connect(): Promise<void> {
    this.logger.info('Connect kafka');
    const promises = [this.producer.connect()];
    if (this.consumer) {
      promises.push(this.consumer.connect());
    }

    await Promise.all(promises);
  }

  async onModuleDestroy() {
    this.logger.info('Destroy kafka');
    await this.disconnect();
  }

  async disconnect(): Promise<void> {
    this.logger.info('disconnect kafka');
    const promises = [this.producer.disconnect()];
    if (this.consumer) {
      promises.push(this.consumer.disconnect());
    }

    await Promise.all(promises);
  }

  addTopic(topic: string) {
    if (this.consumer === undefined) {
      throw new Error('Consumer wasnt created');
    }

    this.logger.info(`Add topic ${topic}`);
    this.topics.add(topic);
  }

  addListener(listener: (topic: string, message: unknown) => Promise<void>) {
    this.logger.info('Add listener kafka');
    this.listeners.push(listener);
  }

  async produce(topic: string, message: object) {
    await this.producer.send({
      topic: topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }

  private logCreator(): logCreator {
    const toWinstonLogLevel = (level: number) => {
      switch (level) {
        case logLevel.ERROR:
        case logLevel.NOTHING:
          return 'error';
        case logLevel.WARN:
          return 'warn';
        case logLevel.INFO:
          return 'info';
        case logLevel.DEBUG:
          return 'debug';
        default:
          return 'info';
      }
    };

    const WinstonLogCreator: logCreator = (logLevel) => {
      return (entry) => {
        const level = entry.level > logLevel ? logLevel : entry.level;
        this.logger[toWinstonLogLevel(level)](entry.log.message);
      };
    };

    return WinstonLogCreator;
  }
}
