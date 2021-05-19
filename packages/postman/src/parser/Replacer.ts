export class Replacer {
  private _substitutions = 0;

  get substitutions(): number {
    return this._substitutions;
  }

  private _replacements = 0;

  get replacements(): number {
    return this._replacements;
  }

  constructor(private value: string = '') {}

  public replace(
    regex: RegExp,
    strategy: string | ((...args: string[]) => string)
  ): this {
    let replacements = 0;

    this.value = this.value.replace(
      regex,
      typeof strategy === 'function'
        ? (...args: string[]) => {
            replacements += 1;

            return strategy(...args);
          }
        : () => {
            replacements += 1;

            return strategy;
          }
    );

    if (replacements) {
      this._substitutions += 1;
    }

    return this;
  }

  public valueOf(): string {
    return this.value;
  }

  public toString(): string {
    return this.value;
  }
}
