import { ServiceBroker } from 'moleculer';
import { InjectBroker } from '../../../moleculer';
import { MoleculerCommandPublisher } from '../../application/interfaces';
import { Commands } from './constants';
import { Injectable } from '@nestjs/common';
import { Payload } from '../../models';

@Injectable()
export class MoleculerAdapter implements MoleculerCommandPublisher {
  constructor(@InjectBroker() private readonly serviceBroker: ServiceBroker) {}

  async publishCommand(payload: Payload): Promise<void> {
    await this.serviceBroker.emit(
      Commands.SomeCommand,
      { payload },
      'company.company-service',
    );
  }
}
