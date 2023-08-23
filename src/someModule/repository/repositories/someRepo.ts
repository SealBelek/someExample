import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Some, SomeDocument } from '../schemas/some';
import { SomeModel } from '../../models/some.mod';
import { Source } from '../../models';

interface InitModel {
  source: Source;
}

@Injectable()
export class Repository {
  constructor(
    @InjectModel(Some.name)
    private readonly model: mongoose.Model<SomeDocument>,
  ) {}

  someModel(init: InitModel): SomeModel {
    const doc = new this.model(init);

    return new SomeModel(doc);
  }

  async someModelOfId(id: string): Promise<SomeModel | null> {
    const doc = await this.model.findById(id);

    if (doc === null) return null;

    return new SomeModel(doc);
  }

  async add(model: SomeModel): Promise<void> {
    if (model._doc().isNew || model._doc().isModified()) {
      model._doc().save();
    }
  }
}
