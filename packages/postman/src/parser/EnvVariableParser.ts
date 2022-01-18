import { ParserOptions } from './ParserOptions';
import { Replacer } from './Replacer';
import { BaseVariableParser } from './BaseVariableParser';
import { Generators } from './generators';
import { Postman } from '@har-sdk/core';

export class EnvVariableParser extends BaseVariableParser {
  private readonly REGEX_EXTRACT_VARS = /{{([^{}]*?)}}/g;
  private readonly VARS_SUBSTITUTIONS_LIMIT = 30;

  constructor(
    variables: Postman.Variable[],
    generators: Generators,
    options: ParserOptions = {}
  ) {
    super(variables, generators, options);
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
    let variable: Postman.Variable | (() => any) | undefined = this.find(token);

    if (!variable && this.isDryRun()) {
      throw new Error(`Undefined variable: \`${token}\``);
    }

    if (typeof variable === 'function') {
      variable = {
        value: variable()?.toString()
      };
    }

    if (!variable || !variable.value) {
      return match;
    }

    return variable.value;
  }
}
