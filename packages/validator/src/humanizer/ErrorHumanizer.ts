import { getMessage } from './formatters/ErrorMessageFormatter';
import { HumanizedError } from './HumanizedError';
import { ErrorObject } from 'ajv';

export class ErrorHumanizer {
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
    return getMessage(error);
  }
}
