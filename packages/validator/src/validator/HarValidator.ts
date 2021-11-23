import { BaseValidator } from './BaseValidator';
import schema from '../schemas/har/v1.2.json';
import { Har } from '@har-sdk/types';

export class HarValidator extends BaseValidator<Har> {
  private readonly SCHEMA_ID =
    'http://www.softwareishard.com/blog/har-12-spec/';

  constructor() {
    super([schema]);
  }

  protected getSchemaId(_: Har): string {
    return this.SCHEMA_ID;
  }
}
