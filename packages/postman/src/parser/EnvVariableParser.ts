import { Replacer } from './Replacer';
import { BaseVariableParser } from './BaseVariableParser';
import { Generators } from './generators';
import { NoSuchVariable } from './errors';
import { Postman } from '@har-sdk/core';

export class EnvVariableParser extends BaseVariableParser {
  private readonly REGEX_EXTRACT_VARS = /{{([^{}]*?)}}/g;
  private readonly VARS_SUBSTITUTIONS_LIMIT = 30;

  constructor(variables: Postman.Variable[], generators: Generators) {
    super(variables, generators);
  }

  public parse(value: string): string {
    let replacer = new Replacer(value);

    do {
      replacer = replacer.replace(
        this.REGEX_EXTRACT_VARS,
        (match: string, token: string) => this.replace(match, token)
      );
    } while (
      replacer.replacements &&
      replacer.substitutions < this.VARS_SUBSTITUTIONS_LIMIT
    );

    return replacer.valueOf();
  }

  private replace(match: string, token: string): string {
    let variable: Postman.Variable | (() => unknown) | undefined =
      this.find(token);

    if (typeof variable === 'function') {
      variable = {
        value: variable()?.toString()
      };
    }

    if (!variable) {
      throw new NoSuchVariable(token);
    }

    return variable.value ?? match;
  }
}
