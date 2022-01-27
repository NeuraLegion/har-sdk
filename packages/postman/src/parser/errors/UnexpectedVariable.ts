import { ConvertError } from './ConvertError';

export class UnexpectedVariable extends ConvertError {
  public readonly variableName: string;

  constructor(variableName: string, jsonPointer?: string) {
    super(`Unexpected value of \`${variableName}\` variable`, jsonPointer);
    this.variableName = variableName;
  }
}
