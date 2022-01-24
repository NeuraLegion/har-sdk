export class VariableError extends Error {
  public readonly variableName: string;
  public readonly jsonPointer?: string;

  constructor(message: string, variableName: string, jsonPointer?: string) {
    super(message);
    this.name = new.target.name;
    this.variableName = variableName;
    this.jsonPointer = jsonPointer;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
