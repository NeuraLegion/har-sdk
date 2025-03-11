import { AjvValidator } from './AjvValidator';
import schema from '../schemas/har/v1.2.json';
import { Har } from '@har-sdk/core';

export class HarValidator extends AjvValidator<Har> {
  private readonly SCHEMA_KEY_REF =
    'https://github.com/ahmadnassri/har-spec/blob/master/versions/1.2.md/';

  constructor() {
    super([schema]);
  }

  protected getSchemaKeyRef(): string {
    return this.SCHEMA_KEY_REF;
  }
}
