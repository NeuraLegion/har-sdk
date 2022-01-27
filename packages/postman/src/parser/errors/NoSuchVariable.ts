import { ConvertError } from './ConvertError';

export class NoSuchVariable extends ConvertError {
  public readonly variableName: string;

  constructor(variableName: string, jsonPointer?: string) {
    super(`Undefined variable: \`${variableName}\``, jsonPointer);
    this.variableName = variableName;
  }
}
