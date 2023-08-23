import { Injectable } from '@nestjs/common';
import { HttpAdapter, MoleculerAdapter } from '../adapters/driver';
import {
  KafkaPublisher,
  MoleculerCommandPublisher,
} from '../application/interfaces';

@Injectable()
export class AdapterManager {
  constructor(
    private readonly moleculer: MoleculerAdapter,
    private readonly http: HttpAdapter,
  ) {}

  /**
   * @throws {Error}
   */
  moleculerPublisher(): MoleculerCommandPublisher {
    return this.moleculer;
  }

  kafkaPublisher(): KafkaPublisher {
    return this.http;
  }
}
