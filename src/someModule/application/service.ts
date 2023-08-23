import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../logger/logger';
import { Repository } from '../repository/repositories/someRepo';
import { AdapterManager } from '../services/adapter.factory';
import { Payload } from '../models/interfaces';

@Injectable()
export class SomeService {
  constructor(
    private readonly repository: Repository,
    private readonly loggerService: LoggerService,
    private readonly adapterManager: AdapterManager,
  ) {}

  async process<D>(
    dto: D,
    mapper: { map: (d: D) => Payload | null },
  ): Promise<void> {
    const payload = mapper.map(dto);

    if (payload === null) {
      throw new Error('not able map dto');
    }

    const someModel = this.repository.someModel({
      source: payload.source,
    });

    someModel.doSomething();

    await this.repository.add(someModel);

    await Promise.all([
      this.adapterManager
        .moleculerPublisher()
        .publishCommand({ source: someModel.source() }),
      this.adapterManager
        .kafkaPublisher()
        .publishCommand({ source: someModel.source() }),
    ]);
  }
}
