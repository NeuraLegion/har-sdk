import { Formatter } from './Formatter';
import { WordingHelper } from './WordingHelper';
import { ErrorObject } from 'ajv';

export class CustomErrorMessageFormatter implements Formatter {
  public format(error: ErrorObject<'errorMessage'>): string {
    if (error.keyword !== 'errorMessage') {
      return;
    }

    const propName = WordingHelper.extractPropertyName(error.instancePath);

    return error.message.replace(
      /^The property must/,
      `The property \`${propName}\` must`
    );
  }
}
