import { Replacer } from './Replacer';
import { BaseVariableParser } from './BaseVariableParser';
import { Generators } from './generators';
import { NoSuchVariable } from './errors';
import { LexicalScope } from './LexicalScope';
import { Postman } from '@har-sdk/core';

export class EnvVariableParser extends BaseVariableParser {
  private readonly REGEX_EXTRACT_VARS = /{{([^{}]*?)}}/g;
  private readonly VARS_SUBSTITUTIONS_LIMIT = 30;

  constructor(generators: Generators) {
    super(generators);
  }

  public parse(value: string, scope: LexicalScope): string {
    let replacer = new Replacer(value);

    do {
      replacer = replacer.replace(
        this.REGEX_EXTRACT_VARS,
        (match: string, token: string) => this.replace({ match, token, scope })
      );
    } while (
      replacer.replacements &&
      replacer.substitutions < this.VARS_SUBSTITUTIONS_LIMIT
    );

    return replacer.valueOf();
  }

  private replace({
    match,
    token,
    scope
  }: {
    match: string;
    token: string;
    scope: LexicalScope;
  }): string {
    const variable: Postman.Variable | undefined = this.find(token, scope);

    if (!variable) {
      throw new NoSuchVariable(token, scope.jsonPointer);
    }

    return variable.value ?? match;
  }
}
