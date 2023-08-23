import { SOURCES, SomeMessage, SourcesType } from './interface';
import { Expose } from 'class-transformer';
import { IsIn } from 'class-validator';

export class SomeDTO implements Omit<SomeMessage, 'payload'> {
  @Expose()
  @IsIn(SOURCES)
  source!: SourcesType;
}
