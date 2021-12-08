import { Formatter } from './Formatter';
import { ErrorObject } from 'ajv';

export abstract class BaseFormatter implements Formatter {
  protected readonly supportedKeywords: Readonly<Set<string>>;

  public abstract format(error: ErrorObject): string | undefined;

  public canProcessKeyword(keyword: string): boolean {
    return this.supportedKeywords.has(keyword);
  }
}
