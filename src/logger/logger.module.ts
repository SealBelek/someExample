import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger';

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
