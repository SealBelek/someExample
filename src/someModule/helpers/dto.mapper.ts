import { Injectable } from '@nestjs/common';
import { SomeMessage } from '../adapters/dto';
import { Payload } from '../models/interfaces';

@Injectable()
export class DTOMapper {
  map(dto: SomeMessage): Payload {
    return {
      source: dto.source.toUpperCase() as Capitalize<Payload['source']>,
    };
  }
}
