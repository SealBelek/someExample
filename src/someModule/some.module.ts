import { Module } from '@nestjs/common';
import { MoleculerController, KafkaController } from './adapters/driven';
import { SomeService } from './application/service';
import { DTOFactory } from './adapters/dto/factory';
import { DTOMapper } from './helpers/dto.mapper';
import { RepositoryModule } from './repository/repository.module';
import { MoleculerAdapter, HttpAdapter } from './adapters/driver';
import { AdapterManager } from './services/adapter.factory';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, RepositoryModule],
  controllers: [MoleculerController, KafkaController],
  providers: [
    SomeService,
    DTOFactory,
    DTOMapper,
    MoleculerAdapter,
    HttpAdapter,
    AdapterManager,
  ],
})
export class SomeModule {}
