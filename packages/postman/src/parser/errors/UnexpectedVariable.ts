import { VariableError } from './VariableError';

export class UnexpectedVariable extends VariableError {
  constructor(variableName: string, jsonPointer?: string) {
    super(
      `Unexpected value of \`${variableName}\` variable`,
      variableName,
      jsonPointer
    );
  }
}
