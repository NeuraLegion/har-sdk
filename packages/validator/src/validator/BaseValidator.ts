import { Validator, ValidatorResult, Document } from './Validator';
import Ajv, { AnySchema, AsyncSchema, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

export abstract class BaseValidator<T extends Document>
  implements Validator<T>
{
  private readonly ajv: Ajv;

  protected constructor(schema: AnySchema | AnySchema[]) {
    this.ajv = new Ajv({
      allErrors: true,
      strict: false
    });

    addFormats(this.ajv);

    (Array.isArray(schema) ? schema : [schema]).forEach((s) =>
      this.verifySchema(s)
    );

    this.ajv.addSchema(schema);
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

      return {
        errors: [],
        valid: true
      };
    } catch (err) {
      if (!(err instanceof Ajv.ValidationError)) {
        throw err;
      }

      return {
        errors: err.errors,
        valid: false
      };
    }
  }

  private verifySchema(schema: AnySchema): void {
    if (!(schema as AsyncSchema).$async) {
      throw Error(
        'Invalid schema: the schema should support an asynchronous validation. Set the "$async" parameter in the schema. Look at https://ajv.js.org/guide/async-validation.html#asynchronous-validation for more details l'
      );
    }
  }
}
