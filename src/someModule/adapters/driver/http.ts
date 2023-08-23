import { firstValueFrom, catchError } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { InjectService, KafkaService } from '../../../kafka';
import { http, kafka } from '../../../config';
import { Payload } from '../../models';
import { DTOFactory } from '../dto';
import { KafkaPublisher } from '../../application/interfaces';
import { AxiosError } from 'axios';
import { LoggerService } from '../../../logger/logger';

@Injectable()
export class HttpAdapter implements KafkaPublisher {
  constructor(
    @InjectService() private readonly kafkaService: KafkaService,
    @Inject(kafka.KEY)
    private readonly kafkaConfig: ConfigType<typeof kafka>,
    @Inject(http.KEY)
    private readonly httpConfig: ConfigType<typeof http>,
    private readonly dtoFactory: DTOFactory,
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setNameSpace(this.constructor.name);
  }

  async publishCommand(payload: Payload): Promise<void> | never {
    await firstValueFrom(
      this.httpService
        .post(
          this.httpConfig.initRequest as string,
          this.dtoFactory.dto(payload),
        )
        .pipe(
          catchError((error: AxiosError) => {
            const message = `some error. ${error?.response?.data}`;
            this.logger.error(message);
            throw new Error(message);
          }),
        ),
    );
  }
}
