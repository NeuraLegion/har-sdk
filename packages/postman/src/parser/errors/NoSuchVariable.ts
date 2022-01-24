export class NoSuchVariable extends Error {
  public readonly variableName: string;
  public readonly jsonPointer?: string;

  constructor(variableName: string, jsonPointer?: string) {
    super(`Undefined variable: \`${variableName}\``);
    this.name = new.target.name;
    this.variableName = variableName;
    this.jsonPointer = jsonPointer;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
