import { Formatter } from './Formatter';
import { WordingHelper } from './WordingHelper';
import { ErrorObject } from 'ajv';

export class CustomErrorMessageFormatter implements Formatter {
  public canProcessKeyword(keyword: string): boolean {
    return keyword === 'errorMessage';
  }

  public format(error: ErrorObject<'errorMessage'>): string {
    const target = WordingHelper.humanizeTarget(error.instancePath);

    return error.message.replace(/^The property must/, `${target} must`);
  }
}
