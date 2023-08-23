import { Injectable } from '@nestjs/common';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { ValidatorOptions, validateOrReject } from 'class-validator';
import { SomeDTO } from './sync';
import { SomeMessage } from './interface';

@Injectable()
export class DTOFactory {
  private transformOptions: ClassTransformOptions;
  private validatorOptions: ValidatorOptions;
  constructor() {
    this.transformOptions = {
      excludeExtraneousValues: true,
    };

    this.validatorOptions = {
      whitelist: true,
      stopAtFirstError: true,
    };
  }

  async dto(object: unknown): Promise<SomeMessage> | never {
    const someDTO = plainToInstance(SomeDTO, object, this.transformOptions);

    await validateOrReject(someDTO, this.validatorOptions);

    return {
      source: someDTO.source,
    };
  }
}
