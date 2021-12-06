import {
  ArrayFormatter,
  CustomErrorMessageFormatter,
  Formatter,
  NumericFormatter,
  ObjectFormatter,
  StringFormatter,
  TypeFormatter
} from './formatters';
import { HumanizedError, ErrorMessagePart } from './HumanizedError';
import { ErrorObject } from 'ajv';

// based on https://github.com/segmentio/action-destinations/tree/main/packages/ajv-human-errors

export class ErrorHumanizer {
  private readonly formatters: ReadonlyArray<Formatter> = [
    new ArrayFormatter(),
    new CustomErrorMessageFormatter(),
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
      ...this.humanizeErrorMessage(error)
    };
  }

  public humanizeErrorMessage(
    error: ErrorObject
  ): Omit<HumanizedError, 'originalError'> {
    const locationMessageParts = this.formatLocation(error);
    const locationMessage = locationMessageParts
      .map((part) => part.text)
      .join(' ');

    let message = this.formatters.reduce(
      (resultMessage: string, formatter: Formatter) =>
        resultMessage || formatter.format(error),
      ''
    );

    if (!message) {
      message = error.message;
    }

    return {
      message: `${locationMessage}: ${message}`,
      messageParts: [
        {
          text: message
        }
      ],
      locationParts: locationMessageParts
    };
  }

  private formatLocation(error: ErrorObject): ErrorMessagePart[] {
    return [
      {
        text: 'Error at'
      },
      {
        text:
          error.instancePath === '' ? 'the schema root' : error.instancePath,
        jsonPointer: error.instancePath
      }
    ];
  }
}
