import { LoggerService } from './logger/logger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });
  const logger = await app.resolve(LoggerService);
  logger.setNameSpace('nest');
  app.useLogger(logger);

  process.on('exit', async () => {
    await app.close();
  });
}

bootstrap();
