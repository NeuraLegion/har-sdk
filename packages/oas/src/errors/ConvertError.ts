export class ConvertError extends Error {
  public readonly jsonPointer?: string;

  constructor(message: string, jsonPointer?: string) {
    super(message);
    this.name = new.target.name;
    this.jsonPointer = jsonPointer;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
