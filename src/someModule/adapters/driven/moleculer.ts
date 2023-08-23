import { Injectable } from '@nestjs/common';
import { Context, Service, ServiceBroker } from 'moleculer';

import { InjectBroker } from '../../../moleculer';
import { LoggerService } from '../../../logger/logger';
import { SomeService } from '../../application/service';
import { Payload } from '../../models/interfaces';

@Injectable()
export class MoleculerController extends Service {
  constructor(
    @InjectBroker() broker: ServiceBroker,
    private readonly loggerService: LoggerService,
    private readonly someService: SomeService,
  ) {
    super(broker);

    this.loggerService.setNameSpace(this.constructor.name);

    this.parseServiceSchema({
      name: 'someName',
      events: {
        'some.event': {
          handler: this.somethingCreated,
          params: {
            $$strict: 'remove',
            source: { type: 'string' },
          },
        },
      },
    });
  }

  async somethingHappend(
    ctx: Context<{ id?: string; payload: Payload }>,
  ): Promise<void> {
    this.loggerService.info(
      `event: ${ctx.eventName}, payload: ${JSON.stringify(ctx.params.payload)}`,
    );

    await this.someService
      .process(ctx.params.payload, { map: (d) => d })
      .catch((e) => this.loggerService.error(e));
  }
}
