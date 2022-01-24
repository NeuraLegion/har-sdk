import {
  Postman,
  removeLeadingSlash,
  removeTrailingSlash
} from '@har-sdk/core';

export class LexicalScope {
  public readonly jsonPointer: string;

  get variables(): readonly Postman.Variable[] {
    return this._variables;
  }

  private _variables: Postman.Variable[];

  constructor(jsonPointer: string, variables: Postman.Variable[]) {
    this.jsonPointer = removeTrailingSlash(jsonPointer);
    this._variables = [...variables];
  }

  public combine(scopeOrVariables: LexicalScope | Postman.Variable[]): this {
    let variables: Postman.Variable[] = [];

    if (Array.isArray(scopeOrVariables)) {
      variables = [...scopeOrVariables];
    } else if (scopeOrVariables.jsonPointer === this.jsonPointer) {
      variables = [...scopeOrVariables.variables];
    }

    this._variables.unshift(...variables);

    return this;
  }

  public concat(
    relativePath: string,
    variables: Postman.Variable[]
  ): LexicalScope {
    const aggregatedVariables = [...(variables ?? []), ...this.variables];
    const nextPointer = `${this.jsonPointer}/${removeLeadingSlash(
      relativePath
    )}`;

    return new LexicalScope(nextPointer, aggregatedVariables);
  }
}
