import {
  ArrayFormatter,
  Formatter,
  NumericFormatter,
  ObjectFormatter,
  StringFormatter,
  TypeFormatter
} from './formatters';
import { HumanizedError } from './HumanizedError';
import { ErrorObject } from 'ajv';

// based on https://github.com/segmentio/action-destinations/tree/main/packages/ajv-human-errors

export class ErrorHumanizer {
  private readonly formatters: ReadonlyArray<Formatter> = [
    new ArrayFormatter(),
    new NumericFormatter(),
    new ObjectFormatter(),
    new StringFormatter(),
    new TypeFormatter()
  ];

  public humanizeErrors(errors: ErrorObject[]): HumanizedError[] {
    return errors.map(this.humanizeError.bind(this));
  }

  public humanizeError(error: ErrorObject): HumanizedError {
    return {
      originalError: error,
      message: this.humanizeErrorMessage(error)
    };
  }

  public humanizeErrorMessage(error: ErrorObject): string {
    const location = this.formatLocation(error);

    let message = this.formatters.reduce(
      (resultMessage: string, formatter: Formatter) =>
        resultMessage || formatter.format(error),
      ''
    );

    if (!message) {
      message = error.message;
    }

    return `${location} ${message}`;
  }

  private formatLocation(error: ErrorObject): string {
    return error.instancePath === ''
      ? 'the root value'
      : `the value at ${error.instancePath}`;
  }
}
