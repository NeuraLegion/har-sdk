import {
  Postman,
  removeLeadingSlash,
  removeTrailingSlash
} from '@har-sdk/core';

export class LexicalScope {
  public readonly jsonPointer: string;
  private readonly variables: Postman.Variable[];

  constructor(jsonPointer: string, variables: Postman.Variable[] = []) {
    this.jsonPointer = removeTrailingSlash(jsonPointer);
    this.variables = [...variables];
  }

  public combine(scopeOrVariables: LexicalScope | Postman.Variable[]): this {
    let variables: Postman.Variable[] = [];

    if (Array.isArray(scopeOrVariables)) {
      variables = [...scopeOrVariables];
    } else if (scopeOrVariables.jsonPointer === this.jsonPointer) {
      variables = [...scopeOrVariables.variables];
    }

    this.variables.unshift(...variables);

    return this;
  }

  public concat(
    relativePath: string,
    variables: Postman.Variable[]
  ): LexicalScope {
    const aggregatedVariables = [...variables, ...this.variables];
    const nextPointer = `${this.jsonPointer}/${removeLeadingSlash(
      relativePath
    )}`;

    return new LexicalScope(nextPointer, aggregatedVariables);
  }

  public find(
    predicate: (
      value: Postman.Variable,
      index: number,
      obj: Postman.Variable[]
    ) => unknown,
    thisArg?: unknown
  ): Postman.Variable | undefined {
    return this.variables.find(predicate, thisArg ?? this);
  }

  public [Symbol.iterator](): IterableIterator<Postman.Variable> {
    return this.variables[Symbol.iterator]();
  }
}
