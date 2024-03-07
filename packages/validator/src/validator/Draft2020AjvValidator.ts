import { Document } from './Validator';
import { AjvValidator } from './AjvValidator';
import Ajv, { AnySchema, Options } from 'ajv';
import Ajv2020 from 'ajv/dist/2020';

export abstract class Draft2020AjvValidator<
  T extends Document
> extends AjvValidator<T> {
  protected constructor(schemas: AnySchema[]) {
    super(schemas);
  }

  protected override createAjv(options: Options): Ajv {
    return new Ajv2020(options);
  }
}
