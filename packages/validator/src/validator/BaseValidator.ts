import { Validator, ValidatorResult } from './Validator';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { Collection } from '@har-sdk/types';
import { join } from 'path';

export abstract class BaseValidator<T extends Collection.Document>
  implements Validator<T>
{
  private readonly ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: false
    });

    addFormats(this.ajv);
  }

  protected abstract getSchemaId(document: T): string;

  public async verify(document: T): Promise<ValidatorResult> {
    const schemaId = this.getSchemaId(document);
    const validate: ValidateFunction | undefined = this.ajv.getSchema(schemaId);

    if (!validate) {
      throw new Error(
        'Cannot determine version of schema. Schema ID is missed.'
      );
    }

    try {
      await validate(document);

      return { errors: [] };
    } catch (err) {
      if (!(err instanceof Ajv.ValidationError)) {
        throw err;
      }

      return { errors: err.errors };
    }
  }

  protected loadSchemas(pathsToSchemas: ReadonlyArray<string>): void {
    pathsToSchemas.forEach((x: string) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const schema = require(join('../../', x));
      this.ajv.addSchema(schema);
    });
  }
}
