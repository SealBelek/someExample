import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Source } from '../../models/interfaces';

export type SomeDocument = mongoose.HydratedDocument<Some>;

@Schema({
  collection: 'somes',
})
export class Some {
  @Prop({ type: mongoose.Schema.Types.String, require: true })
  source!: Source;

  @Prop({ type: mongoose.Schema.Types.Date, default: Date.now })
  created_at!: Date;
}

export const SyncSchema = SchemaFactory.createForClass(Some);
