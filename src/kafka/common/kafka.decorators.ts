import { Inject } from '@nestjs/common';
import { DEFAULT_KAFKA_SERVICE_NAME } from '../constants';

export const InjectService = (name?: string) =>
  Inject(name ?? DEFAULT_KAFKA_SERVICE_NAME);
