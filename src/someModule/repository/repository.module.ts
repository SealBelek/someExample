import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Repository } from './repositories/someRepo';
import { Some, SyncSchema } from './schemas/some';

@Module({
  providers: [Repository],
  imports: [
    MongooseModule.forFeature([{ name: Some.name, schema: SyncSchema }]),
  ],
  exports: [Repository],
})
export class RepositoryModule {}
