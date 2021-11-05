import { ErrorCondenser } from './ErrorCondenser';
import { Validator, Document } from './Validator';
import Ajv, {
  AnySchema,
  AsyncSchema,
  ValidateFunction,
  ErrorObject
} from 'ajv';
import addFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';

export abstract class BaseValidator<T extends Document>
  implements Validator<T>
{
  private readonly ajv: Ajv;

  protected constructor(schemas: AnySchema[]) {
    this.ajv = new Ajv({
      allErrors: true,
      strict: false
    });

    addFormats(this.ajv);
    ajvErrors(this.ajv);

    schemas.forEach((s) => this.verifySchema(s));

    this.ajv.addSchema(schemas);
  }

  protected abstract getSchemaId(document: T): string;

  public async verify(document: T): Promise<ErrorObject[]> {
    const schemaId = this.getSchemaId(document);
    const validateFn: ValidateFunction = schemaId
      ? this.ajv.getSchema(schemaId)
      : null;

    if (!validateFn) {
      throw new Error('Unsupported or invalid specification version');
    }

    try {
      await validateFn(document);

      return [];
    } catch (err) {
      if (!(err instanceof Ajv.ValidationError)) {
        throw err;
      }

      return new ErrorCondenser(err.errors as ErrorObject[]).condense();
    }
  }

  private verifySchema(schema: AnySchema): void {
    if (!(schema as AsyncSchema).$async) {
      throw Error(
        'Invalid schema: the schema should support an asynchronous validation. Set the "$async" parameter in the schema. Look at https://ajv.js.org/guide/async-validation.html#asynchronous-validation for more details'
      );
    }
  }
}
