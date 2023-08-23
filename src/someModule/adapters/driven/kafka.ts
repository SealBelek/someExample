import { Inject, Injectable } from '@nestjs/common';
import {
  InjectService,
  KafkaController as KafkaControllerBase,
  KafkaService,
} from '../../../kafka';
import { LoggerService } from '../../../logger/logger';
import { kafka } from '../../../config';
import { ConfigType } from '@nestjs/config';
import { DTOFactory } from '../dto';
import { SomeService } from '../../application/service';
import { DTOMapper } from '../../helpers/dto.mapper';

@Injectable()
export class KafkaController extends KafkaControllerBase {
  constructor(
    @InjectService() kafkaService: KafkaService,
    @Inject(kafka.KEY)
    private readonly kafkaConfig: ConfigType<typeof kafka>,
    private readonly loggerService: LoggerService,
    private readonly dtoFactory: DTOFactory,
    private readonly dtoMapper: DTOMapper,
    private readonly someService: SomeService,
  ) {
    super(kafkaService);
    this.loggerService.debug('constructor');

    this.loggerService.setNameSpace(this.constructor.name);

    const topic = this.kafkaConfig.topics.someTopicIn;

    this.parseServiceSchema({
      topics: {
        [topic]: this.someKafkaEndpoin,
      },
    });
  }

  async someKafkaEndpoin(message: unknown): Promise<void> {
    this.loggerService.info(`incoming message: ${JSON.stringify(message)}`);

    try {
      const dto = await this.dtoFactory.dto(message);

      this.someService.process(dto, this.dtoMapper);
    } catch (e) {
      const m =
        e instanceof Error
          ? e.message
          : typeof e === 'string'
          ? e
          : 'unknown error';

      this.loggerService.error(m);
    }
  }
}
