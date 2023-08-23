import { SomeDocument } from '../repository/schemas/some';

export class SomeModel {
  constructor(private doc: SomeDocument) {}

  doSomething() {
    // TODO: do something
    // emit domain event of model
  }

  source() {
    return this.getSource();
  }

  private getSource() {
    return this._doc().source;
  }
  _doc(): SomeDocument {
    return this.doc;
  }
}
